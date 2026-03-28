import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Star, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Venue = Tables<'venues'>;
type Winemaker = Tables<'winemakers'>;

interface CategorySectionProps {
  title: string;
  subtitle: string;
  description?: string;
  items: (Venue | Winemaker)[];
  type: 'venue' | 'winemaker';
  linkPrefix: string;
  loading?: boolean;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  subtitle,
  description,
  items,
  type,
  linkPrefix,
  loading = false,
  showViewAll = true,
  viewAllLink,
}) => {
  const getCategoryLabel = (item: Venue | Winemaker) => {
    if (type === 'venue') {
      const venue = item as Venue;
      switch (venue.category) {
        case 'bar': return 'WINE BAR';
        case 'wine_shop': return 'SHOP';
        case 'restaurant': return 'RESTAURANT';
        default: return venue.category?.toUpperCase() || 'VENUE';
      }
    }
    return 'WINEMAKER';
  };

  const getLocation = (item: Venue | Winemaker) => {
    if (type === 'venue') {
      return (item as Venue).city?.toUpperCase() || '';
    }
    const winemaker = item as Winemaker;
    return winemaker.region?.toUpperCase() || winemaker.country?.toUpperCase() || '';
  };

  return (
    <section className="border-b border-foreground/20">
      <div className="grid grid-cols-12">
        {/* Left Column - Section Info */}
        <div className="col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-foreground/20 p-4 flex flex-col sm:flex-row md:flex-col gap-4 md:gap-0">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
              {subtitle}
            </p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter mb-2 md:mb-3">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed hidden sm:block md:mb-4">
                {description}
              </p>
            )}
          </div>
          {showViewAll && viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 text-xs border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors w-fit self-start sm:self-center md:self-start"
            >
              VIEW ALL
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Right Column - Items Grid */}
        <div className="col-span-12 md:col-span-9 p-3 sm:p-4">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-2 w-16 bg-muted rounded" />
                    <div className="h-2 w-12 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-3/4 bg-muted rounded mb-2" />
                  <div className="aspect-[4/3] bg-muted rounded overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/5 to-muted animate-[shimmer_2s_infinite]" 
                         style={{ backgroundSize: '200% 100%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No items found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {items.slice(0, 8).map((item, index) => (
                <Link
                  key={item.id}
                  to={`${linkPrefix}/${item.slug}`}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="group cursor-pointer"
                  >
                    {/* Meta Row */}
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1.5">
                      <span className="flex items-center gap-1">
                        {(item as any).is_claimed && (
                          <CheckCircle className="w-3 h-3 text-foreground" />
                        )}
                        {getCategoryLabel(item)}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-[60px]">
                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{getLocation(item)}</span>
                      </span>
                    </div>

                    {/* Name */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs sm:text-sm font-medium group-hover:underline line-clamp-1">
                        {item.name}
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/20" />
                      )}
                      {(item as any).is_featured && (
                        <span className="absolute top-1.5 left-1.5 bg-foreground text-background text-[8px] px-1.5 py-0.5 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" />
                          FEATURED
                        </span>
                      )}
                      {(item as Winemaker).is_new && (
                        <span className="absolute top-1.5 left-1.5 bg-foreground text-background text-[8px] px-1.5 py-0.5">
                          NEW
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
