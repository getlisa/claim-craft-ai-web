
import { useState } from "react";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import AppLayout from "@/components/layout/AppLayout";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "call-logs" && <CallLogsTab />}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
