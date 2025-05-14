
import { useState } from "react";
import CallList from "@/components/CallList";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = 'key_a1bb2ca857089316392d48972a6f';
  const agentId = 'agent_00dd3c10297c91790778fc176e';
  const apiUrl = 'https://api.retellai.com/v2/list-calls';

  const fetchCalls = async () => {
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
      
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'An error occurred while fetching calls');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        <div className="flex justify-center my-6">
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
