
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

// Mock API data - in a real app, this would come from an actual API
const fetchAnalysisData = () => {
  return new Promise<{
    callTimeDistribution: any[];
    callDurationByDay: any[];
    callsByCategory: any[];
    callsByIntent: any[];
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        callTimeDistribution: [
          { hour: '8-10 AM', calls: 12 },
          { hour: '10-12 PM', calls: 24 },
          { hour: '12-2 PM', calls: 18 },
          { hour: '2-4 PM', calls: 30 },
          { hour: '4-6 PM', calls: 22 },
          { hour: '6-8 PM', calls: 7 },
        ],
        callDurationByDay: [
          { day: 'Mon', avgDuration: 220 },
          { day: 'Tue', avgDuration: 182 },
          { day: 'Wed', avgDuration: 195 },
          { day: 'Thu', avgDuration: 253 },
          { day: 'Fri', avgDuration: 211 },
          { day: 'Sat', avgDuration: 178 },
          { day: 'Sun', avgDuration: 163 },
        ],
        callsByCategory: [
          { category: 'Support', count: 45 },
          { category: 'Sales', count: 28 },
          { category: 'Billing', count: 17 },
          { category: 'Technical', count: 32 },
          { category: 'Other', count: 10 },
        ],
        callsByIntent: [
          { intent: 'Question', count: 56 },
          { intent: 'Complaint', count: 22 },
          { intent: 'Feedback', count: 18 },
          { intent: 'Request', count: 36 },
        ]
      });
    }, 1500);
  });
};

const AnalysisTab = () => {
  const [data, setData] = useState<{
    callTimeDistribution: any[];
    callDurationByDay: any[];
    callsByCategory: any[];
    callsByIntent: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAnalysisData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchAnalysisData();
        setData(result);
      } catch (error) {
        toast.error("Failed to load analysis data");
        console.error("Error loading analysis data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getAnalysisData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg text-gray-600">Loading analysis...</span>
      </div>
    );
  }

  if (!data) {
    return <div>No analysis data available</div>;
  }

  const chartConfig = {
    primary: { theme: { light: "#7c3aed", dark: "#8b5cf6" } },
    secondary: { theme: { light: "#c4b5fd", dark: "#a78bfa" } },
    tertiary: { theme: { light: "#ddd6fe", dark: "#c4b5fd" } },
    quaternary: { theme: { light: "#ede9fe", dark: "#ddd6fe" } },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Call Analysis</h2>
        <p className="text-muted-foreground mb-6">
          Detailed insights based on your voice assistant interactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Volume by Time of Day</CardTitle>
            <CardDescription>Distribution of calls throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer>
                <BarChart data={data.callTimeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="calls" fill="var(--color-primary)" name="Number of Calls" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Call Duration by Day</CardTitle>
            <CardDescription>Duration trends throughout the week (in seconds)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer>
                <LineChart data={data.callDurationByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgDuration" 
                    stroke="var(--color-primary)" 
                    name="Avg Duration (s)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calls by Category</CardTitle>
            <CardDescription>Distribution of calls by category</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer>
                <BarChart data={data.callsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="var(--color-secondary)" name="Number of Calls" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calls by Intent</CardTitle>
            <CardDescription>Distribution of calls by user intent</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={chartConfig} className="aspect-[4/3]">
              <ResponsiveContainer>
                <BarChart data={data.callsByIntent}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="intent" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="count" fill="var(--color-tertiary)" name="Number of Calls" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisTab;
