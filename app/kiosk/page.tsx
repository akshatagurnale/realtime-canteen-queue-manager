'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client'; // Imported Supabase client
import KioskMenu from '@/components/kiosk/kiosk-menu';
import Cart from '@/components/kiosk/cart';
import PaymentModal from '@/components/kiosk/payment-modal';

// Explicit Strongly-Typed Interfaces
export interface FoodItem {
  id: number;
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  description?: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export default function KioskPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // Dynamic categories state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadKioskData();
  }, []);

  const loadKioskData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Food Items from your existing API route
      const response = await fetch('/api/food-items');
      if (!response.ok) throw new Error('Failed to fetch food items');
      const data = await response.json();
      setFoodItems(data || []);

      // 2. Fetch Live Categories directly from Supabase
      const supabase = createClient();
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (!catError && catData) {
        // Map table objects into a simple string array
        setCategories(catData.map((c) => c.name));
      }
    } catch (error) {
      console.error('Error loading kiosk interface data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Functional State Updates to eliminate closure bugs
  const addToCart = (item: FoodItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((c) => c.id === item.id);
      if (existingItem) {
        return prevCart.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: number, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((c) => c.id !== itemId);
      }
      return prevCart.map((c) => (c.id === itemId ? { ...c, quantity } : c));
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((c) => c.id !== itemId));
  };

  // Floating-Point Binary Precision Fix for Accounting Calculations
  const totalAmount = Math.round(
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;

  return (
    <div className="flex h-screen bg-background font-sans antialiased select-none">
      {/* Menu Section */}
      <div className="flex-1 bg-background overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-10 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Mess Food Ordering
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Tap your items below to compile your custom daily order meal tray.
            </p>
          </div>
        </div>

        <div className="p-6 flex-1">
          {/* Visual Layout Skeleton Loader Fallback */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="h-48 bg-muted rounded-xl border p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-5 bg-neutral-300 dark:bg-neutral-700 rounded w-2/3"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-neutral-300 dark:bg-neutral-700 rounded-lg w-full"></div>
                </div>
              ))}
            </div>
          ) : foodItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed rounded-xl p-8">
              <p className="text-lg font-medium text-muted-foreground">No menu items published.</p>
              <p className="text-sm text-neutral-400 mt-1">Check back once the daily forecasting window re-opens.</p>
            </div>
          ) : (
            /* Pass the live fetched categories down into the menu component */
            <KioskMenu 
              items={foodItems} 
              categories={categories} 
              onAddToCart={addToCart} 
            />
          )}
        </div>
      </div>

      {/* Cart Summary Side Panel Column */}
      <div className="w-96 bg-card border-l flex flex-col shadow-xl">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Order</h2>
            {cart.length > 0 && (
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {cart.reduce((total, item) => total + item.quantity, 0)} Items
              </span>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-4/5 text-center px-4 space-y-2">
              <p className="text-base font-medium text-muted-foreground">Tray is currently empty</p>
              <p className="text-xs text-neutral-400">Select items from the main menu area to begin checkout routines.</p>
            </div>
          ) : (
            <Cart
              items={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemove={removeFromCart}
            />
          )}
        </div>

        {/* Total Ledger Processing and Access Action Area */}
        {cart.length > 0 && (
          <div className="border-t bg-background p-6 space-y-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-muted-foreground">Grand Total Value:</span>
              <span className="text-3xl font-black text-foreground tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-md hover:brightness-110 active:scale-[0.99] transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Proceed to Account Payment
            </button>
          </div>
        )}
      </div>

      {/* Cashless System Payment Ledger Gate Modal wrapper */}
      {showPayment && (
        <PaymentModal
          items={cart}
          totalAmount={totalAmount}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setCart([]);
            setShowPayment(false);
          }}
        />
      )}
    </div>
  );
}