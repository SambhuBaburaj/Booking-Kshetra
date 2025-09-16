import { paymentAPI } from '../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency?: string;
  bookingId: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

export const initiatePayment = async (options: PaymentOptions): Promise<void> => {
  console.log('🔄 InitiatePayment called with:', options);

  const scriptLoaded = await loadRazorpayScript();
  console.log('📜 Razorpay script loaded:', scriptLoaded);

  if (!scriptLoaded) {
    console.error('❌ Failed to load Razorpay SDK');
    options.onError({ message: 'Failed to load Razorpay SDK' });
    return;
  }

  try {
    console.log('🔧 Creating payment order on backend...');
    console.log('📋 Payment order data being sent:', {
      amount: options.amount,
      bookingId: options.bookingId,
      bookingIdType: typeof options.bookingId,
      bookingIdLength: options.bookingId?.length
    });

    // Create order on backend first
    const response = await paymentAPI.createOrder({
      amount: options.amount,
      bookingId: options.bookingId
    });

    console.log('📋 Order creation response:', response.data);

    const orderData = response.data;
    
    if (!orderData.success) {
      throw new Error(orderData.message || 'Failed to create payment order');
    }

    const razorpayOptions = {
      key: 'rzp_test_RHyWk20J1eq916',
      amount: orderData.data.amount,
      currency: orderData.data.currency,
      name: 'Kshetra Retreat Resort',
      description: `Booking Payment - ${options.bookingId}`,
      order_id: orderData.data.id,
      prefill: {
        name: options.userDetails.name,
        email: options.userDetails.email,
        contact: options.userDetails.phone
      },
      theme: {
        color: '#2c5aa0'
      },
      handler: async (response: any) => {
        try {
          // Verify payment on backend
          const verifyResponse = await paymentAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: options.bookingId
          });

          const verifyData = verifyResponse.data;
          
          if (verifyData.success) {
            options.onSuccess({
              ...response,
              bookingId: options.bookingId,
              amount: options.amount
            });
          } else {
            options.onError({ message: verifyData.message || 'Payment verification failed' });
          }
        } catch (error) {
          options.onError(error);
        }
      },
      modal: {
        ondismiss: () => {
          options.onError({ message: 'Payment was cancelled by user' });
        }
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();

  } catch (error) {
    options.onError(error);
  }
};