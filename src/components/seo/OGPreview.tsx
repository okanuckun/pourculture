import React from 'react';

interface OGPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'facebook' | 'twitter';
}

export const OGPreview: React.FC<OGPreviewProps> = ({
  title,
  description,
  image,
  url,
  type = 'facebook',
}) => {
  const displayUrl = url.replace(/^https?:\/\//, '').split('/')[0];

  if (type === 'twitter') {
    return (
      <div className="max-w-[500px] rounded-2xl overflow-hidden border bg-white">
        {image ? (
          <div className="aspect-[2/1] bg-muted">
            <img src={image} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-[2/1] bg-muted flex items-center justify-center text-muted-foreground">
            No image set
          </div>
        )}
        <div className="p-3">
          <p className="text-sm text-muted-foreground mb-1">{displayUrl}</p>
          <h4 className="font-semibold text-sm line-clamp-2">{title || 'No title'}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description || 'No description'}</p>
        </div>
      </div>
    );
  }

  // Facebook style
  return (
    <div className="max-w-[500px] rounded-lg overflow-hidden border bg-[#f0f2f5]">
      {image ? (
        <div className="aspect-[1.91/1] bg-muted">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground">
          No image set
        </div>
      )}
      <div className="p-3 bg-[#f0f2f5]">
        <p className="text-xs text-[#606770] uppercase tracking-wide">{displayUrl}</p>
        <h4 className="font-semibold text-[#1d2129] mt-1 line-clamp-2">{title || 'No title'}</h4>
        <p className="text-sm text-[#606770] line-clamp-1 mt-1">{description || 'No description'}</p>
      </div>
    </div>
  );
};
