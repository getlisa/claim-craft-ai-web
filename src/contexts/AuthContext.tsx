
import React, { createContext, useState, useEffect, useContext } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  agentId: string;
  login: (email: string, password: string, agentId: string) => void;
  logout: () => void;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  agentId: "",
  login: () => {},
  logout: () => {},
  userEmail: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agentId, setAgentId] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedAgentId = localStorage.getItem("agentId");
    const storedEmail = localStorage.getItem("userEmail");
    
    if (storedAgentId && storedEmail) {
      setIsAuthenticated(true);
      setAgentId(storedAgentId);
      setUserEmail(storedEmail);
    }
  }, []);

  const login = (email: string, password: string, newAgentId: string) => {
    // In a real app, you would validate credentials with a backend
    // For now, we're just storing in localStorage
    localStorage.setItem("agentId", newAgentId);
    localStorage.setItem("userEmail", email);
    setIsAuthenticated(true);
    setAgentId(newAgentId);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem("agentId");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setAgentId("");
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, agentId, login, logout, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
