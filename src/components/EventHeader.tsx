import React from 'react';

interface EventHeaderProps {
  title: string;
  creator: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({ title, creator }) => {
  return (
    <div className="flex flex-col items-start gap-4 self-stretch relative">
      <header>
        <h1 className="self-stretch text-foreground text-[56px] font-medium leading-[54.88px] tracking-[-2.24px] relative max-md:text-[42px] max-md:leading-[38px] max-md:tracking-[-1.68px] max-sm:text-[32px] max-sm:leading-[30px] max-sm:tracking-[-1.28px] uppercase">
          {title}
        </h1>
      </header>
      <div className="self-stretch text-muted-foreground text-[11px] font-medium uppercase relative">
        BY {creator}
      </div>
    </div>
  );
};
