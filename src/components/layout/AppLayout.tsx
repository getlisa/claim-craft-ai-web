
import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Phone, BarChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <SidebarHeader className="flex items-center justify-between px-4 py-3">
            <Header />
            <SidebarTrigger />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <div className="p-4">
                  <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-sm mb-6">
                    <Avatar className="bg-purple-500">
                      <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{userEmail}</p>
                      <p className="text-xs text-muted-foreground">Agent</p>
                    </div>
                  </div>
                </div>
                
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "dashboard"}
                      onClick={() => setActiveTab("dashboard")}
                      tooltip="Dashboard"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "call-logs"}
                      onClick={() => setActiveTab("call-logs")}
                      tooltip="Call Logs"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Logs</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={activeTab === "analysis"}
                      onClick={() => setActiveTab("analysis")}
                      tooltip="Analysis"
                    >
                      <BarChart className="h-4 w-4" />
                      <span>Analysis</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              <Button 
                onClick={handleLogout} 
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                Logout
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
