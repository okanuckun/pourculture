import React from 'react';

interface GridOverlayProps {
  visible: boolean;
  columns?: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ 
  visible, 
  columns = 12 
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <div className="container mx-auto h-full px-6">
        <div 
          className="h-full grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <div 
              key={i} 
              className="bg-foreground/[0.03] border-x border-foreground/[0.08]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
