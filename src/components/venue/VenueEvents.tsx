import React from 'react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface VenueEvent {
  title: string;
  date: string;
  time?: string;
  description?: string;
  ticket_url?: string;
  price?: string;
}

interface VenueEventsProps {
  events: VenueEvent[];
}

export const VenueEvents: React.FC<VenueEventsProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  // Filter to show only upcoming events
  const now = new Date();
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  }).slice(0, 5);

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
        <span className="text-muted-foreground text-sm">({upcomingEvents.length})</span>
      </div>
      
      <div className="space-y-3">
        {upcomingEvents.map((event, index) => {
          const eventDate = new Date(event.date);
          
          return (
            <div 
              key={index}
              className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">{event.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(eventDate, 'd MMMM yyyy', { locale: enUS })}
                    </span>
                    {event.time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </span>
                    )}
                    {event.price && (
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" />
                        {event.price}
                      </span>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                  )}
                </div>
                
                {event.ticket_url && (
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      Get Tickets
                    </Button>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
