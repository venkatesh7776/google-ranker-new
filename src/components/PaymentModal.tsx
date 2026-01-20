import React, { useState, useEffect } from 'react';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, CreditCard, Shield, Zap, Tag, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useGoogleBusinessProfileContext } from '@/contexts/GoogleBusinessProfileContext';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/subscriptionService';
import { useNavigate } from 'react-router-dom';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlanId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultPlanId = 'yearly_plan'
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState(defaultPlanId);
  const [profileCount, setProfileCount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDetails, setCouponDetails] = useState<{
    success: boolean;
    finalAmount: number;
    discountAmount: number;
    description: string;
    error?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(88.718); // Dynamic exchange rate, default fallback

  // Slot-based subscription state
  const [paidSlots, setPaidSlots] = useState(0);
  const [additionalProfilesNeeded, setAdditionalProfilesNeeded] = useState(0);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);

  const { Razorpay } = useRazorpay();
  const { currentUser } = useAuth();
  const { subscription, checkSubscriptionStatus } = useSubscription();
  const { accounts } = useGoogleBusinessProfileContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://googleranker-backend.onrender.com';
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_example';

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlanId);

  // Calculate total accounts based on connected GBP accounts and their locations
  const totalConnectedProfiles = accounts?.reduce((total, account) => {
    return total + (account.locations?.length || 0);
  }, 0) || 0;


  // Check slot-based payment requirements when modal opens or profile count changes
  useEffect(() => {
    if (isOpen && totalConnectedProfiles > 0) {
      checkProfilePaymentStatus();
    }
  }, [isOpen, totalConnectedProfiles]);

  const checkProfilePaymentStatus = async () => {
    if (!currentUser) return;

    setIsCheckingSlots(true);
    try {
      const response = await fetch(`${backendUrl}/api/payment/subscription/check-profile-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gbpAccountId: subscription?.gbpAccountId,
          userId: currentUser.id,
          currentProfileCount: totalConnectedProfiles
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[PaymentModal] Slot check result:', data);

        setPaidSlots(data.paidSlots || 0);
        setAdditionalProfilesNeeded(data.additionalProfilesNeeded || 0);

        if (!data.paymentNeeded) {
          // User has enough paid slots - show success message and close modal
          toast({
            title: "All Profiles Covered",
            description: data.message,
          });
          // Don't close modal automatically - let user see they have slots available
        } else if (data.additionalProfilesNeeded > 0) {
          // Set profile count to only the additional profiles needed
          setProfileCount(data.additionalProfilesNeeded);

          toast({
            title: "Additional Profiles Detected",
            description: data.message,
          });
        }
      }
    } catch (error) {
      console.error('[PaymentModal] Error checking slot status:', error);
    } finally {
      setIsCheckingSlots(false);
    }
  };

  // Fetch live exchange rate when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchExchangeRate = async () => {
        try {
          console.log('[PaymentModal] 🔄 Fetching live exchange rate...');
          const response = await fetch(`${backendUrl}/api/payment/detect-currency`);

          if (response.ok) {
            const data = await response.json();
            const rate = data.exchangeRate || 88.718;
            setExchangeRate(rate);
            console.log(`[PaymentModal] ✅ Live exchange rate: 1 USD = ${rate} INR`);
          } else {
            console.warn('[PaymentModal] ⚠️ Using fallback rate: 88.718 INR');
          }
        } catch (error) {
          console.error('[PaymentModal] ❌ Error fetching exchange rate:', error);
          console.warn('[PaymentModal] ⚠️ Using fallback rate: 88.718 INR');
        }
      };

      fetchExchangeRate();
    }
  }, [isOpen, backendUrl]);

  // Reset coupon when profile count or plan changes (user needs to re-apply)
  useEffect(() => {
    if (couponDetails) {
      setCouponDetails(null);
    }
  }, [profileCount, selectedPlanId]);
  
  const validateCoupon = async () => {
    if (!couponCode || !selectedPlan) return;
    
    setIsValidatingCoupon(true);
    try {
      const response = await fetch(`${backendUrl}/api/payment/coupon/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          amount: selectedPlan.amount,
          userId: currentUser?.id
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCouponDetails(result);
        toast({
          title: "Coupon Applied!",
          description: `${result.description} - You save ₹${(result.discountAmount / 100).toFixed(2)}`,
        });
      } else {
        setCouponDetails(null);
        toast({
          title: "Invalid Coupon",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive"
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };
  
  const getFinalAmount = () => {
    if (couponDetails && couponDetails.success) {
      return couponDetails.finalAmount;
    }
    return selectedPlan?.amount || 0;
  };

  const handlePayment = async () => {
    if (!currentUser || !selectedPlan) {
      toast({
        title: "Error",
        description: "Please select a plan and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    if (!Razorpay) {
      toast({
        title: "Error",
        description: "Payment system is not loaded. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // USE ONE-TIME PAYMENT (Simpler, works with all Razorpay accounts)
    return handleOneTimePayment();
  };

  const handleOneTimePayment = async () => {
    try {
      // Show loading toast
      toast({
        title: "Initializing Payment",
        description: "Please wait while we set up your payment...",
      });

      // Get amount (already in paise for INR)
      let amount = selectedPlan.amount;

      // Apply coupon discount if available
      console.log('[Payment] 🔍 Checking coupon:', { couponDetails, hasCouponDetails: !!couponDetails, finalAmount: couponDetails?.finalAmount });

      if (couponDetails && couponDetails.finalAmount) {
        amount = couponDetails.finalAmount;
        console.log(`[Payment] 🎟️ Coupon applied: Original ₹${(selectedPlan.amount / 100)} → Discounted ₹${amount / 100}`);
      } else {
        console.log('[Payment] ⚠️ Coupon NOT applied - couponDetails:', couponDetails);
      }

      // Razorpay requires minimum Rs. 1
      if (amount < 100) { // 100 paise = Rs. 1
        console.log(`[Payment] ⚠️ Amount too low (₹${amount / 100}), setting to minimum ₹1`);
        amount = 100;
      }

      console.log(`[Payment] 💰 Amount: ₹${amount / 100} (${amount} paise)`);

      // Step 1: Create Razorpay Order
      console.log('[Payment] 📋 Creating Razorpay order...');
      const orderResponse = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount, // Amount in paise
          currency: 'INR',
          userId: currentUser.id,
          email: currentUser.email,
          gbpAccountId: subscription?.gbpAccountId,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          notes: {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            subscriptionType: 'yearly',
            ...(couponDetails && couponCode && {
              couponCode: couponCode,
              originalAmount: selectedPlan.amount,
              discountAmount: couponDetails.discountAmount,
              finalAmount: couponDetails.finalAmount
            })
          }
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Payment] Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const { order } = await orderResponse.json();
      console.log('[Payment] ✅ Order created:', order.id);

      // Step 2: Open Razorpay Checkout
      const options: RazorpayOrderOptions = {
        key: razorpayKeyId,
        order_id: order.id,
        amount: amount,
        currency: 'INR',
        name: 'Google Ranker',
        description: `${selectedPlan.name} - One Year Access`,
        prefill: {
          email: currentUser.email || '',
          name: currentUser.displayName || currentUser.email || '',
          contact: currentUser.phoneNumber || ''
        },
        theme: {
          color: '#6C21DC'
        },
        handler: async (response) => {
          try {
            console.log('[Payment] 💳 Payment completed, verifying...');
            // Verify payment on backend
            const verifyResponse = await fetch(`${backendUrl}/api/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: currentUser.id,
                gbpAccountId: subscription?.gbpAccountId,
                planId: selectedPlan.id,
                amount: amount,
                profileCount: profileCount,
                couponCode: couponCode || null
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('[Payment] ✅ Payment verified successfully:', verifyData);

              toast({
                title: "Payment Successful!",
                description: "Your subscription has been activated for 1 year. Enjoy unlimited access!",
              });

              // Close modal
              onClose();

              // Set flag to indicate we're reloading after payment
              sessionStorage.setItem('post_payment_reload', 'true');

              // Force subscription status refresh IMMEDIATELY before navigation
              console.log('[Payment] 🔄 Refreshing subscription status...');
              await checkSubscriptionStatus();

              // Small delay to ensure state updates, then navigate
              setTimeout(() => {
                console.log('[Payment] ✅ Navigating to payment success page');
                navigate(`/payment-success?profiles=${profileCount}`);
              }, 500);
            } else {
              // Get the actual error from the backend
              const errorData = await verifyResponse.json().catch(() => ({}));
              console.error('[Payment] Verification failed:', verifyResponse.status, errorData);
              throw new Error(errorData.details || errorData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('[Payment] Verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "There was an issue verifying your payment. Please contact support.",
              variant: "destructive"
            });
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            // Modal already closed, just show info toast
            toast({
              title: "Payment Cancelled",
              description: "You can complete payment later from the Billing page.",
              variant: "default"
            });
          },
          escape: true,
          backdropclose: false,
          handleback: true,
          confirm_close: true
        }
      };

      // Initialize Razorpay and open payment modal
      console.log('[Payment] 🚀 Opening Razorpay checkout...');

      // Close our dialog before opening Razorpay to prevent interference
      onClose();

      const razorpayInstance = new Razorpay(options);

      // Listen for payment failure
      razorpayInstance.on('payment.failed', function (response) {
        console.error('[Payment] ❌ Payment failed:', response.error);
        setIsProcessing(false);
        toast({
          title: "Payment Failed",
          description: response.error.description || "Payment was unsuccessful. Please try again.",
          variant: "destructive"
        });
      });

      // Open Razorpay modal
      razorpayInstance.open();

    } catch (error) {
      console.error('[Payment] ❌ Setup error:', error);

      // Use the actual error message from the backend
      let errorMessage = error.message || "There was an error setting up your payment. Please try again.";

      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message.includes('order')) {
        errorMessage = "Failed to create payment order. Please try again.";
      } else if (error.message.includes('Razorpay')) {
        errorMessage = "Payment gateway error. Please refresh the page and try again.";
      }

      toast({
        title: "Payment Setup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 bg-background z-20 px-6 pt-6 pb-4 border-b">
          <DialogTitle>
            {additionalProfilesNeeded > 0
              ? `Pay for ${additionalProfilesNeeded} Additional Profile${additionalProfilesNeeded > 1 ? 's' : ''}`
              : 'Upgrade Your Profile Access'
            }
          </DialogTitle>
          <DialogDescription>
            {paidSlots > 0 ? (
              <div className="space-y-1">
                <p>You currently have {paidSlots} paid slot{paidSlots !== 1 ? 's' : ''} and {totalConnectedProfiles} profile{totalConnectedProfiles !== 1 ? 's' : ''}.</p>
                {additionalProfilesNeeded > 0 ? (
                  <p className="text-primary font-medium">Pay only for {additionalProfilesNeeded} additional profile{additionalProfilesNeeded !== 1 ? 's' : ''} at $99/profile/year.</p>
                ) : (
                  <p className="text-green-600 font-medium">All your profiles are covered! You have {paidSlots - totalConnectedProfiles} unused slot{(paidSlots - totalConnectedProfiles) !== 1 ? 's' : ''}.</p>
                )}
              </div>
            ) : (
              <p>Choose how many Google Business Profiles you want to manage. Pay only for what you need at $99 per profile per year.</p>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
          <RadioGroup
            value={selectedPlanId}
            onValueChange={setSelectedPlanId}
            className="space-y-4"
          >
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all relative ${
                  selectedPlanId === plan.id && plan.popular
                    ? 'bg-[#6C21DC] border-[#6C21DC] ring-2 ring-[#6C21DC]/20'
                    : selectedPlanId === plan.id
                    ? 'border-primary ring-2 ring-primary ring-opacity-20'
                    : plan.popular
                    ? 'bg-[#6C21DC] border-[#6C21DC] hover:ring-2 hover:ring-[#6C21DC]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Best Value
                    </div>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={plan.id} className={plan.popular ? 'border-white text-white' : ''} />
                      <div>
                        <CardTitle className={`text-lg ${plan.popular ? 'text-white' : ''}`}>{plan.name}</CardTitle>
                        <div className="mt-2">
                          <div className={`text-2xl font-bold ${plan.popular ? 'text-white' : 'text-[#6C21DC]'}`}>
                            ₹{(plan.amount / 100).toFixed(0)}
                          </div>
                          {plan.id === 'six_month_plan' && (
                            <p className="text-xs text-green-600 font-medium mt-1">
                              Save ₹600 compared to monthly
                            </p>
                          )}
                          {plan.id === 'yearly_plan' && (
                            <p className="text-xs text-white/90 font-medium mt-1">
                              Best Value - Save ₹3189 per year
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                        <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-600'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>

          {/* Slot-based Subscription Info Banner */}
          {paidSlots > 0 && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-900">Your Subscription Slots</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-md p-2 border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{paidSlots}</p>
                    <p className="text-xs text-gray-600">Paid Slots</p>
                  </div>
                  <div className="bg-white rounded-md p-2 border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{totalConnectedProfiles}</p>
                    <p className="text-xs text-gray-600">Active Profiles</p>
                  </div>
                  <div className={`bg-white rounded-md p-2 border ${additionalProfilesNeeded > 0 ? 'border-red-200' : 'border-green-200'}`}>
                    <p className={`text-2xl font-bold ${additionalProfilesNeeded > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {additionalProfilesNeeded > 0 ? additionalProfilesNeeded : (paidSlots - totalConnectedProfiles)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {additionalProfilesNeeded > 0 ? 'Need Payment' : 'Unused Slots'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  💡 <strong>How it works:</strong> Paid slots never decrease during your subscription year. Add/delete profiles freely - you only pay when you exceed your paid slots!
                </p>
              </div>
            </div>
          )}


          <div className="mt-6 space-y-4">
            {/* Coupon Code Section */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-900">Have a coupon code?</p>
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                    disabled={isValidatingCoupon}
                  />
                  <Button
                    onClick={validateCoupon}
                    disabled={!couponCode || isValidatingCoupon || !selectedPlan}
                    variant="outline"
                    size="sm"
                  >
                    {isValidatingCoupon ? 'Validating...' : 'Apply'}
                  </Button>
                </div>
                {couponDetails && couponDetails.success && (
                  <div className="bg-green-100 rounded-md p-2">
                    <p className="text-sm text-green-800">
                      ✓ {couponDetails.description} - You save ${(couponDetails.discountAmount / 100).toFixed(2)}!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    💳 Multiple Payment Options Available
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-blue-700">
                    <div className="flex items-center space-x-1">
                      <span>🏦</span>
                      <span>Net Banking</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📱</span>
                      <span>UPI (GPay, PhonePe, Paytm)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>💳</span>
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👝</span>
                      <span>Digital Wallets</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Your payment information is encrypted and secure. We support Cards, PayPal, and international payment methods via Razorpay.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Payment is processed in INR (Indian Rupees) at live exchange rate: 1 USD = ₹{exchangeRate.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Instant Activation
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Your subscription will be activated immediately after payment confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-background border-t px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              {couponDetails && couponDetails.success ? (
                <div>
                  <p className="text-sm text-gray-500 line-through">
                    {selectedPlanId === 'per_profile_yearly'
                      ? `$${(SubscriptionService.calculateTotalPrice(profileCount) / 100).toFixed(0)}`
                      : `$${(selectedPlan?.amount / 100).toFixed(0)}`
                    }
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(getFinalAmount() / 100).toFixed(0)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      /{selectedPlan?.interval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{Math.round((getFinalAmount() / 100) * exchangeRate)}/{selectedPlan?.interval === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold">
                    ${(getFinalAmount() / 100).toFixed(0)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      /{selectedPlan?.interval === 'monthly' ? 'month' : 'year'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{Math.round((getFinalAmount() / 100) * exchangeRate)}/{selectedPlan?.interval === 'monthly' ? 'month' : 'year'}
                  </p>
                  {selectedPlanId === 'per_profile_yearly' && (
                    <p className="text-sm text-gray-600">
                      {profileCount} profile{profileCount > 1 ? 's' : ''} × $99/year
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500">
                Plus applicable taxes
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="min-w-[160px] bg-primary hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade Profiles
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};