import React from 'react';
import { Instagram, Facebook, Twitter, Youtube, Linkedin, ExternalLink } from 'lucide-react';

interface SocialLinksProps {
  links: Record<string, string>;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  x: Twitter,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: 'hover:bg-pink-500/20 hover:text-pink-500',
  facebook: 'hover:bg-blue-600/20 hover:text-blue-600',
  twitter: 'hover:bg-sky-500/20 hover:text-sky-500',
  x: 'hover:bg-foreground/20 hover:text-foreground',
  youtube: 'hover:bg-red-500/20 hover:text-red-500',
  linkedin: 'hover:bg-blue-700/20 hover:text-blue-700',
};

export const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
  if (!links || Object.keys(links).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(links).map(([platform, url]) => {
        const Icon = SOCIAL_ICONS[platform.toLowerCase()] || ExternalLink;
        const colorClass = SOCIAL_COLORS[platform.toLowerCase()] || 'hover:bg-primary/20 hover:text-primary';
        
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2.5 rounded-full bg-muted/50 text-muted-foreground transition-colors ${colorClass}`}
            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            <Icon className="w-5 h-5" />
          </a>
        );
      })}
    </div>
  );
};
