
import { useState } from "react";
import CallList from "@/components/CallList";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { agentId, userEmail, logout } = useAuth();

  const apiKey = 'key_a1bb2ca857089316392d48972a6f';
  const apiUrl = 'https://api.retellai.com/v2/list-calls';

  const fetchCalls = async () => {
    if (!agentId) {
      toast.error("No agent ID found for your account");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          filter_criteria: { agent_id: [agentId] },
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCalls(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length > 0) {
        toast.success(`Successfully loaded ${data.length} calls`);
      } else {
        toast.info("No calls found for this agent ID");
      }
      
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'An error occurred while fetching calls');
      toast.error("Failed to load calls");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Header />
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{userEmail}</span>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center my-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-2">
              Currently using Agent ID:
              <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded ml-2">
                {agentId}
              </span>
            </div>
          </div>
          <Button 
            onClick={fetchCalls} 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Fetch Calls</span>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <CallList calls={calls} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
