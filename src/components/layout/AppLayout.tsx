
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Phone, BarChart, Headphones, Menu } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppLayout = ({ children, activeTab, setActiveTab }: AppLayoutProps) => {
  const { userEmail, logout } = useAuth();
  const isMobile = useIsMobile();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  // Menu items configuration
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      id: "call-logs",
      label: "Call Logs",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: <BarChart className="h-5 w-5" />,
    },
  ];

  // Effect to close mobile menu when switching tabs
  useEffect(() => {
    if (isMobile && openMobileMenu) {
      setOpenMobileMenu(false);
    }
  }, [activeTab, isMobile]);

  return (
    <SidebarProvider>
      {/* Main layout container */}
      <div className="flex min-h-screen w-full bg-gradient-to-b from-purple-50 to-white">
        {/* Desktop Sidebar */}
        <Sidebar 
          side="left" 
          variant="sidebar" 
          collapsible="icon"
          className="hidden md:flex shadow-sm border-r border-slate-200"
        >
          <SidebarHeader className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center">
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupContent>
                {/* User Profile Card */}
                <div className="p-4">
                  <div className="flex items-center space-x-4 bg-white/70 p-4 rounded-xl shadow-sm mb-6 border border-slate-100 hover:border-purple-200 transition-all">
                    <Avatar className="bg-gradient-to-br from-purple-500 to-indigo-600 h-12 w-12 ring-2 ring-white">
                      <AvatarFallback className="text-white font-medium">{getInitials(userEmail)}</AvatarFallback>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} />
                    </Avatar>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-sm font-medium leading-none truncate">{userEmail}</p>
                      <p className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full w-fit">Call Center Agent</p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation Menu */}
                <SidebarMenu className="px-2 space-y-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                        tooltip={item.label}
                        className={cn(
                          "transition-all duration-200 hover:bg-slate-100 font-medium",
                          activeTab === item.id 
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200 border-l-4 border-purple-500" 
                            : "hover:bg-slate-100"
                        )}
                      >
                        <span className={cn(
                          "h-5 w-5",
                          activeTab === item.id ? "text-purple-600" : "text-slate-600"
                        )}>
                          {item.icon}
                        </span>
                        <span className={cn(
                          "font-medium ml-2",
                          activeTab === item.id ? "text-purple-700" : "text-slate-700"
                        )}>
                          {item.label}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Logout Button */}
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
        
        {/* Main Content Area */}
        <SidebarInset className="p-4 md:p-6 relative w-full">
          <div className="mb-8">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 md:p-3 rounded-full">
                  <Headphones className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                  Lisa - Voice Assistant
                </h1>
              </div>
              <p className="text-gray-600 mt-2 text-center text-sm md:text-base">
                View and manage your voice assistant conversations
              </p>
            </div>
          </div>
          {children}
        </SidebarInset>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 py-1">
            <div className="flex justify-around items-center">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex flex-col items-center py-2 px-3 rounded-md transition-colors",
                    activeTab === item.id 
                      ? "text-purple-600" 
                      : "text-slate-600"
                  )}
                >
                  <div className={cn(
                    "p-1 rounded-full",
                    activeTab === item.id ? "bg-purple-100" : ""
                  )}>
                    {item.icon}
                  </div>
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="flex flex-col items-center py-2 px-3 rounded-md text-slate-600"
              >
                <div className="p-1 rounded-full">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
