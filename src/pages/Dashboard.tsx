
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import AppLayout from "@/components/layout/AppLayout";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppointmentsTab from "@/components/AppointmentsTab";
import CalendarTab from "@/components/CalendarTab";
import UserManagement from "@/components/UserManagement";

const Dashboard = () => {
  const { isAuthenticated, isLoading, agentId, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch calls data
  const { 
    data: calls = [], 
    isLoading: callsLoading, 
    refetch,
    dataUpdatedAt
  } = useQuery({
    queryKey: ['calls', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      console.log("Fetching calls for agent:", agentId);
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('agent_id', agentId)
        .order('start_timestamp', { ascending: false });
      
      if (error) {
        console.error("Error fetching calls:", error);
        throw error;
      }
      
      console.log("Fetched calls:", data?.length);
      return data || [];
    },
    enabled: !!agentId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const dataLoaded = dataUpdatedAt > 0;

  // Create a wrapper function that returns Promise<void>
  const refreshCalls = async (): Promise<void> => {
    await refetch();
  };

  const updateCall = (updatedCall: any) => {
    // This would be used for optimistic updates if needed
    console.log("Call updated:", updatedCall);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            initialCalls={calls}
            initialLoading={callsLoading}
            dataLoaded={dataLoaded}
            refreshCalls={refreshCalls}
            updateCall={updateCall}
          />
        );
      case "call-logs":
        return (
          <CallLogsTab
            initialCalls={calls}
            initialLoading={callsLoading}
            dataLoaded={dataLoaded}
            refreshCalls={refreshCalls}
            updateCall={updateCall}
          />
        );
      case "appointments":
        return (
          <AppointmentsTab
            initialCalls={calls}
            initialLoading={callsLoading}
            dataLoaded={dataLoaded}
            refreshCalls={refreshCalls}
            updateCall={updateCall}
          />
        );
      case "calendar":
        return (
          <CalendarTab
            initialCalls={calls}
            initialLoading={callsLoading}
            dataLoaded={dataLoaded}
            refreshCalls={refreshCalls}
            updateCall={updateCall}
          />
        );
      case "user-management":
        return isAdmin ? <UserManagement /> : null;
      default:
        return (
          <DashboardTab
            initialCalls={calls}
            initialLoading={callsLoading}
            dataLoaded={dataLoaded}
            refreshCalls={refreshCalls}
            updateCall={updateCall}
          />
        );
    }
  };

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </AppLayout>
  );
};

export default Dashboard;
