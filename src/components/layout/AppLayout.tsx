
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Phone, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger
} from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppLayout = ({ children, activeTab, setActiveTab }: AppLayoutProps) => {
  const { userEmail, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-b from-purple-50 to-white">
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <Header />
            <SidebarTrigger />
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="p-4">
                  <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-xl shadow-sm mb-6 border border-slate-100 hover:border-purple-200 transition-all">
                    <Avatar className="bg-gradient-to-br from-purple-500 to-indigo-600 h-12 w-12">
                      <AvatarFallback className="text-white font-medium">{getInitials(userEmail)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate">{userEmail}</p>
                      <p className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full w-fit">Call Center Agent</p>
                    </div>
                  </div>
                </div>
                
                <SidebarMenu className="px-2 space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "dashboard"}
                      onClick={() => setActiveTab("dashboard")}
                      tooltip="Dashboard"
                      className={`${activeTab === "dashboard" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "hover:bg-slate-100"} transition-all duration-200`}
                    >
                      <LayoutDashboard className={`h-5 w-5 ${activeTab === "dashboard" ? "text-purple-600" : "text-slate-600"}`} />
                      <span className="font-medium">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "call-logs"}
                      onClick={() => setActiveTab("call-logs")}
                      tooltip="Call Logs"
                      className={`${activeTab === "call-logs" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "hover:bg-slate-100"} transition-all duration-200`}
                    >
                      <Phone className={`h-5 w-5 ${activeTab === "call-logs" ? "text-purple-600" : "text-slate-600"}`} />
                      <span className="font-medium">Call Logs</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "analysis"}
                      onClick={() => setActiveTab("analysis")}
                      tooltip="Analysis"
                      className={`${activeTab === "analysis" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "hover:bg-slate-100"} transition-all duration-200`}
                    >
                      <BarChart className={`h-5 w-5 ${activeTab === "analysis" ? "text-purple-600" : "text-slate-600"}`} />
                      <span className="font-medium">Analysis</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 pt-6 border-t border-slate-100 absolute bottom-0 left-0 right-0">
              <Button 
                onClick={handleLogout} 
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="p-6">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
