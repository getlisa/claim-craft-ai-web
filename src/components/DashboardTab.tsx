import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Headphones, Clock, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { fetchCallsFromApi } from "@/lib/migrateCallsToSupabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface DashboardTabProps {
  initialCalls?: any[];
  initialLoading?: boolean;
  dataLoaded?: boolean;
  refreshCalls?: () => Promise<void>;
}

const DashboardTab = ({
  initialCalls = [],
  initialLoading = false,
  dataLoaded = false,
  refreshCalls
}: DashboardTabProps) => {
  const { agentId } = useAuth();
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [callStats, setCallStats] = useState({
    totalCalls: 0,
    avgDuration: "0:00",
    successfulCalls: 0,
    sentimentData: [],
    recentCalls: []
  });

  // Process calls data whenever it changes
  useEffect(() => {
    if (initialCalls.length > 0) {
      processCallsData(initialCalls);
    } else if (dataLoaded && !initialLoading) {
      // If data is loaded but no calls, fetch data
      fetchDashboardData();
    }
  }, [initialCalls, dataLoaded, initialLoading]);

  const processCallsData = (calls: any[]) => {
    // Calculate total calls
    const totalCalls = calls.length;

    // Calculate successful calls (completed status)
    const successfulCalls = calls.filter(call => call.call_status === 'completed').length;

    // Calculate average duration
    let totalDurationMs = 0;
    let callsWithDuration = 0;

    calls.forEach(call => {
      if (call.start_timestamp && call.end_timestamp) {
        const start = new Date(call.start_timestamp).getTime();
        const end = new Date(call.end_timestamp).getTime();
        
        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalDurationMs += (end - start);
          callsWithDuration++;
        }
      }
    });

    // Format average duration
    let avgDuration = "0:00";
    if (callsWithDuration > 0) {
      const avgDurationMs = totalDurationMs / callsWithDuration;
      const minutes = Math.floor(avgDurationMs / 60000);
      const seconds = Math.floor((avgDurationMs % 60000) / 1000);
      avgDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Calculate sentiment data for the chart
    const sentimentCounts: { [key: string]: number } = { 
      positive: 0, 
      neutral: 0, 
      negative: 0 
    };

    calls.forEach(call => {
      // First check call_analysis.user_sentiment, then fall back to call.user_sentiment
      const sentiment = call.call_analysis?.user_sentiment?.toLowerCase() || 
                        call.user_sentiment?.toLowerCase() || 
                        'neutral';
      if (['positive', 'neutral', 'negative'].includes(sentiment)) {
        sentimentCounts[sentiment]++;
      } else {
        sentimentCounts['neutral']++;
      }
    });

    const sentimentData = [
      { name: 'Positive', value: sentimentCounts.positive },
      { name: 'Neutral', value: sentimentCounts.neutral },
      { name: 'Negative', value: sentimentCounts.negative }
    ];

    // Get the 5 most recent calls
    const recentCalls = [...calls].sort((a, b) => {
      const dateA = new Date(a.start_timestamp || 0).getTime();
      const dateB = new Date(b.start_timestamp || 0).getTime();
      return dateB - dateA;
    }).slice(0, 5);

    setCallStats({
      totalCalls,
      avgDuration,
      successfulCalls,
      sentimentData,
      recentCalls
    });
  };

  const fetchDashboardData = async () => {
    if (!agentId) {
      toast.error("No agent ID found");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch calls directly from API
      const apiCalls = await fetchCallsFromApi(agentId);
      
      // Then fetch ALL calls from Supabase - not just ones with edits
      const { data: dbCalls, error: dbError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId);

      if (dbError) throw dbError;
      
      // Create a map of edited calls by call_id for fast lookup
      const editedCallsMap = new Map();
      if (dbCalls && dbCalls.length > 0) {
        dbCalls.forEach(dbCall => {
          // Include ALL calls from database, not just ones with specific edits
          editedCallsMap.set(dbCall.call_id, dbCall);
        });
      }
      
      // Merge API calls with edited data from DB
      const mergedCalls = apiCalls.map(apiCall => {
        const editedCall = editedCallsMap.get(apiCall.call_id);
        if (editedCall) {
          // Keep API data but override with ALL fields from database
          return {
            ...apiCall,
            appointment_status: editedCall.appointment_status || apiCall.appointment_status,
            appointment_date: editedCall.appointment_date || apiCall.appointment_date,
            appointment_time: editedCall.appointment_time || apiCall.appointment_time,
            notes: editedCall.notes || apiCall.notes,
            id: editedCall.id
          };
        }
        return apiCall;
      });

      // Process the merged calls data
      processCallsData(mergedCalls);

      toast.success("Dashboard data loaded successfully");
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#7c3aed', '#c4b5fd', '#ddd6fe'];

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const chartConfig = {
    primary: { theme: { light: "#7c3aed", dark: "#8b5cf6" } },
    secondary: { theme: { light: "#c4b5fd", dark: "#a78bfa" } },
    tertiary: { theme: { light: "#ddd6fe", dark: "#c4b5fd" } }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => fetchDashboardData()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Headphones className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.totalCalls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.avgDuration}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Successful Calls</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.successfulCalls}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Call sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {callStats.sentimentData && callStats.sentimentData.some(item => item.value > 0) ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={callStats.sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {callStats.sentimentData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No sentiment data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Last 5 calls</CardDescription>
          </CardHeader>
          <CardContent>
            {callStats.recentCalls && callStats.recentCalls.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {callStats.recentCalls.map((call: any) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {call.call_id ? call.call_id.substring(0, 8) + "..." : "N/A"}
                        </TableCell>
                        <TableCell>{formatDate(call.start_timestamp)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.call_status)}`}>
                            {call.call_status || "unknown"}
                          </span>
                        </TableCell>
                        <TableCell>{formatDuration(call)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No recent calls
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => refreshCalls ? refreshCalls() : fetchDashboardData()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span>Refresh Dashboard</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DashboardTab;
