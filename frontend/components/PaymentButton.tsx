'use client'

import { useState } from 'react';
import { initiatePayment } from '../utils/razorpay';

interface PaymentButtonProps {
  amount: number;
  bookingId: string;
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  className?: string;
  disabled?: boolean;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  bookingId,
  userDetails,
  onSuccess,
  onError,
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    console.log('🚀 PaymentButton clicked:', { amount, bookingId, userDetails });
    setIsLoading(true);

    try {
      console.log('🎯 Initiating payment...');
      await initiatePayment({
        amount,
        bookingId,
        userDetails,
        onSuccess: (paymentData) => {
          console.log('✅ Payment successful:', paymentData);
          setIsLoading(false);
          onSuccess(paymentData);
        },
        onError: (error) => {
          console.error('❌ Payment error:', error);
          setIsLoading(false);
          onError(error);
        }
      });
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      setIsLoading(false);
      onError(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={`
        w-full px-6 py-3 bg-green-600 hover:bg-green-700 
        disabled:bg-gray-400 disabled:cursor-not-allowed
        text-white font-semibold rounded-lg transition-colors duration-200
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing Payment...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Pay ₹{amount.toLocaleString()}
        </>
      )}
    </button>
  );
};

export default PaymentButton;