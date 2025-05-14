
import { useState, useEffect } from "react";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCallsFromApi } from "@/lib/migrateCallsToSupabase";
import { toast } from "sonner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { agentId } = useAuth();

  // Load initial data when dashboard mounts
  useEffect(() => {
    if (agentId && !initialDataLoaded) {
      loadInitialData();
    }
  }, [agentId, initialDataLoaded]);

  const loadInitialData = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      const apiCalls = await fetchCallsFromApi(agentId);
      setCalls(Array.isArray(apiCalls) ? apiCalls : []);
      setInitialDataLoaded(true);
    } catch (error: any) {
      console.error("Failed to load initial data:", error);
      toast.error("Could not load initial data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "dashboard" && 
          <DashboardTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
          />
        }
        {activeTab === "call-logs" && 
          <CallLogsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
          />
        }
      </div>
    </AppLayout>
  );
};

export default Dashboard;
