
import { useState, useEffect, useCallback } from "react";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCallsFromApi } from "@/lib/migrateCallsToSupabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { agentId, isAuthenticated } = useAuth();

  // Create a fetchCalls function that can be used for initial load and refreshes
  const fetchCalls = useCallback(async () => {
    if (!agentId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const apiCalls = await fetchCallsFromApi(agentId);
      setCalls(Array.isArray(apiCalls) ? apiCalls : []);
      setInitialDataLoaded(true);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error("Could not load call data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  // Load initial data when dashboard mounts and we have an agentId
  useEffect(() => {
    if (agentId && isAuthenticated) {
      fetchCalls();
    }
  }, [agentId, isAuthenticated, fetchCalls]);

  if (loading && !initialDataLoaded) {
    return (
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="mt-4 text-gray-600">Loading your calls...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "dashboard" && 
          <DashboardTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
          />
        }
        {activeTab === "call-logs" && 
          <CallLogsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
            refreshCalls={fetchCalls}
          />
        }
      </div>
    </AppLayout>
  );
};

export default Dashboard;
