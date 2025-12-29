import React from 'react';

interface EventDescriptionProps {
  description: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description
}) => {
  return (
    <section className="flex flex-col items-start gap-4 self-stretch relative">
      <div className="flex flex-col items-start gap-5 self-stretch relative my-0">
        <hr className="h-0.5 self-stretch relative bg-foreground border-0" />
        <h2 className="self-stretch text-foreground text-[11px] font-medium uppercase relative">
          ABOUT THIS EVENT
        </h2>
      </div>
      <p className="self-stretch text-foreground text-[17px] font-normal leading-[20.74px] tracking-[-0.34px] relative">
        {description}
      </p>
    </section>
  );
};