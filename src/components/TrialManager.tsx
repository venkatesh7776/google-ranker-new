import React, { useEffect, useState, useContext } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { GoogleBusinessProfileContext } from '@/contexts/GoogleBusinessProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { TrialSetupModal } from './TrialSetupModal';

export const TrialManager: React.FC = () => {
  const { showTrialSetup, setShowTrialSetup } = useSubscription();
  const gbpContext = useContext(GoogleBusinessProfileContext);
  const accounts = gbpContext?.accounts || [];
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          // Supabase user metadata check
          const adminStatus = currentUser.user_metadata?.role === 'admin' ||
                            currentUser.app_metadata?.role === 'admin';
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Get the first GBP account ID
  const gbpAccountId = accounts && accounts.length > 0
    ? accounts[0].name?.split('/')[1] || accounts[0].accountId
    : '';

  // Calculate total profiles
  const totalProfiles = accounts?.reduce((total, account) => {
    return total + (account.locations?.length || 0);
  }, 0) || 1;

  // Don't show trial modal for admins
  if (!showTrialSetup || !gbpAccountId || isAdmin) {
    return null;
  }

  return (
    <TrialSetupModal
      isOpen={showTrialSetup}
      onClose={() => setShowTrialSetup(false)}
      gbpAccountId={gbpAccountId}
      profileCount={Math.max(1, totalProfiles)}
    />
  );
};