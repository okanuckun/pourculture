import React from 'react';

interface SERPPreviewProps {
  title: string;
  description: string;
  url: string;
  type?: 'desktop' | 'mobile';
}

export const SERPPreview: React.FC<SERPPreviewProps> = ({
  title,
  description,
  url,
  type = 'desktop',
}) => {
  const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const titleLength = title.length;
  const descLength = description.length;
  
  const titleStatus = titleLength === 0 ? 'missing' : titleLength > 60 ? 'long' : titleLength < 30 ? 'short' : 'good';
  const descStatus = descLength === 0 ? 'missing' : descLength > 160 ? 'long' : descLength < 70 ? 'short' : 'good';

  const statusColors = {
    missing: 'text-red-500',
    long: 'text-orange-500',
    short: 'text-yellow-500',
    good: 'text-green-500',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs">
        <span className={statusColors[titleStatus]}>
          Title: {titleLength}/60 chars
        </span>
        <span className="text-muted-foreground">|</span>
        <span className={statusColors[descStatus]}>
          Description: {descLength}/160 chars
        </span>
      </div>
      
      <div className={`bg-white rounded-lg border p-4 ${type === 'mobile' ? 'max-w-[360px]' : 'max-w-[600px]'}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
            P
          </div>
          <div>
            <div className="text-xs text-muted-foreground">pourculture.com</div>
            <div className="text-xs text-green-700">{displayUrl}</div>
          </div>
        </div>
        
        <h3 className="text-[#1a0dab] text-lg hover:underline cursor-pointer line-clamp-2 mb-1">
          {title || 'No title set'}
        </h3>
        
        <p className={`text-sm text-gray-600 ${type === 'mobile' ? 'line-clamp-3' : 'line-clamp-2'}`}>
          {description || 'No description set'}
        </p>
      </div>
    </div>
  );
};
