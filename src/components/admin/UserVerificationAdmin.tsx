import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  is_verified: boolean;
  created_at: string;
  bio: string | null;
  location: string | null;
}

export const UserVerificationAdmin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('is_verified', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers((data || []) as UserProfile[]);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, is_verified: !currentStatus } : u
        )
      );

      toast.success(
        !currentStatus
          ? 'User verified successfully'
          : 'User verification removed'
      );
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const verifiedUsers = filteredUsers.filter((u) => u.is_verified);
  const unverifiedUsers = filteredUsers.filter((u) => !u.is_verified);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">USER VERIFICATION</h2>
          <p className="text-sm text-muted-foreground">
            Verify users to allow them to create wine routes
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{verifiedUsers.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Verified Users
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          className="pl-10 border-2 border-foreground/30 focus:border-foreground bg-background"
        />
      </div>

      {/* Verified Users */}
      {verifiedUsers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            Verified Users ({verifiedUsers.length})
          </h3>
          <div className="space-y-2">
            {verifiedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center justify-between p-4 border-2 border-blue-500/30 bg-blue-500/5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center border-2 border-foreground/20">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.display_name || 'Anonymous'}
                      </span>
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    {user.location && (
                      <p className="text-[10px] text-muted-foreground">
                        {user.location}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleVerification(user.user_id, user.is_verified)}
                  disabled={updating === user.user_id}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                >
                  {updating === user.user_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Unverified Users */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Unverified Users ({unverifiedUsers.length})
        </h3>
        {unverifiedUsers.length === 0 ? (
          <div className="text-center py-8 border-2 border-foreground/20">
            <p className="text-sm text-muted-foreground">No unverified users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unverifiedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center justify-between p-4 border-2 border-foreground/30 hover:border-foreground transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted flex items-center justify-center border-2 border-foreground/20">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="font-medium">
                      {user.display_name || 'Anonymous'}
                    </span>
                    {user.location && (
                      <p className="text-[10px] text-muted-foreground">
                        {user.location}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-xs">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleVerification(user.user_id, user.is_verified)}
                  disabled={updating === user.user_id}
                  className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {updating === user.user_id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Verify
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
