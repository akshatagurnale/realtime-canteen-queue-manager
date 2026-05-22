import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
      token_number,
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update order payment status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        payment_id: razorpay_payment_id,
      })
      .eq('id', order_id);

    if (updateError) throw updateError;

    // Update daily sales
    const today = new Date().toISOString().split('T')[0];
    const { data: sales } = await supabase
      .from('daily_sales')
      .select('*')
      .eq('sale_date', today)
      .single();

    const { data: order } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('id', order_id)
      .single();

    if (sales) {
      await supabase
        .from('daily_sales')
        .update({
          total_revenue: sales.total_revenue + order.total_amount,
          online_revenue: sales.online_revenue + order.total_amount,
          total_orders: sales.total_orders + 1,
        })
        .eq('sale_date', today);
    } else {
      await supabase.from('daily_sales').insert({
        sale_date: today,
        total_orders: 1,
        total_revenue: order.total_amount,
        online_revenue: order.total_amount,
        cash_revenue: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      token_number,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
