
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Headphones, Clock, User, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Mock API data - in a real app, this would come from an actual API
const fetchDashboardData = () => {
  return new Promise<{
    totalCalls: number;
    avgDuration: string;
    uniqueCallers: number;
    callTrend: number;
    durationTrend: number;
    callersTrend: number;
    recentActivity: any[];
    callDistribution: any[];
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        totalCalls: 132,
        avgDuration: "4:23",
        uniqueCallers: 87,
        callTrend: 8,
        durationTrend: -12,
        callersTrend: 5,
        recentActivity: [
          { day: "Mon", calls: 12 },
          { day: "Tue", calls: 18 },
          { day: "Wed", calls: 15 },
          { day: "Thu", calls: 22 },
          { day: "Fri", calls: 28 },
          { day: "Sat", calls: 24 },
          { day: "Sun", calls: 13 },
        ],
        callDistribution: [
          { name: "Support", value: 45 },
          { name: "Sales", value: 28 },
          { name: "Billing", value: 17 },
          { name: "Technical", value: 32 },
          { name: "Other", value: 10 },
        ]
      });
    }, 1500);
  });
};

const DashboardTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { agentId } = useAuth();
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      toast.success("Dashboard data loaded successfully");
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    primary: { theme: { light: "#7c3aed", dark: "#8b5cf6" } },
    secondary: { theme: { light: "#c4b5fd", dark: "#a78bfa" } },
    tertiary: { theme: { light: "#ddd6fe", dark: "#c4b5fd" } },
    quaternary: { theme: { light: "#ede9fe", dark: "#ddd6fe" } },
  };
  
  const COLORS = ['#7c3aed', '#c4b5fd', '#ddd6fe', '#a78bfa', '#ede9fe'];

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <span className="ml-2 text-lg text-gray-600">Loading dashboard...</span>
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
            <div className="text-2xl font-bold">{dashboardData.totalCalls}</div>
            <div className="flex items-center mt-1">
              {dashboardData.callTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.callTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.callTrend)}% from last week
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
            <div className="text-2xl font-bold">{dashboardData.avgDuration}</div>
            <div className="flex items-center mt-1">
              {dashboardData.durationTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.durationTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.durationTrend)}% from last week
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
            <div className="text-2xl font-bold">{dashboardData.uniqueCallers}</div>
            <div className="flex items-center mt-1">
              {dashboardData.callersTrend > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <p className={`text-xs ${dashboardData.callersTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(dashboardData.callersTrend)}% from last week
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
            <ChartContainer config={chartConfig} className="h-[250px]">
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
              <ChartTooltip />
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Distribution</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={chartConfig} className="h-[250px]">
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
              <ChartTooltip />
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={loadDashboardData} 
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
