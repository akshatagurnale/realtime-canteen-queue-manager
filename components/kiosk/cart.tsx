'use client';

import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export default function Cart({ items, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-background border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{item.name}</h4>
              <p className="text-sm text-muted-foreground">₹{item.price}</p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 border rounded-lg">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="p-1 hover:bg-muted"
              >
                <Minus size={16} />
              </button>
              <span className="px-3 font-semibold text-sm min-w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-muted"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="font-bold text-foreground">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
