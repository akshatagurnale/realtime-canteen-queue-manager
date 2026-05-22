import { createClient } from '@/lib/supabase/server';
import { generateTokenNumber, generateThermalReceipt } from '@/lib/printer-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { orderItems, paymentMethod, customerName, customerEmail, customerPhone } = await request.json();

    // Calculate total
    const totalAmount = orderItems.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Get or create today's token counter
    const today = new Date().toISOString().split('T')[0];
    const { data: counterData, error: counterError } = await supabase
      .from('token_counter')
      .select('*')
      .eq('counter_date', today)
      .single();

    let tokenCounter = 1;
    if (counterData) {
      tokenCounter = counterData.last_number + 1;
    } else {
      await supabase.from('token_counter').insert({
        counter_date: today,
        last_number: 1,
      });
    }

    const tokenNumber = generateTokenNumber(tokenCounter);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        token_number: tokenNumber,
        order_date: today,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'pending' : 'pending',
        order_status: 'pending',
        total_amount: totalAmount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const orderItemsData = orderItems.map((item: any) => ({
      order_id: order.id,
      food_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Update token counter
    await supabase
      .from('token_counter')
      .update({ last_number: tokenCounter })
      .eq('counter_date', today);

    // Generate receipt for printing
    const receipt = generateThermalReceipt({
      tokenNumber,
      orderItems: orderItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentMethod,
      timestamp: new Date().toLocaleString('en-IN'),
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        tokenNumber,
        totalAmount,
        paymentMethod,
      },
      receipt,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const status = request.nextUrl.searchParams.get('status');

    let query = supabase
      .from('orders')
      .select('*, order_items(*, food_items(*))')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('order_status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ orders: data });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
