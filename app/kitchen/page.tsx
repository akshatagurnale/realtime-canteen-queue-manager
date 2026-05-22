'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OrderWithItems {
  id: number
  token_number: string
  created_at: string
  order_items: Array<{
    quantity: number
    food_items: {
      name: string
    }
  }>
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        token_number,
        created_at,
        order_items (
          quantity,
          food_items (name)
        )
      `
      )
      .eq('order_date', today)
      .eq('order_status', 'pending')
      .order('created_at', { ascending: true })

    if (!error) {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const markComplete = async (orderId: number) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (!error) {
      fetchOrders()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Kitchen Display System</h1>
          <p className="text-slate-300 mt-2">Pending Orders: {orders.length}</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center">
            <Alert className="bg-green-900 border-green-700 max-w-md mx-auto">
              <AlertCircle className="h-6 w-6 text-green-400" />
              <AlertDescription className="text-green-300 text-lg">
                All orders completed! 🎉
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <CardHeader className="bg-slate-700 pb-3">
                  <CardTitle className="text-white text-3xl text-center">{order.token_number}</CardTitle>
                  <p className="text-slate-300 text-sm text-center">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {order.order_items.map((item, idx) => (
                    <div key={idx} className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-white font-semibold text-xl">{item.food_items.name}</p>
                      <p className="text-slate-300 text-2xl">Qty: {item.quantity}</p>
                    </div>
                  ))}

                  <Button
                    onClick={() => markComplete(order.id)}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                  >
                    Mark Complete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
