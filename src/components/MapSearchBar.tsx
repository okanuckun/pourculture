import React from 'react';
import { Search } from 'lucide-react';

interface MapSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
  value,
  onChange,
  placeholder = "What are you looking for? (place, country, city, winemaker, event...)"
}) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-lg shadow-map text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
};
