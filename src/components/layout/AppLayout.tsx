
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
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white md:border-r md:border-gray-200 p-5">
          <div className="space-y-1">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "dashboard"
                  ? "bg-purple-100 text-purple-900 hover:bg-purple-200 hover:text-purple-900"
                  : ""
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              <Table className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "call-logs" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "call-logs"
                  ? "bg-purple-100 text-purple-900 hover:bg-purple-200 hover:text-purple-900"
                  : ""
              }`}
              onClick={() => setActiveTab("call-logs")}
            >
              <Headphones className="mr-2 h-5 w-5" />
              Call Logs
            </Button>
            <Button
              variant={activeTab === "appointments" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === "appointments"
                  ? "bg-purple-100 text-purple-900 hover:bg-purple-200 hover:text-purple-900"
                  : ""
              }`}
              onClick={() => setActiveTab("appointments")}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Appointments
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="pt-4 space-y-4">
            {user && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">{user.user_metadata?.agent_id || 'Agent ID not set'}</p>
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
