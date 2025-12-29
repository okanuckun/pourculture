import { useState, useRef, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { AuthSheet } from '@/components/AuthSheet';
import { SEOHead } from '@/components/SEOHead';
import { Trash2 } from 'lucide-react';
import { z } from 'zod';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';

const eventSchema = z.object({
  eventName: z.string().trim().min(1, 'Event name is required').max(200, 'Event name must be less than 200 characters'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format (e.g., 15:00)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format (e.g., 16:00)'),
  location: z.string().trim().min(1, 'Location is required').max(300, 'Location must be less than 300 characters'),
  description: z.string().trim().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
});

const EditEvent = () => {
  const { id } = useParams();
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrants, setRegistrants] = useState<Array<{ display_name: string; registered_at: string }>>([]);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setShowAuthModal(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setShowAuthModal(false);
      } else {
        setShowAuthModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && id) {
      fetchEvent();
    }
  }, [user, id]);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [eventName]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Event not found');
        navigate('/my-events');
        return;
      }

      if (data.created_by !== user?.id) {
        toast.error('You do not have permission to edit this event');
        navigate('/my-events');
        return;
      }

      setEventName(data.title);
      setDescription(data.description);
      setLocation(data.address);
      setImagePreview(data.background_image_url);

      const targetDate = new Date(data.target_date);
      setStartDate(targetDate);
      
      const [start, end] = data.time.split(' - ');
      setStartTime(start);
      setEndTime(end);

      setEndDate(targetDate);

      await fetchRegistrants();

      setLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      navigate('/my-events');
    }
  };

  const fetchRegistrants = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          registered_at,
          profiles:user_id (display_name)
        `)
        .eq('event_id', id)
        .order('registered_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedRegistrants = data.map((reg: any) => ({
          display_name: reg.profiles?.display_name || 'Anonymous',
          registered_at: reg.registered_at
        }));
        setRegistrants(formattedRegistrants);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching registrants:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a JPG, PNG, GIF, or WebP image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }

    const validationResult = eventSchema.safeParse({
      eventName,
      startTime,
      endTime,
      location,
      description,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = imagePreview;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const targetDate = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      targetDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);

      const dateStr = format(startDate, 'MMMM dd, yyyy');
      const timeStr = `${startTime} - ${endTime}`;

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const creatorName = profile?.display_name || user.email?.split('@')[0] || 'Anonymous';

      const { error: updateError } = await supabase
        .from('events')
        .update({
          title: eventName,
          description: description,
          date: dateStr,
          time: timeStr,
          address: location,
          background_image_url: imageUrl,
          target_date: targetDate.toISOString(),
          creator: creatorName,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Event updated successfully!');
      navigate('/my-events');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating event:', error);
      toast.error('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Event deleted successfully');
      navigate('/my-events');
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <BrutalistLayout title="Edit Event">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-foreground text-2xl font-medium uppercase tracking-wider">Loading...</div>
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Edit Event"
        description="Update your event details and settings"
      />
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <BrutalistLayout title="Edit Event">
        {user ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto pb-8 md:pb-16 px-4 md:px-8"
          >
            <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
              {/* Left: Image Upload */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col gap-3 md:gap-4"
              >
                <label className="w-full aspect-[4/3] border-2 border-foreground bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-foreground text-[11px] font-medium uppercase tracking-wider">
                      ADD IMAGE
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                
                {imagePreview && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 text-[13px] font-medium uppercase tracking-wider border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    Change Image
                  </button>
                )}
              </motion.div>

              {/* Right: Form Fields */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4 md:space-y-6"
              >
                <textarea
                  ref={titleRef}
                  placeholder="Event name"
                  className="w-full text-foreground text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-[1.2] mb-4 md:mb-8 focus:outline-none bg-transparent border-none p-0 placeholder:text-muted-foreground resize-none overflow-hidden whitespace-pre-wrap break-words"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  rows={1}
                />

                {/* Start/End Date/Time Container */}
                <div className="relative">
                  {/* Start Date/Time */}
                  <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border-2 border-foreground mb-4 md:mb-6">
                    <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r-2 border-foreground px-2 md:px-3 py-2 md:py-3 bg-background">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-foreground rounded-full"></div>
                      <span className="text-[14px] md:text-[17px] font-medium text-foreground">Start</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r-2 border-foreground focus:outline-none bg-background",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          {startDate ? format(startDate, "EEE, dd MMM") : "Select date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-2 border-foreground" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="text"
                      placeholder="15:00"
                      className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-foreground text-center focus:outline-none placeholder:text-muted-foreground bg-background"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  {/* End Date/Time */}
                  <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border-2 border-foreground">
                    <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r-2 border-foreground px-2 md:px-3 py-2 md:py-3 bg-background">
                      <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-foreground rounded-full"></div>
                      <span className="text-[14px] md:text-[17px] font-medium text-foreground">End</span>
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r-2 border-foreground focus:outline-none bg-background",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          {endDate ? format(endDate, "EEE, dd MMM") : "Select date"}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-2 border-foreground" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      type="text"
                      placeholder="16:00"
                      className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-foreground text-center focus:outline-none placeholder:text-muted-foreground bg-background"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Add event location"
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-foreground border-2 border-foreground focus:outline-none placeholder:text-muted-foreground bg-background"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                {/* Description */}
                <textarea
                  placeholder="Add description"
                  rows={6}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-foreground border-2 border-foreground focus:outline-none resize-none placeholder:text-muted-foreground bg-background"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Registrants List */}
                {registrants.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="border-2 border-foreground p-4"
                  >
                    <h3 className="text-[14px] font-medium uppercase tracking-wider text-foreground mb-4">
                      Registrants ({registrants.length})
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {registrants.map((reg, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-foreground/20 last:border-b-0">
                          <span className="text-foreground text-[14px]">{reg.display_name}</span>
                          <span className="text-muted-foreground text-[12px]">
                            {format(new Date(reg.registered_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mt-4 md:mt-8">
                  {/* Update Button */}
                  <div className="group flex items-center self-stretch relative overflow-hidden">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex h-[50px] justify-center items-center gap-2.5 border-2 relative px-2.5 py-3.5 transition-all duration-300 ease-in-out w-[calc(100%-50px)] z-10 bg-foreground border-foreground group-hover:w-full group-hover:bg-primary group-hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Update event"
                    >
                      <span className="text-background text-[13px] font-normal uppercase relative transition-colors duration-300 group-hover:text-primary-foreground">
                        {isSubmitting ? 'UPDATING...' : 'UPDATE EVENT'}
                      </span>
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 12 12" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute right-[18px] opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100"
                        aria-hidden="true"
                      >
                        <path d="M0.857178 6H10.3929" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                    <div className="flex w-[50px] h-[50px] justify-center items-center border-2 absolute right-0 bg-background rounded-full border-foreground transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-50 pointer-events-none z-0">
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 12 12" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="text-foreground"
                        aria-hidden="true"
                      >
                        <path d="M0.857178 6H10.3929" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6.39282 10L10.3928 6L6.39282 2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={handleDeleteEvent}
                    className="flex h-[50px] justify-center items-center gap-2 px-4 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-[13px] font-normal uppercase">Delete Event</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </BrutalistLayout>
    </>
  );
};

export default EditEvent;