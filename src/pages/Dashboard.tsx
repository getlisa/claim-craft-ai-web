
import { useState, useEffect, useCallback } from "react";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppointmentsTab from "@/components/AppointmentsTab";
import CalendarTab from "@/components/CalendarTab";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCallsFromApi } from "@/lib/migrateCallsToSupabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
      // Get calls from API
      const apiCalls = await fetchCallsFromApi(agentId);
      
      // Get ALL calls from database
      const { data: dbCalls, error: dbError } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId);
      
      if (dbError) throw dbError;
      
      // Create a map of database calls by call_id
      const dbCallsMap = new Map();
      if (dbCalls && dbCalls.length > 0) {
        dbCalls.forEach(dbCall => {
          dbCallsMap.set(dbCall.call_id, dbCall);
        });
      }
      
      // Merge API calls with database data
      const mergedCalls = apiCalls.map(apiCall => {
        const dbCall = dbCallsMap.get(apiCall.call_id);
        if (dbCall) {
          return {
            ...apiCall,
            appointment_status: dbCall.appointment_status || apiCall.appointment_status,
            appointment_date: dbCall.appointment_date || apiCall.appointment_date,
            appointment_time: dbCall.appointment_time || apiCall.appointment_time,
            notes: dbCall.notes || apiCall.notes,
            from_number: dbCall.from_number || apiCall.from_number || "",
            id: dbCall.id
          };
        }
        return apiCall;
      });
      
      setCalls(mergedCalls);
      setInitialDataLoaded(true);
      
      if (mergedCalls.length === 0) {
        toast.info("No calls found for this agent");
      }
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
          />
        }
        {activeTab === "call-logs" && 
          <CallLogsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
          />
        }
        {activeTab === "appointments" && 
          <AppointmentsTab 
            initialCalls={calls} 
            initialLoading={loading} 
            dataLoaded={initialDataLoaded}
          />
        }
        {activeTab === "calendar" && 
          <CalendarTab 
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
