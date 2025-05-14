
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Headphones, Clock, User, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Function to fetch dashboard data from a real API
const fetchDashboardData = async () => {
  try {
    // In a real-world scenario, this would be your actual API endpoint
    const response = await fetch('https://api.example.com/dashboard-data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error; // Let React Query handle the error
  }
};

const DashboardTab = () => {
  const { agentId } = useAuth();
  
  // Use React Query for data fetching and caching
  const { 
    data: dashboardData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['dashboardData', agentId],
    queryFn: fetchDashboardData,
    refetchOnWindowFocus: false,
    retry: 1,
    meta: {
      errorMessage: "Failed to load dashboard data"
    },
    onSettled: (data, error) => {
      if (data) {
        toast.success("Dashboard data loaded successfully");
      }
      if (error) {
        toast.error("Failed to load dashboard data");
      }
    }
  });

  const chartConfig = {
    primary: { theme: { light: "#7c3aed", dark: "#8b5cf6" } },
    secondary: { theme: { light: "#c4b5fd", dark: "#a78bfa" } },
    tertiary: { theme: { light: "#ddd6fe", dark: "#c4b5fd" } },
    quaternary: { theme: { light: "#ede9fe", dark: "#ddd6fe" } },
  };
  
  const COLORS = ['#7c3aed', '#c4b5fd', '#ddd6fe', '#a78bfa', '#ede9fe'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">Failed to load dashboard data</div>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  // If we have no data even after loading, show empty state
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-500 mb-4">No dashboard data available</div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh Data
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
            <div className="text-2xl font-bold">{dashboardData.totalCalls || 0}</div>
            <div className="flex items-center mt-1">
              {dashboardData.callTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.callTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.callTrend || 0)}% from last week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.avgDuration || "0:00"}</div>
            <div className="flex items-center mt-1">
              {dashboardData.durationTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.durationTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.durationTrend || 0)}% from last week
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Unique Callers</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.uniqueCallers || 0}</div>
            <div className="flex items-center mt-1">
              {dashboardData.callersTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.callersTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.callersTrend || 0)}% from last week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Call volume over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer>
                  <LineChart data={dashboardData.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="var(--color-primary)" 
                      strokeWidth={2} 
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }} 
                      name="Calls" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Distribution</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {dashboardData.callDistribution && dashboardData.callDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dashboardData.callDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.callDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                No distribution data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => refetch()}
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

