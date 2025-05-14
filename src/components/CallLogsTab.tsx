
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Auto-fetch calls when component loads
  useEffect(() => {
    fetchCalls();
  }, [agentId]);

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
      <div className="flex flex-col mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search calls..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Call ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Success</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No calls found
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => {
                const callSummary = call.call_analysis?.call_summary || "No summary available";
                const sentiment = call.call_analysis?.user_sentiment || "Unknown";
                const successful = call.call_analysis?.call_successful ? "Yes" : "No";
                const callDate = call.created_at ? new Date(call.created_at) : null;
                
                return (
                  <TableRow key={call.call_id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {call.call_id ? call.call_id.substring(0, 8) + "..." : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        call.call_status === "completed" ? "bg-green-100 text-green-800" :
                        call.call_status === "failed" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {call.call_status || "unknown"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {callDate ? callDate.toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      {call.duration ? `${Math.floor(call.duration / 60)}:${String(call.duration % 60).padStart(2, '0')}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sentiment === "Positive" ? "bg-green-100 text-green-800" :
                        sentiment === "Negative" ? "bg-red-100 text-red-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {sentiment}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        successful === "Yes" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {successful}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CallLogsTab;
