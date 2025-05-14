
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CallList from "./CallList";
import { Input } from "./ui/input";

const CallLogsTab = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { agentId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const apiKey = 'key_a1bb2ca857089316392d48972a6f'; // This would ideally be in an env var
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

  const filteredCalls = calls.filter(call => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      call.call_id?.toLowerCase().includes(query) ||
      call.call_status?.toLowerCase().includes(query) ||
      call.transcript?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search calls..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={fetchCalls} 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
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
      
      <CallList calls={filteredCalls} loading={loading} />
    </div>
  );
};

export default CallLogsTab;
