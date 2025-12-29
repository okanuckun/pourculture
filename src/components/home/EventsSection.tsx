import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';

type WineFair = Tables<'wine_fairs'>;

interface EventsSectionProps {
  events: WineFair[];
  loading?: boolean;
  showSidebar?: boolean;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  loading = false,
  showSidebar = true,
}) => {
  return (
    <section className="border-b border-foreground/20">
      <div className="grid grid-cols-12">
        {showSidebar && (
          <div className="col-span-12 md:col-span-3 border-r border-foreground/20 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              UPCOMING
            </p>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              EVENTS
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Wine fairs, tastings, and natural wine events worldwide.
            </p>
            <Link
              to="/submit-wine-fair"
              className="inline-flex items-center gap-2 text-xs border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              SUBMIT EVENT
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        <div className={`col-span-12 ${showSidebar ? 'md:col-span-9' : ''} divide-y divide-foreground/20`}>
          {loading ? (
            <div className="divide-y divide-foreground/20">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 animate-pulse">
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="h-8 w-12 md:w-16 bg-muted rounded" />
                    <div>
                      <div className="h-5 w-48 md:w-64 bg-muted rounded mb-2" />
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-3 w-20 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="h-3 w-12 bg-muted rounded hidden md:block" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No upcoming events. Be the first to submit one!
            </div>
          ) : (
            events.map((fair, index) => {
              const startDate = new Date(fair.start_date);
              const endDate = fair.end_date ? new Date(fair.end_date) : null;
              const dateStr = endDate
                ? `${format(startDate, 'MMM d')}-${format(endDate, 'd')}`
                : format(startDate, 'MMM d');
              const year = format(startDate, 'yyyy');

              return (
                <Link key={fair.id} to={`/wine-fair/${fair.slug}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-6 md:gap-8">
                      <span className="text-2xl md:text-3xl font-bold text-muted-foreground/30 group-hover:text-foreground transition-colors w-12 md:w-16">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-base md:text-lg font-bold tracking-tight group-hover:underline">
                          {fair.title.toUpperCase()}
                        </h4>
                        <div className="flex items-center gap-3 md:gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {fair.city.toUpperCase()}, {fair.country.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground hidden md:block">{year}</span>
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
