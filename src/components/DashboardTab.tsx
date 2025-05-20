
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CallList from "./CallList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import ApiKeySettings from "./ApiKeySettings";
import { ChartContainer, ChartLegend, ChartLegendContent } from "./ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
  const [activeTab, setActiveTab] = useState("overview");
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

  // Get latest 5 calls
  const latestCalls = [...calls]
    .sort((a, b) => {
      const dateA = new Date(a.start_timestamp || 0);
      const dateB = new Date(b.start_timestamp || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);
  
  // Prepare sentiment data for chart
  const prepareSentimentData = () => {
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    calls.forEach(call => {
      const sentiment = call.user_sentiment || call.call_analysis?.user_sentiment;
      if (sentiment === "positive") sentimentCounts.positive++;
      else if (sentiment === "negative") sentimentCounts.negative++;
      else sentimentCounts.neutral++;
    });
    
    return [
      { name: "Positive", value: sentimentCounts.positive },
      { name: "Neutral", value: sentimentCounts.neutral },
      { name: "Negative", value: sentimentCounts.negative }
    ];
  };
  
  // Prepare call outcome data for chart
  const prepareCallOutcomeData = () => {
    const outcomeCounts = {
      successful: 0,
      unsuccessful: 0,
      unknown: 0
    };
    
    calls.forEach(call => {
      const successful = call.call_successful || call.call_analysis?.call_successful;
      if (successful === true) outcomeCounts.successful++;
      else if (successful === false) outcomeCounts.unsuccessful++;
      else outcomeCounts.unknown++;
    });
    
    return [
      { name: "Successful", value: outcomeCounts.successful },
      { name: "Unsuccessful", value: outcomeCounts.unsuccessful },
      { name: "Unknown", value: outcomeCounts.unknown }
    ];
  };
  
  const sentimentData = prepareSentimentData();
  const callOutcomeData = prepareCallOutcomeData();
  
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="outcomes">Call Outcomes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Sentiment</CardTitle>
                <CardDescription>Distribution of user sentiment across all calls</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer config={{ sentiment: { color: "#10b981" } }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-sentiment)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>Success rate of calls</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ChartContainer config={{ outcome: { color: "#6366f1" } }} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callOutcomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="var(--color-outcome)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Latest Calls</CardTitle>
              <CardDescription>Your 5 most recent calls</CardDescription>
            </CardHeader>
            <CardContent>
              <CallList calls={latestCalls} loading={loading} updateCall={updateCall} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Sentiment Analysis</CardTitle>
              <CardDescription>Detailed view of sentiment across all calls</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={{ sentiment: { color: "#10b981" } }} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-sentiment)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Outcomes Analysis</CardTitle>
              <CardDescription>Detailed view of call success rates</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ChartContainer config={{ outcome: { color: "#6366f1" } }} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callOutcomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="var(--color-outcome)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTab;
