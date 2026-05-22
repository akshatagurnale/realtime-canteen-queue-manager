'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import useSWR from 'swr'
import { generateReceiptESCPOS } from '@/lib/printer-utils'

interface OrderItem {
  foodItemId: number
  quantity: number
}

export function CashPaymentHandler() {
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: foodItems = [] } = useSWR('/api/food-items', async (url) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('food_items')
      .select('*')
      .eq('is_available', true)
      .order('category')
    return data || []
  })

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity === 0) {
      selectedItems.delete(itemId)
    } else {
      selectedItems.set(itemId, quantity)
    }
    setSelectedItems(new Map(selectedItems))
  }

  const getTotal = () => {
    let total = 0
    selectedItems.forEach((qty, itemId) => {
      const item = foodItems.find((f: any) => f.id === itemId)
      if (item) total += item.price * qty
    })
    return total
  }

  const handleConfirmPayment = async () => {
    if (selectedItems.size === 0) return

    setIsProcessing(true)
    try {
      const supabase = createClient()

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            payment_method: 'cash',
            payment_status: 'completed',
            order_status: 'pending',
            total_amount: getTotal(),
            token_number: `T${Date.now()}`, // Temporary, will be updated by API
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      // Add order items
      const orderItems = Array.from(selectedItems.entries()).map(([itemId, qty]) => {
        const item = foodItems.find((f: any) => f.id === itemId)
        return {
          order_id: orderData.id,
          food_item_id: itemId,
          quantity: qty,
          unit_price: item.price,
          subtotal: item.price * qty,
        }
      })

      await supabase.from('order_items').insert(orderItems)

      // Generate and print receipt
      const receipt = generateReceiptESCPOS(orderData, selectedItems, foodItems)
      console.log('Receipt generated:', receipt)

      setSelectedItems(new Map())
      setSuccessMessage(`Order created with token: ${orderData.token_number}`)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error creating order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Handle Cash Payment</CardTitle>
          <CardDescription>Select items and confirm cash payment</CardDescription>
        </CardHeader>
      </Card>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Available Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {foodItems.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">₹{item.price}</p>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={selectedItems.get(item.id) || 0}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                  className="w-16"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {Array.from(selectedItems.entries()).map(([itemId, qty]) => {
                const item = foodItems.find((f: any) => f.id === itemId)
                return (
                  <div key={itemId} className="flex justify-between text-sm">
                    <span>{item?.name} x{qty}</span>
                    <span>₹{(item?.price || 0) * qty}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{getTotal()}</span>
              </div>
            </div>

            <Button
              onClick={handleConfirmPayment}
              disabled={selectedItems.size === 0 || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Confirm & Print'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
