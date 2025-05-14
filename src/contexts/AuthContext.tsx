
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  agentId: string;
  login: (email: string, password: string, agentId: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, agentId: string) => Promise<void>;
  userEmail: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  agentId: "",
  login: async () => {},
  logout: async () => {},
  register: async () => {},
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

  const register = async (email: string, password: string, newAgentId: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
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
          
        if (profileError) throw profileError;
        
        toast.success("Registration successful! Please check your email for verification.");
        setIsAuthenticated(true);
        setUserEmail(email);
        setAgentId(newAgentId);
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
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
      userEmail,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
