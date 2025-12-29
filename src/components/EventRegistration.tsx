import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

interface EventRegistrationProps {
  eventId: string;
  onRegister: () => void;
  isRegistered: boolean;
  className?: string;
  onAuthRequired?: () => void;
  targetDate?: Date;
}

export const EventRegistration: React.FC<EventRegistrationProps> = ({ 
  eventId,
  onRegister, 
  isRegistered: initialIsRegistered,
  className = "",
  onAuthRequired,
  targetDate
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkRegistration(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [eventId]);

  const checkRegistration = async (userId: string) => {
    const { data } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .maybeSingle();
    
    setIsRegistered(!!data);
  };

  const getEventStatus = () => {
    if (!targetDate) return 'upcoming';
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const distance = target - now;
    const oneHour = 1000 * 60 * 60;
    
    if (distance < -oneHour) return 'ended';
    if (distance >= -oneHour && distance <= oneHour) return 'happening';
    return 'upcoming';
  };

  const eventStatus = getEventStatus();
  const isPastEvent = eventStatus === 'ended';

  const handleRegister = async () => {
    if (isPastEvent) {
      toast({
        title: 'Event has ended',
        description: 'You cannot register for past events',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to register for events',
          variant: 'destructive'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      if (isRegistered) {
        const { error } = await supabase
          .from('event_registrations')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        setIsRegistered(false);
        toast({
          title: 'Unregistered',
          description: 'You have been unregistered from this event'
        });
      } else {
        const { error } = await supabase
          .from('event_registrations')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        setIsRegistered(true);
        onRegister();
        toast({
          title: 'Registered!',
          description: 'You have successfully registered for this event'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`group flex items-center self-stretch relative overflow-hidden ${className}`}>
      <button 
        onClick={handleRegister}
        disabled={loading || isPastEvent}
        className={`flex h-[50px] justify-center items-center gap-2.5 border-2 relative px-2.5 py-3.5 border-solid transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-[calc(100%-50px)] z-10 ${
          isPastEvent 
            ? 'bg-muted border-muted cursor-not-allowed' 
            : 'bg-foreground border-foreground group-hover:w-full group-hover:bg-primary group-hover:border-primary'
        }`}
        aria-label={isPastEvent ? "Event has ended" : isRegistered ? "Unregister from event" : "Register for event"}
      >
        <span className={`text-background text-[13px] font-medium uppercase relative transition-colors duration-300 ${!isPastEvent && 'group-hover:text-primary-foreground'}`}>
          {loading ? "LOADING..." : isPastEvent ? "EVENT ENDED" : isRegistered ? "UNREGISTER" : "REGISTER"}
        </span>
        <ArrowRight 
          className="w-3 h-3 absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 text-primary-foreground"
          aria-hidden="true"
        />
      </button>
      {!isPastEvent && (
        <div className="flex w-[50px] h-[50px] justify-center items-center border-2 absolute right-0 bg-background rounded-full border-solid border-foreground transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
          <ArrowRight className="w-3 h-3 text-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
