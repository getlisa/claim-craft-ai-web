
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Loader2, RefreshCw, Phone } from "lucide-react";

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

// Helper function to format phone numbers
const formatPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) return "Unknown";
  
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid US number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // If not a standard format, return as is but add a + if it seems international
  return cleaned.length > 10 ? `+${cleaned}` : phoneNumber;
};

const DashboardTab = ({
  initialCalls,
  initialLoading,
  dataLoaded,
  refreshCalls,
  updateCall
}: DashboardTabProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calls, setCalls] = useState<any[]>(initialCalls);
  
  // Update local state when props change
  useEffect(() => {
    setCalls(initialCalls);
  }, [initialCalls]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCalls();
      toast.success("Calls refreshed successfully");
    } catch (error) {
      console.error("Error refreshing calls:", error);
      toast.error("Failed to refresh calls");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Get latest 5 calls
  const latestCalls = [...calls]
    .sort((a, b) => new Date(b.start_timestamp).getTime() - new Date(a.start_timestamp).getTime())
    .slice(0, 5);
  
  // Process calls to ensure they display phone numbers for CallList
  const processedCalls = latestCalls.map(call => ({
    ...call,
    // If the CallList component uses call_id for display, we override it with formatted phone number
    display_name: formatPhoneNumber(call.from_number),
    // Add an icon to display next to the phone number
    icon: <Phone className="h-4 w-4 mr-1 text-gray-500" />
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={isRefreshing || initialLoading} variant="outline" className="flex gap-2 items-center">
            {(isRefreshing || initialLoading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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
          <CallList calls={processedCalls} loading={initialLoading} updateCall={updateCall} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
