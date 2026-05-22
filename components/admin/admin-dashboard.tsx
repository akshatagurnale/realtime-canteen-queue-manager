'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SalesOverview } from './sales-overview'
import { MenuManagement } from './menu-management'
import { OrdersView } from './orders-view'
import { CashPaymentHandler } from './cash-payment-handler'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Receptionist Control Panel</h1>
          <p className="text-slate-600 mt-2">Manage food items, orders, and payments</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="cash">Cash Payment</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <SalesOverview />
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-4">
            <MenuManagement />
          </TabsContent>

          {/* Cash Payment Tab */}
          <TabsContent value="cash" className="space-y-4">
            <CashPaymentHandler />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <OrdersView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
