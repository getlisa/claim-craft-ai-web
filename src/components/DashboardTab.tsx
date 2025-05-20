
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DashboardTabProps {
  initialCalls: any[];
  initialLoading: boolean;
  dataLoaded: boolean;
  refreshCalls: () => Promise<void>;
  updateCall: (updatedCall: any) => void;
}

const DashboardTab = ({
  initialCalls,
  initialLoading,
  dataLoaded,
  refreshCalls,
  updateCall
}: DashboardTabProps) => {
  const [loading, setLoading] = useState(initialLoading);
  const [calls, setCalls] = useState<any[]>(initialCalls);
  const [activeTab, setActiveTab] = useState("all");
  
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
  
  // Get last 5 calls sorted by timestamp
  const recentCalls = [...calls]
    .sort((a, b) => new Date(b.start_timestamp).getTime() - new Date(a.start_timestamp).getTime())
    .slice(0, 5);
  
  // Prepare data for sentiment chart
  const sentimentData = [
    { name: "Positive", value: calls.filter(call => call.user_sentiment === "positive").length },
    { name: "Neutral", value: calls.filter(call => call.user_sentiment === "neutral").length },
    { name: "Negative", value: calls.filter(call => call.user_sentiment === "negative").length },
  ].filter(item => item.value > 0);
  
  // Prepare data for call status chart
  const callStatusData = [
    { name: "Completed", value: calls.filter(call => call.call_status === "completed").length },
    { name: "Scheduled", value: calls.filter(call => call.appointment_status === "scheduled").length },
    { name: "In Progress", value: calls.filter(call => call.call_status === "in_progress").length },
  ].filter(item => item.value > 0);
  
  // Colors for charts
  const SENTIMENT_COLORS = ["#4ade80", "#94a3b8", "#f87171"];
  const CALL_STATUS_COLORS = ["#3b82f6", "#8b5cf6", "#fbbf24"];
  
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
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>User Sentiment</CardTitle>
            <CardDescription>How callers felt during conversations</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Call Status</CardTitle>
            <CardDescription>Distribution of call outcomes</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={callStatusData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="#8884d8">
                  {callStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CALL_STATUS_COLORS[index % CALL_STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Calls Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Your 5 most recent calls</CardDescription>
        </CardHeader>
        <CardContent>
          <CallList calls={recentCalls} loading={loading} updateCall={updateCall} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
