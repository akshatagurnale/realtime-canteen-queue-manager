// app/api/payment/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, items } = body;

    // 1. Simulate network roundtrip latency (1.5 seconds delay)
    // This makes your frontend show its loading spinner beautifully!
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Perform a basic security / validation check
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid total amount compilation ledger.' },
        { status: 400 }
      );
    }

    // 3. Generate a fake successful transaction hash signature
    const standardMockId = `TXN-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Return a successful 200 OK response payload
    return NextResponse.json({
      success: true,
      message: 'Transaction authorized successfully via Mock Ledger Gateway.',
      transactionId: standardMockId,
      amount: amount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Mock Payment Processing Failure:', error);
    return NextResponse.json(
      { success: false, message: 'Internal mock server runtime error.' },
      { status: 500 }
    );
  }
}