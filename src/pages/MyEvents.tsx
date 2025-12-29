import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  background_image_url: string;
}

const EventCard = ({ 
  event, 
  isCreated, 
  onDelete 
}: { 
  event: Event; 
  isCreated?: boolean; 
  onDelete?: (id: string) => void;
}) => {
  const navigate = useNavigate();
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id);
    }
  };
  
  return (
    <div 
      className="relative cursor-pointer group border-2 border-foreground/30 hover:border-foreground transition-colors bg-background"
      onClick={() => navigate(isCreated ? `/event/${event.id}/edit` : `/event/${event.id}`)}
    >
      <div className="overflow-hidden">
        <div 
          className="aspect-[4/3] bg-muted bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
          style={{ backgroundImage: `url(${event.background_image_url})` }}
        />
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-0">
        <div className="bg-background border-2 border-foreground px-3 h-6 flex items-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground">{event.date}</div>
        </div>
        <div className="bg-background border-2 border-t-0 border-foreground px-3 h-6 flex items-center">
          <div className="text-[10px] font-medium text-foreground">{event.time}</div>
        </div>
      </div>
      {isCreated && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 bg-background border-2 border-foreground p-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete event"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <div className="p-4 border-t-2 border-foreground/30 group-hover:border-foreground transition-colors">
        <h3 className="font-bold tracking-tight text-foreground group-hover:underline">{event.title}</h3>
      </div>
    </div>
  );
};

const MyEvents = () => {
  const [user, setUser] = useState<User | null>(null);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'registered'>('created');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: created, error: createdError } = await supabase
        .from('events')
        .select('id, title, date, time, background_image_url')
        .eq('created_by', user.id)
        .order('target_date', { ascending: true });

      if (createdError) throw createdError;
      setCreatedEvents(created || []);

      const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          event_id,
          events (
            id,
            title,
            date,
            time,
            background_image_url
          )
        `)
        .eq('user_id', user.id);

      if (regError) throw regError;
      
      const registeredEventsData = registrations
        ?.map(r => r.events)
        .filter(Boolean) as Event[] || [];
      
      setRegisteredEvents(registeredEventsData);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully');
      fetchMyEvents();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const displayedEvents = activeTab === 'created' ? createdEvents : registeredEvents;

  return (
    <BrutalistLayout
      title="MY EVENTS"
      subtitle="Manage your created events and view events you've registered for"
    >
      <SEOHead 
        title="My Events | PourCulture"
        description="Manage your created events and view events you've registered for"
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-0 mb-8">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-2 ${
              activeTab === 'created'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-foreground/30 hover:border-foreground'
            }`}
          >
            CREATED BY ME ({createdEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors border-2 border-l-0 ${
              activeTab === 'registered'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-foreground border-foreground/30 hover:border-foreground'
            }`}
          >
            REGISTERED ({registeredEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-foreground" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-16 border-2 border-foreground/30 bg-background">
            <p className="text-muted-foreground text-sm">
              {activeTab === 'created' 
                ? "You haven't created any events yet" 
                : "You haven't registered for any events yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard 
                  event={event} 
                  isCreated={activeTab === 'created'}
                  onDelete={activeTab === 'created' ? handleDeleteEvent : undefined}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default MyEvents;
