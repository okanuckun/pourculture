import React from 'react';
import { Clock, Check, X } from 'lucide-react';

interface OpeningHoursProps {
  hours: Record<string, string>;
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

export const OpeningHours: React.FC<OpeningHoursProps> = ({ hours }) => {
  if (!hours || Object.keys(hours).length === 0) {
    return null;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const isOpenNow = (dayHours: string): boolean => {
    if (dayHours.toLowerCase() === 'closed' || dayHours === '-') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Try to parse hours like "10:00 - 22:00"
    const match = dayHours.match(/(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?/);
    if (match) {
      const openHour = parseInt(match[1]) * 60 + parseInt(match[2] || '0');
      const closeHour = parseInt(match[3]) * 60 + parseInt(match[4] || '0');
      return currentTime >= openHour && currentTime <= closeHour;
    }
    
    return false;
  };

  const sortedDays = DAY_ORDER.filter(day => day in hours);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Çalışma Saatleri</h2>
      </div>
      
      <div className="rounded-lg bg-muted/50 overflow-hidden">
        {sortedDays.map((day) => {
          const dayHours = hours[day];
          const isToday = day === today;
          const isClosed = dayHours.toLowerCase() === 'closed' || dayHours === '-';
          const isCurrentlyOpen = isToday && isOpenNow(dayHours);
          
          return (
            <div 
              key={day}
              className={`flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 ${
                isToday ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {DAY_NAMES[day]}
                </span>
                {isToday && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isCurrentlyOpen 
                      ? 'bg-status-open/10 text-status-open' 
                      : 'bg-status-closed/10 text-status-closed'
                  }`}>
                    {isCurrentlyOpen ? 'Açık' : 'Kapalı'}
                  </span>
                )}
              </div>
              <span className={`text-sm ${isClosed ? 'text-muted-foreground' : 'text-foreground'}`}>
                {isClosed ? 'Kapalı' : dayHours}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
