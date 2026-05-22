'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ items, totalAmount, onClose, onSuccess }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [receipt, setReceipt] = useState<string>('');
  const scriptLoaded = useRef(false);

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === 'online' && !scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      scriptLoaded.current = true;
    }
  }, [paymentMethod]);

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);

      // First create the order in DB
      const createOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: items,
          paymentMethod: 'online',
          customerName: 'Student',
          customerEmail: '',
          customerPhone: '',
        }),
      });

      const orderResponse = await createOrderRes.json();
      if (!orderResponse.success) throw new Error('Failed to create order');

      const orderId = orderResponse.order.id;
      const tokenNumber = orderResponse.order.tokenNumber;
      setReceipt(orderResponse.receipt);

      // Create Razorpay payment order
      const paymentRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          orderId,
          tokenNumber,
        }),
      });

      const payment = await paymentRes.json();
      if (!payment.success) throw new Error('Failed to create payment order');

      // Open Razorpay checkout
      const options = {
        key: payment.key,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Mess Food Ordering',
        description: 'Food Order Payment',
        order_id: payment.razorpayOrderId,
        handler: async (response: any) => {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
              token_number: tokenNumber,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderData({
              tokenNumber,
              message: 'Payment successful!',
            });
          }
        },
        prefill: {
          name: 'Student',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: items,
          paymentMethod: 'cash',
          customerName: 'Student',
          customerEmail: '',
          customerPhone: '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReceipt(data.receipt);
        setOrderData({
          tokenNumber: data.order.tokenNumber,
          message: 'Cash payment pending at reception',
        });
      }
    } catch (error) {
      console.error('Error creating cash order:', error);
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<pre>' + receipt + '</pre>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Success screen
  if (orderData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{orderData.message}</h2>
            <p className="text-4xl font-bold text-primary mb-4">#{orderData.tokenNumber}</p>
            <p className="text-muted-foreground">Please collect your food when this token is announced</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handlePrint}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Print Receipt
            </button>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full bg-secondary text-secondary-foreground py-2 rounded-lg font-semibold hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Payment Method</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Items:</span>
            <span className="font-semibold">{items.length}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted transition">
            <input
              type="radio"
              name="payment"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
              className="mr-3"
            />
            <span className="font-semibold text-foreground">Online Payment (QR/Razorpay)</span>
          </label>

          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-muted transition">
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'cash')}
              className="mr-3"
            />
            <span className="font-semibold text-foreground">Pay at Reception (Cash)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={paymentMethod === 'online' ? handleOnlinePayment : handleCashPayment}
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : `Proceed with ${paymentMethod === 'online' ? 'Online' : 'Cash'} Payment`}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
