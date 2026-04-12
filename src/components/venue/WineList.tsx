import React from 'react';
import { Wine, Grape, MapPin, Euro } from 'lucide-react';

interface WineItem {
  name: string;
  grape?: string;
  region?: string;
  price?: string;
  description?: string;
}

interface WineListProps {
  wines: WineItem[];
  title?: string;
}

export const WineList: React.FC<WineListProps> = ({ wines, title = "Wine List" }) => {
  if (!wines || wines.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Wine className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-muted-foreground text-sm">({wines.length})</span>
      </div>
      
      <div className="grid gap-3">
        {wines.map((wine, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{wine.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {wine.grape && (
                    <span className="inline-flex items-center gap-1">
                      <Grape className="w-3.5 h-3.5" />
                      {wine.grape}
                    </span>
                  )}
                  {wine.region && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {wine.region}
                    </span>
                  )}
                </div>
                {wine.description && (
                  <p className="text-sm text-muted-foreground mt-2">{wine.description}</p>
                )}
              </div>
              {wine.price && (
                <span className="inline-flex items-center gap-1 text-primary font-semibold whitespace-nowrap">
                  <Euro className="w-4 h-4" />
                  {wine.price}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
