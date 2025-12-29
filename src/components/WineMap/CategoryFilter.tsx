import React from 'react';
import { motion } from 'framer-motion';
import { WineVenueCategory, CATEGORY_CONFIG } from './types';

interface CategoryFilterProps {
  selectedCategory: WineVenueCategory;
  onCategoryChange: (category: WineVenueCategory) => void;
  venueCounts: Record<WineVenueCategory, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  venueCounts,
}) => {
  const categories: WineVenueCategory[] = ['all', 'wine_shop', 'wine_bar', 'winery', 'restaurant'];
  
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-2 max-w-[calc(100%-2rem)]">
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => {
          const config = CATEGORY_CONFIG[category];
          const count = category === 'all' 
            ? Object.values(venueCounts).reduce((a, b) => a + b, 0) - (venueCounts.all || 0)
            : venueCounts[category] || 0;
          const isSelected = selectedCategory === category;
          
          return (
            <motion.button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${isSelected 
                  ? 'text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              style={{
                backgroundColor: isSelected ? config.color : undefined,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
              <span className={`
                px-1.5 py-0.5 rounded-full text-xs
                ${isSelected ? 'bg-white/20' : 'bg-gray-200'}
              `}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
