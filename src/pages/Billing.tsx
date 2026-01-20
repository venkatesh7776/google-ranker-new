import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Receipt,
  Sparkles,
  Headphones,
  Mail,
  MessageCircle,
  Shield,
  Infinity,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGoogleBusinessProfile } from '@/hooks/useGoogleBusinessProfile';
import { useProfileLimitations } from '@/hooks/useProfileLimitations';
import { PaymentModal } from '@/components/PaymentModal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { format } from 'date-fns';

const Billing = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);

  const {
    subscription,
    status,
    daysRemaining,
    plans,
    cancelSubscription,
    isLoading
  } = useSubscription();

  const { currentUser } = useAuth();
  const { isAdmin } = useAdmin(); // Use AdminContext for proper admin check
  const { toast } = useToast();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://googleranker-backend.onrender.com';

  // Get Google Business Profile data to count actual connected profiles
  const { accounts, isConnected } = useGoogleBusinessProfile();
  const { getAccessibleAccounts } = useProfileLimitations();

  // Calculate total connected profiles from GBP
  const profileStats = useMemo(() => {
    const accessibleAccounts = getAccessibleAccounts(accounts);
    const totalConnectedProfiles = accessibleAccounts.reduce(
      (total, account) => total + (account.locations?.length || 0),
      0
    );
    const paidSlots = subscription?.paidSlots || 0;
    const profilesNeedingSubscription = Math.max(0, totalConnectedProfiles - paidSlots);
    const unusedSlots = Math.max(0, paidSlots - totalConnectedProfiles);

    return {
      totalConnected: totalConnectedProfiles,
      paidSlots,
      needSubscription: profilesNeedingSubscription,
      unusedSlots,
      accounts: accessibleAccounts
    };
  }, [accounts, subscription?.paidSlots, getAccessibleAccounts]);

  // Fetch payment history and check for recent upgrade
  useEffect(() => {
    if (subscription?.gbpAccountId) {
      fetchPaymentHistory();
      
      // Check if recently upgraded (within last 5 minutes)
      if (subscription?.status === 'active' && subscription?.lastPaymentDate) {
        const lastPayment = new Date(subscription.lastPaymentDate);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (lastPayment > fiveMinutesAgo) {
          setShowUpgradeSuccess(true);
          // Hide the success message after 10 seconds
          setTimeout(() => setShowUpgradeSuccess(false), 10000);
        }
      }
    }
  }, [subscription]);

  const fetchPaymentHistory = async () => {
    if (!subscription?.gbpAccountId) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${backendUrl}/api/payment/subscription/${subscription.gbpAccountId}/payments`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Use payment history from subscription if available
        const payments = data.payments || subscription?.paymentHistory || [];
        setPaymentHistory(payments);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Fallback to subscription payment history if fetch fails
      if (subscription?.paymentHistory) {
        setPaymentHistory(subscription.paymentHistory);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await cancelSubscription();
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Free Trial</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge>No Subscription</Badge>;
    }
  };

  const currentPlan = subscription?.planId 
    ? plans.find(p => p.id === subscription.planId) 
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payment details
        </p>
      </div>

      {/* Upgrade Success Alert */}
      {showUpgradeSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Congratulations!</strong> Your subscription has been successfully upgraded. All premium features are now unlocked!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Subscription Summary Card - Shows trial info or subscription status */}
      {!isAdmin && isConnected && profileStats.totalConnected > 0 && (
        <Card className={status === 'trial' ? 'border-blue-400 bg-blue-50' : profileStats.needSubscription > 0 ? 'border-orange-400 bg-orange-50' : 'border-green-400 bg-green-50'}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              {status === 'trial' ? 'Free Trial Status' : 'Profile Subscription Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Trial User View */}
            {status === 'trial' ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Connected Profiles */}
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Connected Profiles</p>
                    <p className="text-3xl font-bold text-blue-600">{profileStats.totalConnected}</p>
                    <p className="text-xs text-gray-500">From Google Business</p>
                  </div>

                  {/* Trial Days Remaining */}
                  <div className="bg-white rounded-lg p-4 border border-blue-300 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Trial Days Left</p>
                    <p className="text-3xl font-bold text-blue-600">{daysRemaining || 0}</p>
                    <p className="text-xs text-gray-500">Days remaining</p>
                  </div>

                  {/* Status */}
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">Free Trial</Badge>
                    <p className="text-xs text-gray-500 mt-2">All features unlocked</p>
                  </div>
                </div>

                {/* Trial info message */}
                <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-800">
                      You're on a free trial - {daysRemaining || 0} days remaining
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Enjoy full access to all features during your trial period.
                      Subscribe before your trial ends to continue using all features.
                    </p>
                    <Button
                      className="mt-3 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsPaymentModalOpen(true)}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscribe Now
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Paid/Expired User View */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Total Connected Profiles */}
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Connected Profiles</p>
                    <p className="text-3xl font-bold text-blue-600">{profileStats.totalConnected}</p>
                    <p className="text-xs text-gray-500">From Google Business</p>
                  </div>

                  {/* Paid Slots */}
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Paid Subscriptions</p>
                    <p className="text-3xl font-bold text-green-600">{profileStats.paidSlots}</p>
                    <p className="text-xs text-gray-500">Active slots</p>
                  </div>

                  {/* Need Subscription */}
                  <div className={`bg-white rounded-lg p-4 border shadow-sm ${profileStats.needSubscription > 0 ? 'border-orange-300' : ''}`}>
                    <p className="text-sm text-gray-600 mb-1">Need Subscription</p>
                    <p className={`text-3xl font-bold ${profileStats.needSubscription > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {profileStats.needSubscription}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profileStats.needSubscription > 0 ? 'Profiles unpaid' : 'All covered'}
                    </p>
                  </div>

                  {/* Unused Slots */}
                  <div className="bg-white rounded-lg p-4 border shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Available Slots</p>
                    <p className={`text-3xl font-bold ${profileStats.unusedSlots > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                      {profileStats.unusedSlots}
                    </p>
                    <p className="text-xs text-gray-500">
                      {profileStats.unusedSlots > 0 ? 'Can add more' : 'Fully used'}
                    </p>
                  </div>
                </div>

                {/* Warning if profiles need subscription */}
                {profileStats.needSubscription > 0 && (
                  <div className="mt-4 p-4 bg-orange-100 border border-orange-300 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-orange-800">
                        {profileStats.needSubscription} profile{profileStats.needSubscription > 1 ? 's' : ''} need{profileStats.needSubscription === 1 ? 's' : ''} subscription
                      </p>
                      <p className="text-sm text-orange-700 mt-1">
                        You have {profileStats.totalConnected} connected profile{profileStats.totalConnected > 1 ? 's' : ''} but only {profileStats.paidSlots} paid slot{profileStats.paidSlots !== 1 ? 's' : ''}.
                        Subscribe to {profileStats.needSubscription} more profile{profileStats.needSubscription > 1 ? 's' : ''} to unlock all features.
                      </p>
                      <Button
                        className="mt-3 bg-orange-600 hover:bg-orange-700"
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscribe to {profileStats.needSubscription} Profile{profileStats.needSubscription > 1 ? 's' : ''}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success message if all profiles are covered */}
                {profileStats.needSubscription === 0 && profileStats.paidSlots > 0 && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">All profiles are subscribed!</p>
                      <p className="text-sm text-green-700 mt-1">
                        All {profileStats.totalConnected} connected profile{profileStats.totalConnected > 1 ? 's' : ''} {profileStats.totalConnected > 1 ? 'have' : 'has'} active subscription{profileStats.totalConnected > 1 ? 's' : ''}.
                        {profileStats.unusedSlots > 0 && ` You can add ${profileStats.unusedSlots} more profile${profileStats.unusedSlots > 1 ? 's' : ''} without additional payment.`}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Card */}
      {isAdmin ? (
        // Admin View - Show unlimited access
        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <span>Administrator Account</span>
              <Badge className="bg-purple-600">Unlimited Access</Badge>
            </CardTitle>
            <CardDescription>Full platform access with no restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Infinity className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Profiles</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">Unlimited</p>
                <p className="text-xs text-muted-foreground">No profile limits</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Status</span>
                </div>
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-xs text-muted-foreground">Permanent access</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Features</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">All</p>
                <p className="text-xs text-muted-foreground">Premium access</p>
              </div>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 border-l-4 border-purple-600">
              <p className="text-sm text-purple-900">
                <strong>Admin Privileges:</strong> You have full access to all features, unlimited profiles, and administrative controls. No subscription required.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Regular User View - Show actual subscription
        <Card className={status === 'active' ? 'border-green-500' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Current Subscription</span>
              {status === 'active' && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription>Your active plan and billing details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription Profile Count Header - Prominent Display */}
            {status === 'active' && subscription?.paidSlots && subscription.paidSlots > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-5 mb-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90 mb-1">Your Current Subscription</p>
                    <p className="text-3xl font-bold">
                      {subscription.paidSlots} Profile{subscription.paidSlots > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm mt-2 opacity-90">
                      {subscription.profileCount || 0} active • {subscription.paidSlots - (subscription.profileCount || 0)} available
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center">
                    <p className="text-2xl font-bold">${((subscription.paidSlots * 99) / 1).toFixed(0)}</p>
                    <p className="text-xs opacity-90">per year</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  {getStatusBadge(status)}
                </div>
                {daysRemaining !== null && status === 'trial' && (
                  <p className="text-sm text-muted-foreground">
                    {daysRemaining} days remaining in your free trial
                  </p>
                )}
                {status === 'active' && subscription?.subscriptionEndDate && (
                  <p className="text-sm text-muted-foreground">
                    Next billing date: {format(new Date(subscription.subscriptionEndDate), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>

              {status === 'expired' || status === 'none' ? (
                <Button onClick={() => setIsPaymentModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              ) : status === 'trial' ? (
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              ) : status === 'active' ? (
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add More Profiles
                </Button>
              ) : null}
            </div>

          {currentPlan && status === 'active' && (
            <div className="border-t pt-4">
              <div className="bg-green-50 rounded-lg p-4 mb-3">
                <h4 className="font-semibold text-green-900 mb-1">{currentPlan.name}</h4>
                <p className="text-sm text-green-700">Your premium plan is active</p>
              </div>
              {/* Slot-Based Subscription Display */}
              {subscription?.paidSlots && subscription.paidSlots > 0 && (
                <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Your Subscription Slots</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white rounded-md p-3 border border-purple-200">
                      <p className="text-2xl font-bold text-purple-600">{subscription.paidSlots}</p>
                      <p className="text-xs text-gray-600">Paid Slots</p>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-blue-200">
                      <p className="text-2xl font-bold text-blue-600">{subscription.profileCount || 0}</p>
                      <p className="text-xs text-gray-600">Active Profiles</p>
                    </div>
                    <div className={`bg-white rounded-md p-3 border ${(subscription.paidSlots - (subscription.profileCount || 0)) > 0 ? 'border-green-200' : 'border-gray-200'}`}>
                      <p className={`text-2xl font-bold ${(subscription.paidSlots - (subscription.profileCount || 0)) > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {subscription.paidSlots - (subscription.profileCount || 0)}
                      </p>
                      <p className="text-xs text-gray-600">Unused Slots</p>
                    </div>
                  </div>
                  <p className="text-xs text-purple-700 mt-3">
                    💡 Your paid slots stay valid for the entire year. Add/delete profiles freely - you only pay when exceeding your paid slots!
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Billing Amount:</span>
                  {subscription?.profileCount && subscription?.pricePerProfile ? (
                    <div>
                      <p className="font-medium text-lg">${(subscription.amount / 100).toFixed(0)}/{currentPlan.interval}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.paidSlots || subscription.profileCount} slot{(subscription.paidSlots || subscription.profileCount) > 1 ? 's' : ''} × ${(subscription.pricePerProfile / 100).toFixed(0)}/year
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium text-lg">${(currentPlan.amount / 100).toFixed(0)}/{currentPlan.interval}</p>
                  )}
                </div>
                {subscription?.lastPaymentDate && (
                  <div>
                    <span className="text-muted-foreground">Last Payment:</span>
                    <p className="font-medium">
                      {format(new Date(subscription.lastPaymentDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
                {subscription?.subscriptionStartDate && (
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <p className="font-medium">
                      {format(
                        new Date(
                          typeof subscription.subscriptionStartDate === 'string' 
                            ? subscription.subscriptionStartDate 
                            : subscription.subscriptionStartDate.seconds * 1000
                        ), 
                        'MMM dd, yyyy'
                      )}
                    </p>
                  </div>
                )}
                {subscription?.subscriptionEndDate && (
                  <div>
                    <span className="text-muted-foreground">Next Billing:</span>
                    <p className="font-medium">
                      {format(new Date(subscription.subscriptionEndDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Premium Features Unlocked:</strong>
                  {subscription?.profileCount ?
                    `Managing ${subscription.profileCount} profile${subscription.profileCount > 1 ? 's' : ''}, unlimited posts, priority support` :
                    'All limits removed, unlimited posts, priority support'
                  }
                </p>
              </div>
              {subscription?.profileCount && subscription.profileCount < 5 && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    💡 <strong>Need more profiles?</strong> Scale your business by adding more Google Business Profiles at just $99/profile/year.
                  </p>
                </div>
              )}
            </div>
          )}
          
            {status === 'trial' && currentPlan && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Trial Plan</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Enjoying full access during your {daysRemaining}-day trial period
                </p>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Tabs for Plans and History */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mt-8">
            {plans.map((plan) => (
              <div key={plan.id} className="relative pt-4">
                {currentPlan?.id === plan.id && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                      CURRENT PLAN
                    </div>
                  </div>
                )}
                {plan.popular && currentPlan?.id !== plan.id && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                      🔥 Most Popular
                    </div>
                  </div>
                )}
                {plan.id === 'yearly_plan' && currentPlan?.id !== plan.id && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                      💎 Best Value
                    </div>
                  </div>
                )}
                <Card className={`mt-3 ${
                  currentPlan?.id === plan.id
                    ? 'border-green-500 ring-2 ring-green-200'
                    : plan.popular
                    ? 'bg-[#6C21DC] border-[#6C21DC] ring-2 ring-[#6C21DC]/20'
                    : ''
                }`}>
                  <CardHeader>
                    <CardTitle className={`text-xl font-bold ${plan.popular ? 'text-white' : ''}`} style={plan.popular ? { color: '#ffffff' } : {}}>{plan.name}</CardTitle>
                    <div className="mt-2">
                      <div className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-[#6C21DC]'}`} style={plan.popular ? { color: '#ffffff' } : {}}>
                        ₹{(plan.amount / 100).toFixed(0)}
                      </div>
                      {plan.id === 'six_month_plan' && (
                        <p className="text-sm text-green-600 font-medium mt-2">
                          Save ₹600 compared to monthly
                        </p>
                      )}
                      {plan.id === 'yearly_plan' && (
                        <p className="text-sm font-medium mt-2" style={{ color: '#d1fae5' }}>
                          Best Value - Save ₹3189 per year
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} style={plan.popular ? { color: '#ffffff' } : {}} />
                          <span className={`text-sm ${plan.popular ? 'text-white' : ''}`} style={plan.popular ? { color: '#ffffff' } : {}}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {currentPlan?.id !== plan.id && (
                      <Button
                        className={`w-full ${plan.popular ? 'bg-white text-[#6C21DC] hover:bg-gray-100' : ''}`}
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        Get Started
                      </Button>
                    )}
                    
                    {currentPlan?.id === plan.id && (
                      <div className={`text-center text-sm ${plan.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                        Current Plan
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Support Section - No Card */}
            <div className="space-y-6">
              {/* Heading */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl text-gray-900 font-bold mb-1" style={{ fontFamily: 'Onest' }}>Need Help?</h3>
                  <p className="text-gray-700 font-medium text-base" style={{ fontFamily: 'Onest' }}>
                    We're here to assist you with any questions or concerns
                  </p>
                </div>
              </div>

              {/* Contact Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Support */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 hover:shadow-md">
                  <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1.5" style={{ fontFamily: 'Onest' }}>Email Support</p>
                    <a
                      href="mailto:support@googleranker.io"
                      className="text-base text-blue-600 hover:text-blue-700 font-semibold hover:underline break-all"
                      style={{ fontFamily: 'Onest' }}
                    >
                      support@googleranker.io
                    </a>
                  </div>
                </div>

                {/* WhatsApp Support */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-200 hover:shadow-md">
                  <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-1.5" style={{ fontFamily: 'Onest' }}>WhatsApp Support</p>
                    <a
                      href="https://wa.me/919549517771"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-green-600 hover:text-green-700 font-semibold hover:underline"
                      style={{ fontFamily: 'Onest' }}
                    >
                      +91 9549517771
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your past transactions and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment, index) => (
                    <div key={payment.razorpayPaymentId || index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center space-x-3">
                        {payment.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : payment.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">₹{payment.amount}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.paidAt ? format(new Date(payment.paidAt), 'MMM dd, yyyy HH:mm') : 
                             payment.createdAt ? format(
                               new Date(
                                 typeof payment.createdAt === 'string' 
                                   ? payment.createdAt 
                                   : payment.createdAt.seconds * 1000
                               ), 
                               'MMM dd, yyyy'
                             ) : 
                             'Date not available'}
                          </p>
                          {payment.description && (
                            <p className="text-xs text-muted-foreground">{payment.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          payment.status === 'success' ? 'default' :
                          payment.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {payment.status}
                        </Badge>
                        {payment.razorpayPaymentId && (
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No payment history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};

export default Billing;