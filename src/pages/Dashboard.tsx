
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardTab from "@/components/DashboardTab";
import CallLogsTab from "@/components/CallLogsTab";
import { toast } from "sonner";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { agentId, userEmail, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Header />
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-semibold">{userEmail}</span>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center my-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-2">
              Currently using Agent ID:
              <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded ml-2">
                {agentId}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="call-logs">Call Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <DashboardTab />
            </TabsContent>
            
            <TabsContent value="call-logs">
              <CallLogsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
