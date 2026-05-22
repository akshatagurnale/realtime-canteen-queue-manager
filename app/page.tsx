'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            Mess Food Ordering System
          </h1>
          <p className="text-slate-600 text-lg">
            Complete solution for college cafeteria management
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Student Kiosk */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/kiosk')}>
            <CardHeader>
              <CardTitle className="text-2xl">📱 Student Kiosk</CardTitle>
              <CardDescription>Order food at touchscreen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                • Browse menu categories
                • Select food items
                • Pay via QR code
                • Get token receipt
              </p>
              <Button className="w-full">Open Kiosk</Button>
            </CardContent>
          </Card>

          {/* Receptionist Panel */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/login')}>
            <CardHeader>
              <CardTitle className="text-2xl">👨‍💼 Receptionist</CardTitle>
              <CardDescription>Manage orders & menu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                • Handle cash payments
                • Manage menu items
                • View sales dashboard
                • Reprint tokens
              </p>
              <Button className="w-full">Login Panel</Button>
            </CardContent>
          </Card>

          {/* Kitchen Display */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/kitchen')}>
            <CardHeader>
              <CardTitle className="text-2xl">👨‍🍳 Kitchen Display</CardTitle>
              <CardDescription>Prepare orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                • View pending orders
                • See preparation list
                • Mark orders complete
                • No login required
              </p>
              <Button className="w-full">Open Display</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-lg font-semibold text-green-600">✓ Live</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Database</p>
                <p className="text-lg font-semibold text-green-600">✓ Connected</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Payments</p>
                <p className="text-lg font-semibold text-green-600">✓ Razorpay</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Printer</p>
                <p className="text-lg font-semibold text-green-600">✓ ESC/POS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-slate-600">
        </div>
      </div>
    </div>
  )
}
