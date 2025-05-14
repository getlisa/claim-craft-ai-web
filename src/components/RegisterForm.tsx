import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Key, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegisterFormProps {
  onRegisterSuccess: (email: string) => void;
}

const RegisterForm = ({ onRegisterSuccess }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agentId, setAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();

  // Handle countdown for rate limiting
  useEffect(() => {
    let countdownInterval: number;
    
    if (rateLimited && retryCountdown > 0) {
      countdownInterval = window.setInterval(() => {
        setRetryCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [rateLimited, retryCountdown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Don't allow registration attempts during rate limiting
    if (rateLimited) {
      toast.error(`Please wait ${retryCountdown} seconds before trying again`);
      return;
    }
    
    setIsLoading(true);
    
    if (!email || !password || !confirmPassword || !agentId) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!agentId.startsWith("agent_")) {
      setError("Agent ID must start with 'agent_'");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(email, password, agentId);
      
      // Handle rate limiting
      if (result.rateLimited) {
        setRateLimited(true);
        setRetryCountdown(result.retryAfter || 60); // Default to 60 seconds if no retry time provided
        setError(`Too many registration attempts. Please try again in ${result.retryAfter || 60} seconds.`);
      } else if (result.success) {
        onRegisterSuccess(email);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {rateLimited && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200">
          <AlertDescription>
            Too many attempts. You can try again in {retryCountdown} seconds.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-email"
            type="email"
            placeholder="name@example.com"
            className="pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={rateLimited}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={rateLimited}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={rateLimited}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="agent-id">Agent ID</Label>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="agent-id"
            type="text"
            placeholder="agent_..."
            className="pl-10"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            disabled={rateLimited}
          />
        </div>
        <p className="text-xs text-gray-500">Enter your Agent ID (starts with 'agent_')</p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || rateLimited}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">↻</span>
            Creating Account...
          </>
        ) : rateLimited ? (
          <>
            <span className="mr-2">{retryCountdown}</span>
            Try again soon...
          </>
        ) : (
          <>
            <User className="mr-2 h-4 w-4" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
