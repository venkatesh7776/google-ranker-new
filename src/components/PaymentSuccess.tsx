import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { MandateSetup } from './MandateSetup';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkSubscriptionStatus, subscription } = useSubscription();
  const [showMandateSetup, setShowMandateSetup] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [profileCount, setProfileCount] = useState<number | null>(null);

  // Get profile count from URL params (passed from payment flow)
  useEffect(() => {
    const profiles = searchParams.get('profiles');
    if (profiles) {
      setProfileCount(parseInt(profiles, 10));
      console.log('[Payment Success] Profile count from URL:', profiles);
    }
  }, [searchParams]);

  useEffect(() => {
    // Aggressively refresh subscription status to ensure paid slots are loaded
    console.log('[Payment Success] 🔄 Force refreshing subscription status...');

    const refreshSubscription = async () => {
      // Wait a bit for the database update to propagate
      console.log('[Payment Success] Waiting 1.5s for database update...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // First refresh
      console.log('[Payment Success] 🔄 First refresh...');
      await checkSubscriptionStatus();

      // Second refresh after 1.5 seconds to ensure backend has updated
      setTimeout(async () => {
        console.log('[Payment Success] 🔄 Second refresh...');
        await checkSubscriptionStatus();
      }, 1500);

      // Third refresh after 3 seconds for good measure
      setTimeout(async () => {
        console.log('[Payment Success] 🔄 Third refresh...');
        await checkSubscriptionStatus();
      }, 3000);
    };

    refreshSubscription();

    // Countdown timer (5 seconds to allow for refreshes)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 5 seconds to allow status to fully refresh
    const redirectTimer = setTimeout(() => {
      console.log('[Payment Success] Redirecting to dashboard...');
      navigate('/dashboard');
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate, checkSubscriptionStatus]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your subscription. Your account has been successfully upgraded.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-medium">
            ✨ All premium features are now unlocked
          </p>
          {(profileCount || subscription?.paidSlots) && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <p className="text-2xl font-bold text-green-700">
                {profileCount || subscription?.paidSlots || 1} Profile{(profileCount || subscription?.paidSlots || 1) > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Ready to manage
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
        
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>

      {/* Mandate Setup Modal for Yearly Plan Users */}
      <MandateSetup
        isOpen={showMandateSetup}
        onClose={() => {
          setShowMandateSetup(false);
          navigate('/dashboard');
        }}
        onSuccess={() => {
          setShowMandateSetup(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};