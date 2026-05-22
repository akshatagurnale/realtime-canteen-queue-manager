'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Order {
  id: number
  token_number: string
  total_amount: number
  payment_method: string
  payment_status: string
  order_status: string
  created_at: string
}

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date', today)
      .order('created_at', { ascending: false })

    if (!error) {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (loading) {
    return <div className="text-center text-slate-600">Loading orders...</div>
  }

  const pendingOrders = orders.filter((o) => o.order_status === 'pending')
  const completedOrders = orders.filter((o) => o.order_status === 'completed')
  const cancelledOrders = orders.filter((o) => o.order_status === 'cancelled')

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-3">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">No pending orders</CardContent>
          </Card>
        ) : (
          pendingOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{order.token_number}</p>
                    <p className="text-sm text-slate-600">₹{order.total_amount}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status}
                    </Badge>
                    <Badge variant="outline">{order.payment_method}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-3">
        {completedOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">No completed orders</CardContent>
          </Card>
        ) : (
          completedOrders.map((order) => (
            <Card key={order.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{order.token_number}</p>
                    <p className="text-sm text-slate-600">₹{order.total_amount}</p>
                  </div>
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="space-y-3">
        {cancelledOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-slate-600">No cancelled orders</CardContent>
          </Card>
        ) : (
          cancelledOrders.map((order) => (
            <Card key={order.id} className="opacity-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{order.token_number}</p>
                    <p className="text-sm text-slate-600">₹{order.total_amount}</p>
                  </div>
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
