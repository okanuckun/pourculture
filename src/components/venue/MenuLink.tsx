import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuLinkProps {
  menuUrl: string;
}

export const MenuLink: React.FC<MenuLinkProps> = ({ menuUrl }) => {
  if (!menuUrl) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Menu & Price List</h2>
      </div>
      
      <a href={menuUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="w-full sm:w-auto">
          <FileText className="w-4 h-4 mr-2" />
          View Menu
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </a>
    </section>
  );
};
