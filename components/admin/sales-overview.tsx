'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface SalesData {
  totalOrders: number
  totalRevenue: number
  cashRevenue: number
  onlineRevenue: number
}

export function SalesOverview() {
  const [sales, setSales] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('daily_sales')
        .select('*')
        .eq('sale_date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sales:', error)
      }

      setSales({
        totalOrders: data?.total_orders || 0,
        totalRevenue: data?.total_revenue || 0,
        cashRevenue: data?.cash_revenue || 0,
        onlineRevenue: data?.online_revenue || 0,
      })
      setLoading(false)
    }

    fetchSales()
    const interval = setInterval(fetchSales, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-center text-slate-600">Loading sales data...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Today's Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{sales?.totalOrders || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Total orders placed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">₹{sales?.totalRevenue || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Today's total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Online Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">₹{sales?.onlineRevenue || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Via QR payment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Cash Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">₹{sales?.cashRevenue || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Collected at counter</p>
        </CardContent>
      </Card>
    </div>
  )
}
