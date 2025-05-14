
import React from "react";
import Header from "../Header";
import { Calendar, Table, Headphones, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppLayout = ({ children, activeTab, setActiveTab }: AppLayoutProps) => {
  const { logout, userEmail } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white shadow-sm md:shadow-md md:border-r md:border-gray-100 p-4 md:min-h-screen">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-purple-600 p-2 rounded-full">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          
          <div className="space-y-1.5">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Table className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "call-logs" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "call-logs"
                  ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab("call-logs")}
            >
              <Headphones className="mr-2 h-4 w-4" />
              Call Logs
            </Button>
            <Button
              variant={activeTab === "appointments" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "appointments"
                  ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                  : "hover:bg-purple-50"
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Appointments
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="pt-2 space-y-4">
            {userEmail && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium">{userEmail}</p>
              </div>
            )}
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <Header />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
