import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  agentId: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, newAgentId: string) => Promise<{
    success: boolean;
    rateLimited: boolean;
    retryAfter?: number;
    error?: string;
  }>;
  verifyOTP: (email: string, token: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  userEmail: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  agentId: "",
  login: async () => {},
  logout: async () => {},
  register: async () => ({ success: false, rateLimited: false }),
  verifyOTP: async () => false,
  resendOTP: async () => false,
  userEmail: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agentId, setAgentId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check current auth status when the app loads
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setIsAuthenticated(true);
          setUserEmail(user.email);
          
          // Get the agent ID from user metadata or profiles table
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('agent_id')
            .eq('user_id', user.id)
            .single();
            
          if (profile?.agent_id) {
            setAgentId(profile.agent_id);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email);
          
          // Get the agent ID from user metadata or profiles table
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('agent_id')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile?.agent_id) {
            setAgentId(profile.agent_id);
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
          setAgentId("");
        }
      }
    );
    
    checkAuth();
    
    // Clean up subscription when unmounting
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const register = async (email: string, password: string, newAgentId: string): Promise<{
    success: boolean;
    rateLimited: boolean;
    retryAfter?: number;
    error?: string;
  }> => {
    try {
      // Get the current site URL for redirects
      const redirectUrl = window.location.origin + '/login';
      
      // Register the user with email confirmation required
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        // Check for rate limiting errors
        if (error.message.toLowerCase().includes("rate limit")) {
          // Try to parse retry time from error message if available
          const retryTimeMatch = error.message.match(/try again in (\d+)s/i);
          const retryAfter = retryTimeMatch ? parseInt(retryTimeMatch[1], 10) : 60;
          
          toast.error(`Too many registration attempts. Please try again later.`);
          return { 
            success: false, 
            rateLimited: true,
            retryAfter, 
            error: error.message 
          };
        } else {
          toast.error(error.message || "Registration failed");
          return { 
            success: false, 
            rateLimited: false, 
            error: error.message 
          };
        }
      }
      
      if (data.user) {
        // Create a profile record with the agent ID
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              user_id: data.user.id,
              agent_id: newAgentId,
              email: email
            }
          ]);
          
        if (profileError) {
          toast.error(profileError.message || "Failed to create user profile");
          return { 
            success: false, 
            rateLimited: false,
            error: profileError.message 
          };
        }
        
        // Set temporary email for verification process
        setUserEmail(email);
        
        toast.success("Registration successful! Please check your email for verification code.");
        return { success: true, rateLimited: false };
      }
      return { success: false, rateLimited: false, error: "Unknown registration error" };
    } catch (error: any) {
      const errorMsg = error.message || "Registration failed";
      toast.error(errorMsg);
      return { 
        success: false, 
        rateLimited: errorMsg.toLowerCase().includes("rate limit"), 
        error: errorMsg 
      };
    }
  };

  const verifyOTP = async (email: string, token: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) {
        toast.error("Invalid or expired verification code");
        return false;
      }
      
      if (data.user) {
        // Get the agent ID from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('agent_id')
          .eq('user_id', data.user.id)
          .single();
          
        if (profileError) {
          toast.error("Failed to retrieve profile information");
          return false;
        }
        
        // Update context state
        setIsAuthenticated(true);
        setUserEmail(email);
        
        if (profile?.agent_id) {
          setAgentId(profile.agent_id);
        }
        
        toast.success("Email verified! You are now logged in.");
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Verification failed");
      return false;
    }
  };

  const resendOTP = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      
      if (error) {
        if (error.message.includes("rate limit")) {
          toast.error("Too many verification attempts. Please try again later.");
        } else {
          toast.error(error.message || "Failed to resend verification code");
        }
        return false;
      }
      
      toast.success("Verification code has been resent to your email");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification code");
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        setIsAuthenticated(true);
        setUserEmail(email);
        
        // Get the agent ID from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('agent_id')
          .eq('user_id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile?.agent_id) {
          setAgentId(profile.agent_id);
        }
        
        toast.success("Login successful!");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUserEmail(null);
      setAgentId("");
      toast.success("You have been logged out");
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      agentId, 
      login, 
      logout, 
      register,
      verifyOTP,
      resendOTP,
      userEmail,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
