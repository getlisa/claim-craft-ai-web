
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Loader2, RefreshCw } from "lucide-react";

interface DashboardTabProps {
  initialCalls: any[];
  initialLoading: boolean;
  dataLoaded: boolean;
  refreshCalls: () => Promise<void>;
  updateCall: (updatedCall: any) => void;
}

// Function to get sentiment color
const getSentimentColor = (sentiment: string | undefined) => {
  if (!sentiment) return "#9CA3AF"; // gray for undefined
  switch (sentiment.toLowerCase()) {
    case "positive": return "#10B981"; // green
    case "neutral": return "#6366F1"; // indigo
    case "negative": return "#EF4444"; // red
    default: return "#9CA3AF"; // gray for unknown
  }
};

const DashboardTab = ({
  initialCalls,
  initialLoading,
  dataLoaded,
  refreshCalls,
  updateCall
}: DashboardTabProps) => {
  const [loading, setLoading] = useState(initialLoading);
  const [calls, setCalls] = useState<any[]>(initialCalls);
  
  // Update local state when props change
  useEffect(() => {
    setCalls(initialCalls);
    setLoading(initialLoading);
  }, [initialCalls, initialLoading]);
  
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshCalls();
      toast.success("Calls refreshed successfully");
    } catch (error) {
      console.error("Error refreshing calls:", error);
      toast.error("Failed to refresh calls");
    } finally {
      setLoading(false);
    }
  };
  
  // Get latest 5 calls
  const latestCalls = [...calls]
    .sort((a, b) => new Date(b.start_timestamp).getTime() - new Date(a.start_timestamp).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={loading} variant="outline" className="flex gap-2 items-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Calls
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <CardDescription>All recorded calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Appointments</CardTitle>
            <CardDescription>From all calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calls.filter(call => call.appointment_status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Calls</CardTitle>
            <CardDescription>Successfully finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calls.filter(call => call.call_status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Latest Calls Section */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Calls</CardTitle>
          <CardDescription>Your 5 most recent calls</CardDescription>
        </CardHeader>
        <CardContent>
          <CallList calls={latestCalls} loading={loading} updateCall={updateCall} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
