import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ConditionalSubscriptionGuard } from "../ConditionalSubscriptionGuard";
import { MandateSetup } from "../MandateSetup";
import { useSubscription } from "@/contexts/SubscriptionContext";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMandateSetup, setShowMandateSetup] = useState(false);
  const [mandateCheckDone, setMandateCheckDone] = useState(false);

  const { subscription, status } = useSubscription();
  const location = useLocation();

  // REMOVED: Mandate setup at sign-in
  // Mandate will now be shown only after trial ends when purchasing yearly plan
  // This improves user experience by not blocking access immediately after sign-up
  useEffect(() => {
    // Skip mandate check - it's now handled in the billing flow
    console.log('[Mandate Check] Skipping mandatory mandate - will be triggered after trial ends');
    setMandateCheckDone(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col ml-0 lg:ml-64">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 p-1 sm:p-4 md:p-6 bg-gray-100 relative overflow-hidden">
            {/* Corner Lighting Effects */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="animate-fade-in relative z-10">
              <ConditionalSubscriptionGuard>
                <Outlet />
              </ConditionalSubscriptionGuard>
            </div>
          </main>
        </div>
      </div>

      {/* Mandate Setup Modal */}
      <MandateSetup
        isOpen={showMandateSetup}
        onClose={() => setShowMandateSetup(false)}
        onSuccess={() => {
          setShowMandateSetup(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;