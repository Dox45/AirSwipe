'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const amount = searchParams.get('amount');
  const eventId = searchParams.get('eventId');
  const userId = searchParams.get('userId');
  const waitingListId = searchParams.get('waitingListId');

  const [isLoading, setIsLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);


useEffect(() => {
    if (email && amount && eventId && userId && waitingListId && !paymentInitiated) {
      setPaymentInitiated(true);
      initiatePayment();
    }
  }, [email, amount, eventId, userId, waitingListId, paymentInitiated]);

  const initiatePayment = async () => {
    if (!email || !amount || !userId || !eventId || !waitingListId) {
      toast.error("Invalid payment details.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Initiating payment with:", { email, amount });

      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          amount: Number(amount) * 100, 
          eventId, 
          userId, 
          waitingListId 
      }),
    });

      const data = await response.json();
      console.log("Response:", data);

      if (data.status) {
        const paystackUrl = data.data.authorization_url;
        console.log("Redirecting to:", paystackUrl);

        const newWindow = window.open(paystackUrl, '_blank');
        if (!newWindow) {
          window.location.href = paystackUrl;
        }
      } else {
        throw new Error(`Failed to initialize payment: ${data.message}`);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-2">Confirm Payment Details</h2>
        
        {email && amount ? (
          <>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Amount:</strong> ₦{amount}</p>

            <button
              onClick={initiatePayment}
              disabled={isLoading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </button>
          </>
        ) : (
          <p className="text-red-500">Invalid payment details.</p>
        )}
      </div>
    </div>
  );
}
