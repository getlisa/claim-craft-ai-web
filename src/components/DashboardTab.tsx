
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Define the props interface for DashboardTab
interface DashboardTabProps {
  initialCalls?: any[];
  initialLoading?: boolean;
  dataLoaded?: boolean;
  refreshCalls?: () => Promise<void>;
  updateCall?: (updatedCall: any) => void;
}

const DashboardTab = ({ initialCalls = [], initialLoading = false, dataLoaded = false, refreshCalls, updateCall }: DashboardTabProps) => {
  const { toast } = useToast();
  const { agentId } = useAuth();
  const [loading, setLoading] = useState(initialLoading);
  const [calls, setCalls] = useState<any[]>(initialCalls);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [callStatusData, setCallStatusData] = useState<any[]>([]);
  const [callTrendData, setCallTrendData] = useState<any[]>([]);

  useEffect(() => {
    // Use initial calls if provided, otherwise fetch calls
    if (initialCalls && initialCalls.length > 0) {
      setCalls(initialCalls);
      processCallData(initialCalls);
    } else if (agentId) {
      fetchCalls();
    }
  }, [agentId, initialCalls]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId);

      if (error) throw error;

      if (data) {
        setCalls(data);
        processCallData(data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch call data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processCallData = (callData: any[]) => {
    // Process sentiment data
    const sentiments = callData.reduce((acc: Record<string, number>, call) => {
      const sentiment = (call.call_analysis?.user_sentiment || 'Unknown').toLowerCase();
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    const formattedSentimentData = Object.keys(sentiments).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: sentiments[key]
    }));

    setSentimentData(formattedSentimentData);

    // Process call status data
    const statuses = callData.reduce((acc: Record<string, number>, call) => {
      const status = call.call_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const formattedStatusData = Object.keys(statuses).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: statuses[key]
    }));

    setCallStatusData(formattedStatusData);

    // Process call trend data (calls per day)
    const callsByDate: Record<string, number> = {};
    
    callData.forEach(call => {
      if (call.start_timestamp) {
        const date = new Date(call.start_timestamp).toISOString().split('T')[0];
        callsByDate[date] = (callsByDate[date] || 0) + 1;
      }
    });

    // Sort dates and take the last 7 days
    const sortedDates = Object.keys(callsByDate).sort();
    const recentDates = sortedDates.slice(-7);
    
    const trendData = recentDates.map(date => {
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      return {
        date: formattedDate,
        calls: callsByDate[date]
      };
    });

    setCallTrendData(trendData);
  };

  // Colors for the charts
  const COLORS = {
    positive: '#4ade80',
    neutral: '#60a5fa',
    negative: '#f87171',
    unknown: '#d1d5db',
    completed: '#4ade80',
    'in-progress': '#60a5fa',
    failed: '#f87171'
  };

  const CHART_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#d1d5db'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Call Volume Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Call Volume</CardTitle>
            <CardDescription>All recorded calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>

        {/* Average Call Duration Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Call Duration</CardTitle>
            <CardDescription>Time spent on calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calls.length > 0 
                ? (() => {
                    const durations = calls
                      .filter(call => call.start_timestamp && call.end_timestamp)
                      .map(call => {
                        const start = new Date(call.start_timestamp).getTime();
                        const end = new Date(call.end_timestamp).getTime();
                        return (end - start) / 1000 / 60; // minutes
                      });
                    
                    if (durations.length === 0) return "N/A";
                    
                    const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
                    const minutes = Math.floor(avgDuration);
                    const seconds = Math.floor((avgDuration - minutes) * 60);
                    
                    return `${minutes}m ${seconds}s`;
                  })()
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Call Completion Rate</CardTitle>
            <CardDescription>Successful call percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calls.length > 0
                ? (() => {
                    const completedCalls = calls.filter(call => call.call_status === 'completed').length;
                    return `${Math.round((completedCalls / calls.length) * 100)}%`;
                  })()
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Sentiment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Call Sentiment Analysis</CardTitle>
            <CardDescription>Distribution of user sentiment during calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => {
                        const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                        return <Cell key={`cell-${index}`} fill={COLORS[colorKey] || CHART_COLORS[index % CHART_COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} calls`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No sentiment data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Call Status Distribution</CardTitle>
            <CardDescription>Breakdown of call outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
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
                      {callStatusData.map((entry, index) => {
                        const colorKey = entry.name.toLowerCase() as keyof typeof COLORS;
                        return <Cell key={`cell-${index}`} fill={COLORS[colorKey] || CHART_COLORS[index % CHART_COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} calls`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No status data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Call Volume Trend</CardTitle>
          <CardDescription>Number of calls over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {callTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" name="Calls" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No trend data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
