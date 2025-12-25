import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  BarChart3,
  FileText,
  Star,
  Settings,
  Search,
  MessageSquarePlus,
  Users,
  X,
  Crown,
  CreditCard,
  LogOut,
  Sparkles,
  Bot
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Users },
    { label: "Posts", href: "/dashboard/posts", icon: FileText },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Auto Posting", href: "/dashboard/auto-posting", icon: Sparkles },
    { label: "Auto Reply", href: "/dashboard/auto-reply", icon: Bot },
    { label: "Feedbacks", href: "/dashboard/feedbacks", icon: MessageSquarePlus },
    { label: "Audit Tool", href: "/dashboard/audit", icon: Search },
  ];

  const isActive = (href: string) => {
    // Exact match for dashboard route
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    // For other routes, check if current path starts with the href
    return location.pathname.startsWith(href);
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-border transition-transform duration-300 ease-in-out",
      "lg:translate-x-0", // Always visible on desktop
      isOpen ? "translate-x-0" : "-translate-x-full" // Mobile: slide in/out based on isOpen
    )}>
      {/* Header - Match topbar height */}
      <div className="h-16 flex items-center justify-between p-4 border-b border-border bg-white">
        {/* Mobile close button */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 lg:mx-0 mx-auto">
          <img 
            src="/google-ranker-logo..png" 
            alt="Google Ranker Logo" 
            className="h-20 w-auto"
          />
        </div>
        
        {/* Spacer for mobile to center the logo */}
        <div className="lg:hidden w-8"></div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {/* Main Menu Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</h3>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={() => {
                  const currentlyActive = isActive(item.href);
                  return cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    currentlyActive
                      ? "shadow-sm"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  );
                }}
                style={() => {
                  const currentlyActive = isActive(item.href);
                  return currentlyActive
                    ? { background: 'linear-gradient(135deg, #6C21DC, #7B8DEF)', color: '#ffffff', fontWeight: '600' }
                    : {};
                }}
              >
                <item.icon 
                  className="h-5 w-5 transition-transform group-hover:scale-105"
                  style={
                    isActive(item.href)
                      ? { color: '#ffffff' }
                      : {}
                  }
                />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}

            {/* Ask for Reviews */}
            <NavLink
              to="/dashboard/ask-for-reviews"
              className={() => {
                const currentlyActive = isActive("/dashboard/ask-for-reviews");
                return cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  currentlyActive
                    ? "shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                );
              }}
              style={() => {
                const currentlyActive = isActive("/dashboard/ask-for-reviews");
                return currentlyActive
                  ? { background: 'linear-gradient(135deg, #6C21DC, #7B8DEF)', color: '#ffffff', fontWeight: '600' }
                  : {};
              }}
            >
              <MessageSquarePlus 
                className="h-5 w-5 transition-transform group-hover:scale-105"
                style={
                  isActive("/dashboard/ask-for-reviews")
                    ? { color: '#ffffff' }
                    : {}
                }
              />
              <span className="font-medium">Ask for Reviews</span>
            </NavLink>
          </div>
        </div>

        {/* Account Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</h3>
          <div className="space-y-1">
            {/* Settings */}
            <NavLink
              to="/dashboard/settings"
              className={() => {
                const currentlyActive = isActive("/dashboard/settings");
                return cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  currentlyActive
                    ? "shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                );
              }}
              style={() => {
                const currentlyActive = isActive("/dashboard/settings");
                return currentlyActive
                  ? { background: 'linear-gradient(135deg, #6C21DC, #7B8DEF)', color: '#ffffff', fontWeight: '600' }
                  : {};
              }}
            >
              <Settings 
                className="h-5 w-5 transition-transform group-hover:scale-105"
                style={
                  isActive("/dashboard/settings")
                    ? { color: '#ffffff' }
                    : {}
                }
              />
              <span className="font-medium">Settings</span>
            </NavLink>

            {/* Billing */}
            <NavLink
              to="/dashboard/billing"
              className={() => {
                const currentlyActive = isActive("/dashboard/billing");
                return cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  currentlyActive
                    ? "shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                );
              }}
              style={() => {
                const currentlyActive = isActive("/dashboard/billing");
                return currentlyActive
                  ? { background: 'linear-gradient(135deg, #6C21DC, #7B8DEF)', color: '#ffffff', fontWeight: '600' }
                  : {};
              }}
            >
              <CreditCard 
                className="h-5 w-5 transition-transform group-hover:scale-105"
                style={
                  isActive("/dashboard/billing")
                    ? { color: '#ffffff' }
                    : {}
                }
              />
              <span className="font-medium">Billing</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Logout Button at Bottom */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 bg-red-600 hover:bg-red-700 text-white group"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:scale-105" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;