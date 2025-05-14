
import { useEffect, useState } from "react";
import { Search, Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CallLogsTab = () => {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { agentId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  
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

  const formatDate = (timestamp: string) => {
    if (!timestamp) return "N/A";
    try {
      return format(new Date(timestamp), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDuration = (call: any) => {
    if (!call.start_timestamp || !call.end_timestamp) return "N/A";
    
    try {
      const start = new Date(call.start_timestamp).getTime();
      const end = new Date(call.end_timestamp).getTime();
      const durationMs = end - start;
      
      if (isNaN(durationMs) || durationMs < 0) return "N/A";
      
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return "N/A";
    }
  };

  const getSentimentColor = (sentiment: string | undefined) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "neutral":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleRowClick = (call: any) => {
    setSelectedCall(call);
    setDialogOpen(true);
  };

  const getSummary = (call: any) => {
    // First check if we have a call_analysis with call_summary
    if (call.call_analysis?.call_summary) {
      return call.call_analysis.call_summary;
    }
    
    if (call.summary) return call.summary;
    
    if (call.transcript) {
      // Generate a simple summary based on first few words
      const words = call.transcript.split(' ').slice(0, 30);
      return `${words.join(' ')}... [Automatically generated summary]`;
    }
    
    return "No summary available for this call.";
  };

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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                </TableRow>
              ))
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No calls found
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call) => {
                const sentiment = call.call_analysis?.user_sentiment || "Unknown";
                const successful = call.call_analysis?.call_successful ? "Yes" : "No";
                
                return (
                  <TableRow 
                    key={call.call_id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(call)}
                  >
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
                      {formatDate(call.start_timestamp)}
                    </TableCell>
                    <TableCell>
                      {formatDuration(call)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sentiment.toLowerCase() === "positive" ? "bg-green-100 text-green-800" :
                        sentiment.toLowerCase() === "negative" ? "bg-red-100 text-red-800" :
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
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(call);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Call Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Call Details
              {selectedCall && (
                <Badge className={getStatusColor(selectedCall.call_status)}>
                  {selectedCall?.call_status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <>
              <div className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Call ID:</span>
                    <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">{selectedCall.call_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(selectedCall)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Start Time:</span>
                    <span className="font-medium">{formatDate(selectedCall.start_timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">End Time:</span>
                    <span className="font-medium">{formatDate(selectedCall.end_timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="summary">
                      <Info className="w-4 h-4 mr-2" />
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="transcript">
                      <Info className="w-4 h-4 mr-2" />
                      Transcript
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="overflow-auto max-h-[50vh] px-1">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-2 text-gray-700">Call Summary</h3>
                        <p className="text-gray-600">{getSummary(selectedCall)}</p>
                      </div>
                      
                      {/* Call Analysis Details */}
                      {selectedCall.call_analysis && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="font-medium mb-3 text-gray-700">Call Analysis</h3>
                          <div className="space-y-3">
                            {selectedCall.call_analysis.user_sentiment && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">User Sentiment:</span>
                                <Badge className={getSentimentColor(selectedCall.call_analysis.user_sentiment)}>
                                  {selectedCall.call_analysis.user_sentiment}
                                </Badge>
                              </div>
                            )}
                            
                            {typeof selectedCall.call_analysis.call_successful === 'boolean' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Call Outcome:</span>
                                <span className="text-sm font-medium">
                                  {selectedCall.call_analysis.call_successful ? "Successful" : "Unsuccessful"}
                                </span>
                              </div>
                            )}
                            
                            {typeof selectedCall.call_analysis.in_voicemail === 'boolean' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Voicemail:</span>
                                <span className="text-sm font-medium">
                                  {selectedCall.call_analysis.in_voicemail ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="transcript" className="overflow-auto max-h-[50vh] px-1">
                    {selectedCall.transcript ? (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h3 className="font-medium mb-2 text-gray-700">Transcript</h3>
                        <p className="text-gray-600 whitespace-pre-line">{selectedCall.transcript}</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No transcript available for this call.
                      </div>
                    )}
                    
                    {selectedCall.recording_url && (
                      <div className="bg-gray-50 p-3 mt-4 rounded-md">
                        <h3 className="font-medium mb-2 text-gray-700">
                          Audio Recording
                        </h3>
                        <audio 
                          controls 
                          src={selectedCall.recording_url}
                          className="w-full"
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallLogsTab;
