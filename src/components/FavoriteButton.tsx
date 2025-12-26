import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onClick,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        isFavorite
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
        sizeClasses[size],
        className
      )}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          isFavorite && 'fill-current'
        )}
      />
    </button>
  );
};
