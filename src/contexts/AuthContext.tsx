import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  agentId: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, newAgentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  userEmail: string | null;
  isLoading: boolean;
  userRole: 'admin' | 'user' | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  agentId: "",
  login: async () => false,
  logout: async () => {},
  register: async () => ({ success: false }),
  userEmail: null,
  isLoading: true,
  userRole: null,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agentId, setAgentId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    // Check current auth status when the app loads
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setIsAuthenticated(true);
          setUserEmail(user.email);
          
          // Get the agent ID and role from user metadata or profiles table
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('agent_id, role')
            .eq('user_id', user.id)
            .single();
            
          if (profile?.agent_id) {
            setAgentId(profile.agent_id);
            setUserRole(profile.role || 'user');
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
          setAgentId("");
          setUserRole(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUserEmail(null);
        setAgentId("");
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email);
          
          // Get the agent ID and role from user metadata or profiles table
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('agent_id, role')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile?.agent_id) {
            setAgentId(profile.agent_id);
            setUserRole(profile.role || 'user');
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
          setAgentId("");
          setUserRole(null);
        }
        setIsLoading(false);
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
    error?: string;
  }> => {
    try {
      // Register user with automatic sign-in
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            agent_id: newAgentId
          },
          emailRedirectTo: null,
        }
      });
      
      if (error) {
        toast.error(error.message || "Registration failed");
        return { 
          success: false,
          error: error.message 
        };
      }
      
      if (data.user) {
        // Create a profile record with the agent ID and default role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              user_id: data.user.id,
              agent_id: newAgentId,
              email: email,
              role: 'admin' // First user is admin
            }
          ]);
          
        if (profileError) {
          toast.error(profileError.message || "Failed to create user profile");
          return { 
            success: false,
            error: profileError.message 
          };
        }
        
        // Auto sign-in the user after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          toast.error(signInError.message || "Auto login failed after registration");
          return { 
            success: false,
            error: signInError.message 
          };
        }
        
        setIsAuthenticated(true);
        setUserEmail(email);
        setAgentId(newAgentId);
        setUserRole('admin');
        
        toast.success("Registration successful! You are now logged in.");
        return { success: true };
      }
      
      return { success: false, error: "Unknown registration error" };
    } catch (error: any) {
      const errorMsg = error.message || "Registration failed";
      toast.error(errorMsg);
      return { 
        success: false,
        error: errorMsg 
      };
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message || "Login failed");
        setIsLoading(false);
        return false;
      }
      
      if (data.user) {
        setIsAuthenticated(true);
        setUserEmail(email);
        
        // Get the agent ID and role from the profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('agent_id, role')
          .eq('user_id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile?.agent_id) {
          setAgentId(profile.agent_id);
          setUserRole(profile.role || 'user');
        }
        
        toast.success("Login successful!");
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      setIsLoading(true);
      
      // Clear local state first
      setIsAuthenticated(false);
      setUserEmail(null);
      setAgentId("");
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Logout successful");
      toast.success("You have been logged out");
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error(error.message || "Logout failed");
      // Reset auth state even if logout fails
      setIsAuthenticated(false);
      setUserEmail(null);
      setAgentId("");
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      agentId, 
      login, 
      logout, 
      register,
      userEmail,
      isLoading,
      userRole,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
