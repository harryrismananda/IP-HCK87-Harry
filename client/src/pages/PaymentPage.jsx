import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../slices/profileSlice";
import http from "../helpers/http";
import { showError, showSuccess } from "../helpers/alert";

export const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Memoize user_data to prevent recreating on every render
  const user_data = useMemo(() => {
    return JSON.parse(localStorage.getItem("user_data") || '{}');
  }, []);
  
  // Extract userId to avoid dependency issues
  const userId = user_data.id;
  
  // Redux state
  const { data: profileData, loading: profileLoading, error: profileError } = useSelector(state => state.profile);
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [snapLoaded, setSnapLoaded] = useState(false);
  const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Try sandbox URL
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
      setSnapLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
      showError('Failed to load payment system. Please refresh the page.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  },[clientKey]);
  // Check if user is authenticated and fetch profile
  useEffect(() => {
    if (!userId || !localStorage.getItem("access_token")) {
      navigate('/login');
      return;
    }
    
    // Fetch profile data to check premium status
    dispatch(fetchProfile(userId));
    
    // Check for redirect from Midtrans
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const transactionStatus = urlParams.get('transaction_status');
    const orderId = urlParams.get('order_id');
    
    if (status === 'finished' && transactionStatus && orderId) {
      console.log('Redirected from Midtrans:', { status, transactionStatus, orderId });
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
        showSuccess('Payment successful! Welcome to Premium!');
        // Update user data and refresh profile data
        const updatedUserData = { ...user_data, isPremium: true };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
        // Refresh profile data from database
        dispatch(fetchProfile(userId));
        setTimeout(() => navigate('/profile'), 2000);
      } else if (transactionStatus === 'pending') {
        showError('Payment is pending. Please complete your payment.');
      } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
        console.log('Payment was cancelled or failed');
      }
    }
  }, [navigate, userId, dispatch, user_data]);

  // Check for Midtrans Snap availability
  useEffect(() => {
    const checkSnapLoaded = () => {
      if (window.snap) {
        console.log('Midtrans Snap detected');
        setSnapLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkSnapLoaded()) return;

    // Check periodically for up to 5 seconds
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals
    
    const interval = setInterval(() => {
      attempts++;
      
      if (checkSnapLoaded()) {
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error('Midtrans Snap failed to load within timeout');
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);
 
  const premiumPlans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: 1000,
      duration: '1 Month',
      features: [
        'Access to all premium courses',
        'Unlimited practice sessions',
        'Priority customer support',
        'Download materials for offline use',
        'Certificate of completion'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: 999000,
      originalPrice: 1188000,
      duration: '12 Months',
      features: [
        'Access to all premium courses',
        'Unlimited practice sessions',
        'Priority customer support',
        'Download materials for offline use',
        'Certificate of completion',
        'Exclusive webinars and workshops',
        '2 months free!'
      ],
      popular: true
    }
  ];

  const handleUpgradeToPremium = async () => {
    console.log('Payment button clicked');
    console.log('snapLoaded:', snapLoaded);
    console.log('window.snap:', window.snap);
    
    if (processingPayment) return;

    // Check if Snap is loaded
    if (!snapLoaded || !window.snap) {
      console.error('Snap not ready:', { snapLoaded, hasSnap: !!window.snap });
      showError('Payment system is still loading. Please wait and try again.');
      return;
    }

    setProcessingPayment(true);
    try {
      const selectedPlanData = premiumPlans.find(plan => plan.id === selectedPlan);
      
      console.log('Creating order for:', {
        userId: userId,
        amount: selectedPlanData.price,
        plan: selectedPlanData.name
      });

      // Create order first
      const orderResponse = await http({
        method: 'post',
        url: '/transactions/create-order',
        data: {
          userId: userId,
          amount: selectedPlanData.price
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      console.log('Order created successfully:', orderResponse.data);

      // Create transaction with Midtrans
      const transactionResponse = await http({
        method: 'post',
        url: '/transactions/create-transaction',
        data: {
          parameter: orderResponse.data.parameter
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      console.log('Transaction created successfully:', transactionResponse.data);

      // Check if we got a token
      if (!transactionResponse.data.token) {
        throw new Error('No payment token received from server');
      }

      console.log('About to open Snap modal with token:', transactionResponse.data.token);

      // Open Midtrans Snap modal with real token
      window.snap.pay(transactionResponse.data.token, {
        onSuccess: function(result) {
          console.log('Payment success:', result);
          showSuccess('Payment successful! Welcome to Premium!');
          
          // Update local storage user data
          const updatedUserData = { ...user_data, status: true };
          localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          
          // Refresh profile data from database
          dispatch(fetchProfile(userId));
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        },
        onPending: function(result) {
          console.log('Payment pending:', result);
          showError('Payment is pending. Please complete your payment.');
        },
        onError: function(result) {
          console.log('Payment error:', result);
          showError('Payment failed. Please try again.');
        },
        onClose: function() {
          console.log('Payment modal closed by user');
          // Don't show error for cancelled payments, just log it
          console.log('User cancelled the payment');
        }
      });

    } catch (error) {
      console.error('Payment process error:', error);
      
      // More specific error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred';
        console.error('Server error response:', error.response.data);
        showError(`Payment failed: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Network error:', error.request);
        showError('Failed to connect to payment server. Please check your internet connection.');
      } else {
        // Other errors
        console.error('Unexpected error:', error);
        showError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  // Check if user is premium (ONLY from database/Redux profile data - no localStorage fallback)
  const isPremium = profileData?.isPremium === true;

  // Loading state - show loading until we have profile data
  if (profileLoading || !profileData) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">Loading your account information...</p>
        </div>
      </div>
    );
  }

  // Error state - if profile loading failed
  if (profileError && !profileData) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="alert alert-error max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Unable to load account information</h3>
              <div className="text-xs">Please try refreshing the page or contact support if the issue persists.</div>
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary btn-sm"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="btn btn-ghost btn-sm"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium user view
  if (isPremium) {
    return (
      <div className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="avatar mb-6">
              <div className="w-24 rounded-full bg-success text-success-content flex items-center justify-center">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-4">
              You're Already Premium!
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              You have full access to all premium features and courses.
            </p>
          </div>

          {/* Premium Status Card */}
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-8">
            <div className="card-body text-center">
              <h2 className="card-title text-3xl justify-center mb-4">
                <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium Member
              </h2>
              <p className="text-lg opacity-90">
                Welcome {user_data.fullName || 'Premium User'}! Enjoy unlimited access to all our features.
              </p>
            </div>
          </div>

          {/* Premium Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-success">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active Benefits
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Access to all premium courses
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited practice sessions
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority customer support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Download materials offline
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-info">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/courses')}
                    className="btn btn-primary btn-sm w-full"
                  >
                    Browse Premium Courses
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="btn btn-outline btn-sm w-full"
                  >
                    Manage Profile
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="btn btn-ghost btn-sm w-full"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="text-center">
            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 className="font-bold">Need help with your premium account?</h3>
                <div className="text-sm">Contact our priority support team for assistance with your premium features.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Unlock unlimited access to all courses and premium features
          </p>
        </div>

        {/* Current User Info */}
        <div className="alert alert-info mb-8 max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">Upgrading account for: {user_data.fullName}</h3>
            <div className="text-sm">{user_data.email}</div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {premiumPlans.map((plan) => (
            <div 
              key={plan.id}
              className={`card bg-base-100 shadow-xl ${plan.popular ? 'ring-2 ring-primary' : ''} ${
                selectedPlan === plan.id ? 'border-2 border-primary' : ''
              } cursor-pointer transition-all duration-200 hover:shadow-2xl`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="badge badge-primary absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </div>
              )}
              
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-2xl">{plan.name}</h2>
                  <input 
                    type="radio" 
                    name="plan" 
                    className="radio radio-primary" 
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                  />
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-base-content/60 line-through ml-2">
                        Rp {plan.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <p className="text-base-content/70">{plan.duration}</p>
                  {plan.originalPrice && (
                    <div className="badge badge-success mt-2">
                      Save Rp {(plan.originalPrice - plan.price).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-success mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Button */}
        <div className="text-center">
          <button 
            className={`btn btn-primary btn-lg px-12 ${(processingPayment || !snapLoaded) ? 'loading' : ''}`}
            onClick={handleUpgradeToPremium}
            disabled={processingPayment || !snapLoaded}
          >
            {processingPayment ? 'Processing...' : 
             !snapLoaded ? 'Loading Payment System...' : 
             `Upgrade to Premium - Rp ${premiumPlans.find(p => p.id === selectedPlan)?.price.toLocaleString('id-ID')}`}
          </button>
          
          <p className="text-sm text-base-content/60 mt-4">
            Secure payment powered by Midtrans. Cancel anytime.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-base-content mb-4">
              Why Upgrade to Premium?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary text-primary-content rounded-full w-16">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Unlimited Access</h3>
              <p className="text-base-content/70">
                Access all premium courses and content without any restrictions
              </p>
            </div>
            
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-secondary text-secondary-content rounded-full w-16">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced Features</h3>
              <p className="text-base-content/70">
                Get access to advanced learning tools and offline downloads
              </p>
            </div>
            
            <div className="text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-accent text-accent-content rounded-full w-16">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Priority Support</h3>
              <p className="text-base-content/70">
                Get priority customer support and exclusive learning resources
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};