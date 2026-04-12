import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface NewsCardProps {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  publishedAt: string;
  onClick?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  imageUrl,
  publishedAt,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg bg-card cursor-pointer",
        "shadow-card hover:shadow-card-hover transition-all duration-300",
        "hover:-translate-y-1"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img loading="lazy" 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl">📰</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        
        {excerpt && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {excerpt}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-3">
          {format(new Date(publishedAt), 'MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
};
