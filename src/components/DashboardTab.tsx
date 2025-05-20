
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Settings as SettingsIcon, TrendingUp, Phone, Calendar } from "lucide-react";
import ApiKeySettings from "./ApiKeySettings";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "./ui/chart";

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
  const [showSettings, setShowSettings] = useState(false);
  
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
  
  // Filter calls based on active tab
  const filteredCalls = calls.filter(call => {
    if (activeTab === "all") return true;
    
    if (activeTab === "completed") {
      return call.call_status === "completed";
    }
    
    if (activeTab === "recent") {
      // Show calls from the last 7 days
      const callDate = new Date(call.start_timestamp);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return callDate >= sevenDaysAgo;
    }
    
    return true;
  });

  // Prepare data for sentiment chart
  const getSentimentData = () => {
    // Get the last 10 calls with sentiment data
    const callsWithSentiment = calls
      .filter(call => call.call_analysis?.user_sentiment)
      .slice(0, 10);
      
    return callsWithSentiment.map((call, index) => {
      const sentimentValue = mapSentimentToValue(call.call_analysis?.user_sentiment);
      const date = new Date(call.start_timestamp);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        name: formattedDate,
        sentiment: sentimentValue,
        fullDate: date
      };
    }).reverse(); // Most recent first
  };
  
  // Map sentiment string to numeric value for visualization
  const mapSentimentToValue = (sentiment: string): number => {
    switch(sentiment?.toLowerCase()) {
      case 'positive': return 5;
      case 'very positive': return 10;
      case 'neutral': return 0;
      case 'negative': return -5;
      case 'very negative': return -10;
      default: return 0;
    }
  };
  
  // Prepare data for call status pie chart
  const getCallStatusData = () => {
    const statusCounts = {
      completed: calls.filter(call => call.call_status === "completed").length,
      inProgress: calls.filter(call => call.call_status === "in-progress").length,
      failed: calls.filter(call => call.call_status === "failed").length,
      other: calls.filter(call => !["completed", "in-progress", "failed"].includes(call.call_status)).length
    };
    
    return [
      { name: 'Completed', value: statusCounts.completed, color: '#10B981' },
      { name: 'In Progress', value: statusCounts.inProgress, color: '#3B82F6' },
      { name: 'Failed', value: statusCounts.failed, color: '#EF4444' },
      { name: 'Other', value: statusCounts.other, color: '#6B7280' }
    ].filter(item => item.value > 0); // Only include non-zero values
  };
  
  // Prepare data for call success rate
  const getSuccessRateData = () => {
    const successfulCalls = calls.filter(call => call.call_analysis?.call_successful === true).length;
    const totalAnalyzedCalls = calls.filter(call => call.call_analysis?.call_successful !== undefined).length;
    
    const successRate = totalAnalyzedCalls > 0 ? (successfulCalls / totalAnalyzedCalls) * 100 : 0;
    
    return [
      { name: 'Successful', value: successRate, color: '#10B981' },
      { name: 'Unsuccessful', value: 100 - successRate, color: '#EF4444' }
    ];
  };

  const sentimentData = getSentimentData();
  const callStatusData = getCallStatusData();
  const successRateData = getSuccessRateData();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Your Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSettings(!showSettings)} 
            variant="outline" 
            className="flex gap-2 items-center"
          >
            <SettingsIcon className="h-4 w-4" />
            {showSettings ? "Hide Settings" : "Settings"}
          </Button>
          <Button onClick={handleRefresh} disabled={loading} variant="outline" className="flex gap-2 items-center">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Calls
          </Button>
        </div>
      </div>
      
      {showSettings && (
        <div className="mb-6">
          <ApiKeySettings />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <CardDescription>All recorded calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Phone className="h-5 w-5 mr-2 text-blue-500" />
              {calls.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Calls</CardTitle>
            <CardDescription>Successfully finished</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              {calls.filter(call => call.call_status === "completed").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Appointments</CardTitle>
            <CardDescription>From all calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              {calls.filter(call => call.appointment_status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sentiment Analysis Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>User Sentiment Analysis</CardTitle>
          <CardDescription>Sentiment trends from recent calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {sentimentData.length > 0 ? (
              <ChartContainer 
                className="h-80"
                config={{
                  sentiment: { theme: { light: '#7C3AED' } },
                }}
              >
                <LineChart data={sentimentData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    ticks={[-10, -5, 0, 5, 10]} 
                    domain={[-10, 10]}
                    tickFormatter={(value) => {
                      switch(value) {
                        case 10: return 'Very Positive';
                        case 5: return 'Positive';
                        case 0: return 'Neutral';
                        case -5: return 'Negative';
                        case -10: return 'Very Negative';
                        default: return '';
                      }
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value, name, props) => {
                        let sentimentText = 'Neutral';
                        if (value === 10) sentimentText = 'Very Positive';
                        else if (value === 5) sentimentText = 'Positive';
                        else if (value === -5) sentimentText = 'Negative';
                        else if (value === -10) sentimentText = 'Very Negative';
                        
                        return [sentimentText, 'Sentiment'];
                      }} />
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="var(--color-sentiment)" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No sentiment data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Two column charts layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Call Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Call Status Distribution</CardTitle>
            <CardDescription>Breakdown of call statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {callStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {callStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No call status data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Call Success Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Call Success Rate</CardTitle>
            <CardDescription>Percentage of successful calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {successRateData[0].value > 0 || successRateData[1].value > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={successRateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {successRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No success rate data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Calls</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <CallList calls={filteredCalls} loading={loading} updateCall={updateCall} />
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <CallList calls={filteredCalls} loading={loading} updateCall={updateCall} />
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <CallList calls={filteredCalls} loading={loading} updateCall={updateCall} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTab;
