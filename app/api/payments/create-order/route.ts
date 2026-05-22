import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create a payment order
export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, tokenNumber } = await request.json();

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: tokenNumber,
      notes: {
        order_id: orderId,
        token_number: tokenNumber,
      },
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: paymentOrder.id,
      amount: amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
