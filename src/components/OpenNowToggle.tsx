import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OpenNowToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const OpenNowToggle: React.FC<OpenNowToggleProps> = ({
  checked,
  onCheckedChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        id="open-now"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary"
      />
      <Label 
        htmlFor="open-now" 
        className="text-sm font-medium text-foreground cursor-pointer"
      >
        OPEN?
      </Label>
    </div>
  );
};
