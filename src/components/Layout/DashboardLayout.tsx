import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ConditionalSubscriptionGuard } from "../ConditionalSubscriptionGuard";
import { MandateSetup } from "../MandateSetup";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Clock, X } from "lucide-react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMandateSetup, setShowMandateSetup] = useState(false);
  const [mandateCheckDone, setMandateCheckDone] = useState(false);
  const [dismissedTrialBanner, setDismissedTrialBanner] = useState(false);

  const { subscription, status, daysRemaining } = useSubscription();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

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

          {/* Global Trial Warning Banner - Shows on all pages for trial users */}
          {!isAdmin && status === 'trial' && !dismissedTrialBanner && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  <strong>Free Trial:</strong> You have <strong>{daysRemaining || 0} days</strong> remaining.
                  {(daysRemaining || 0) <= 3 && " Your trial is ending soon!"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/dashboard/billing')}
                  className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Subscribe Now
                </button>
                <button
                  onClick={() => setDismissedTrialBanner(true)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Trial Expired Warning Banner */}
          {!isAdmin && status === 'expired' && (
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  <strong>Trial Expired!</strong> Your free trial has ended. Subscribe to continue using all features.
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard/billing')}
                className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          )}

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