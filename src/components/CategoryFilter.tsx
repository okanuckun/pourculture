import React from 'react';
import { Wine, UtensilsCrossed, Store, Hotel, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VenueCategory = 'all' | 'restaurant' | 'bar' | 'wine_shop' | 'accommodation' | 'winemaker' | 'event';

interface CategoryFilterProps {
  selectedCategory: VenueCategory;
  onCategoryChange: (category: VenueCategory) => void;
}

const categories: { id: VenueCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: null },
  { id: 'restaurant', label: 'Restaurants', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'bar', label: 'Bars', icon: <Wine className="w-4 h-4" /> },
  { id: 'wine_shop', label: 'Wine shops', icon: <Store className="w-4 h-4" /> },
  { id: 'accommodation', label: 'Accommodations', icon: <Hotel className="w-4 h-4" /> },
  { id: 'winemaker', label: 'Winemakers', icon: <Users className="w-4 h-4" /> },
  { id: 'event', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            "border border-border hover:border-primary",
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground hover:bg-primary/5"
          )}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
};
