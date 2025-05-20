
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Loader2, RefreshCw } from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

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
  
  // Prepare sentiment data for chart
  const sentimentCounts = {
    positive: calls.filter(call => call.user_sentiment?.toLowerCase() === "positive").length,
    neutral: calls.filter(call => call.user_sentiment?.toLowerCase() === "neutral").length,
    negative: calls.filter(call => call.user_sentiment?.toLowerCase() === "negative").length,
    unknown: calls.filter(call => !call.user_sentiment).length
  };
  
  const sentimentData = [
    { name: "Positive", value: sentimentCounts.positive, color: "#10B981" },
    { name: "Neutral", value: sentimentCounts.neutral, color: "#6366F1" },
    { name: "Negative", value: sentimentCounts.negative, color: "#EF4444" },
    { name: "Unknown", value: sentimentCounts.unknown, color: "#9CA3AF" }
  ].filter(item => item.value > 0); // Only show segments with values
  
  // Custom renderer for the pie chart labels
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    if (value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${value})`}
      </text>
    );
  };
  
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
      
      {/* Sentiment Analysis Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Sentiment Analysis</CardTitle>
          <CardDescription>Distribution of call sentiments</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ChartContainer 
            config={{
              positive: { theme: { light: "#10B981", dark: "#10B981" } },
              neutral: { theme: { light: "#6366F1", dark: "#6366F1" } },
              negative: { theme: { light: "#EF4444", dark: "#EF4444" } },
              unknown: { theme: { light: "#9CA3AF", dark: "#9CA3AF" } }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{payload[0].name}</div>
                          <div className="text-xs text-muted-foreground">
                            {payload[0].value} calls
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
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
