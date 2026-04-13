import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Loader2, CheckCircle, Camera } from 'lucide-react';
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-foreground/30 hover:border-foreground flex items-center justify-center cursor-pointer overflow-hidden transition-colors relative group"
              >
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {formData.avatar_url ? (
                  <>
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-background" />
                    </div>
                  </>
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Tap to upload a photo</p>
                <p className="text-[10px] mt-0.5">JPG, PNG — max 2MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                if (file.size > 2 * 1024 * 1024) {
                  toast.error('File too large — max 2MB');
                  return;
                }
                setUploadingAvatar(true);
                try {
                  const ext = file.name.split('.').pop();
                  const path = `${user.id}/avatar.${ext}`;
                  const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
                  if (uploadErr) throw uploadErr;
                  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
                  setFormData(prev => ({ ...prev, avatar_url: `${urlData.publicUrl}?t=${Date.now()}` }));
                  toast.success('Photo uploaded!');
                } catch (err: any) {
                  toast.error(err.message || 'Upload failed');
                } finally {
                  setUploadingAvatar(false);
                }
              }}
            />
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
