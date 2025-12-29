import React from 'react';

interface EventMetaProps {
  date: string;
  time: string;
}

export const EventMeta: React.FC<EventMetaProps> = ({ date, time }) => {
  return (
    <div className="flex items-start gap-[-1px] relative">
      <div className="flex justify-center items-center gap-2.5 relative bg-foreground px-2 h-[24px]">
        <time className="text-background text-[11px] font-medium uppercase relative">
          {date}
        </time>
      </div>
      <div className="flex justify-center items-center gap-2.5 border-2 relative px-2 h-[24px] border-solid border-foreground">
        <time className="text-foreground text-[11px] font-medium uppercase relative">
          {time}
        </time>
      </div>
    </div>
  );
};
