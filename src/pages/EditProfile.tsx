import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  is_verified: boolean;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  instagram: string | null;
  twitter: string | null;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    location: '',
    website: '',
    instagram: '',
    twitter: '',
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          location: data.location || '',
          website: data.website || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim() || null,
          bio: formData.bio.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
          location: formData.location.trim() || null,
          website: formData.website.trim() || null,
          instagram: formData.instagram.trim().replace('@', '') || null,
          twitter: formData.twitter.trim().replace('@', '') || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      navigate(`/profile/${user.id}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-foreground" />
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      title="EDIT PROFILE"
      subtitle="Update your public profile information"
      showBackButton
      backPath={user ? `/profile/${user.id}` : '/'}
      backLabel="Profile"
    >
      <SEOHead
        title="Edit Profile | PourCulture"
        description="Edit your PourCulture profile"
      />

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {profile?.is_verified && (
          <div className="flex items-center gap-2 p-4 border-2 border-blue-500/30 bg-blue-500/5 mb-6">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-sm">Verified Account</p>
              <p className="text-[10px] text-muted-foreground">
                You can create wine routes for the community
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Display Name
            </label>
            <Input
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Your name"
              className="border-2 border-foreground/30 focus:border-foreground bg-background"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Bio
            </label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="border-2 border-foreground/30 focus:border-foreground bg-background"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Avatar URL
            </label>
            <Input
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://..."
              className="border-2 border-foreground/30 focus:border-foreground bg-background"
            />
            {formData.avatar_url && (
              <div className="mt-2">
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="w-16 h-16 object-cover border-2 border-foreground/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Paris, France"
              className="border-2 border-foreground/30 focus:border-foreground bg-background"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Website
            </label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
              className="border-2 border-foreground/30 focus:border-foreground bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Instagram
              </label>
              <Input
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="username"
                className="border-2 border-foreground/30 focus:border-foreground bg-background"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Twitter / X
              </label>
              <Input
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="username"
                className="border-2 border-foreground/30 focus:border-foreground bg-background"
              />
            </div>
          </div>

          <div className="border-t-2 border-foreground/20 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-wider border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </BrutalistLayout>
  );
};

export default EditProfile;
