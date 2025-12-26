import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, User, Clock, MessageCircle, Search, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  comment_count: number;
  author_name: string;
}

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    fetchTopics();

    return () => subscription.unsubscribe();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    
    // Fetch topics with comment counts and author names
    const { data: topicsData, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      setLoading(false);
      return;
    }

    // Get comment counts for each topic
    const topicsWithCounts = await Promise.all(
      (topicsData || []).map(async (topic) => {
        const { count } = await supabase
          .from('forum_comments')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        // Get author name from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', topic.user_id)
          .single();

        return {
          ...topic,
          comment_count: count || 0,
          author_name: profile?.display_name || 'Anonymous',
        };
      })
    );

    setTopics(topicsWithCounts);
    setLoading(false);
  };

  const handleCreateTopic = async () => {
    if (!userId) {
      toast({
        title: 'Giriş gerekli',
        description: 'Konu açmak için lütfen giriş yapın',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({
        title: 'Hata',
        description: 'Başlık ve içerik gereklidir',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title: newTopic.title.trim(),
        content: newTopic.content.trim(),
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Hata',
        description: 'Konu oluşturulamadı',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: 'Başarılı',
      description: 'Konu başarıyla oluşturuldu',
    });

    setNewTopic({ title: '', content: '' });
    setIsDialogOpen(false);
    setSubmitting(false);
    fetchTopics();
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Forum | Natural Wine Community"
        description="Join the natural wine community discussion. Share your experiences, ask questions, and connect with fellow wine enthusiasts."
      />
      <RaisinNavbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Wine Community Forum</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Topluluğa Katıl
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Doğal şarap tutkunlarıyla deneyimlerini paylaş, sorular sor ve bağlantı kur.
              </p>

              {/* Search and New Topic */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Konularda ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 w-full sm:w-auto">
                      <Plus className="w-4 h-4" />
                      Yeni Konu
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Yeni Konu Aç</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Input
                          placeholder="Konu başlığı"
                          value={newTopic.title}
                          onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Konu içeriğinizi yazın..."
                          value={newTopic.content}
                          onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                          rows={5}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleCreateTopic} disabled={submitting}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oluştur'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Topics List */}
        <section className="py-8 md:py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz konu yok. İlk konuyu sen aç!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={`/forum/${topic.id}`}>
                      <article className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {topic.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                              {topic.content}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {topic.author_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {topic.comment_count} yorum
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Forum;
