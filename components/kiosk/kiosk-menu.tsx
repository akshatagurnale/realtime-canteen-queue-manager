'use client';

import { useState } from 'react';
import { FoodItem } from '@/app/kiosk/page'; // Adjust path if necessary
import { Plus } from 'lucide-react';

interface KioskMenuProps {
  items: FoodItem[];
  categories: string[]; // Accepts live categories from parent container
  onAddToCart: (item: FoodItem) => void;
}

export default function KioskMenu({ items, categories, onAddToCart }: KioskMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');

  // Prefix 'All Items' tab option to the live database categories array
  const displayCategories = ['All Items', ...categories];

  // Filter items matching selected category tab pill
  const filteredItems = selectedCategory === 'All Items'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Pills Filter Bar Area */}
      <div className="flex flex-wrap gap-2 pb-2 border-b overflow-x-auto scroller-hidden">
        {displayCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
              selectedCategory === cat
                ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Items Display Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
          No food items active under "{selectedCategory}" today.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group bg-card rounded-xl border shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between transition-all duration-200"
            >
              {/* Product Card Image Container */}
              <div className="relative h-40 bg-slate-50 border-b flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-400">No Product Image</span>
                )}
              </div>

              {/* Product Content Details Ledger */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground tracking-tight leading-tight">
                      {item.name}
                    </h3>
                    <span className="text-xl font-black text-slate-900 flex-shrink-0">
                      ₹{item.price}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-slate-900 text-white group-hover:bg-primary group-hover:text-primary-foreground py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-colors duration-150"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add to Tray
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}