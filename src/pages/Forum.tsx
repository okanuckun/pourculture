import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, User, Clock, MessageCircle, Search, Loader2, HelpCircle, Lightbulb, MessagesSquare, Heart } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  comment_count: number;
  author_name: string;
  like_count: number;
  is_liked: boolean;
}

const categories = [
  { value: 'all', label: 'Tümü', icon: MessagesSquare },
  { value: 'general', label: 'Genel', icon: MessageSquare },
  { value: 'suggestion', label: 'Öneri', icon: Lightbulb },
  { value: 'question', label: 'Soru', icon: HelpCircle },
];

const categoryLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  general: { label: 'Genel', color: 'bg-blue-500/10 text-blue-600', icon: MessageSquare },
  suggestion: { label: 'Öneri', color: 'bg-amber-500/10 text-amber-600', icon: Lightbulb },
  question: { label: 'Soru', color: 'bg-green-500/10 text-green-600', icon: HelpCircle },
};

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'general' });
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

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [userId]);

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

    // Get comment counts, like counts and author names for each topic
    const topicsWithCounts = await Promise.all(
      (topicsData || []).map(async (topic) => {
        const { count: commentCount } = await supabase
          .from('forum_comments')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        const { count: likeCount } = await supabase
          .from('forum_likes')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        // Check if current user liked this topic
        let isLiked = false;
        if (userId) {
          const { data: likeData } = await supabase
            .from('forum_likes')
            .select('id')
            .eq('topic_id', topic.id)
            .eq('user_id', userId)
            .maybeSingle();
          isLiked = !!likeData;
        }

        // Get author name from profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', topic.user_id)
          .single();

        return {
          ...topic,
          comment_count: commentCount || 0,
          like_count: likeCount || 0,
          is_liked: isLiked,
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
        category: newTopic.category,
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

    setNewTopic({ title: '', content: '', category: 'general' });
    setIsDialogOpen(false);
    setSubmitting(false);
    fetchTopics();
  };

  const handleToggleLike = async (e: React.MouseEvent, topicId: string, isLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast({
        title: 'Giriş gerekli',
        description: 'Beğenmek için lütfen giriş yapın',
        variant: 'destructive',
      });
      return;
    }

    if (isLiked) {
      // Remove like
      await supabase
        .from('forum_likes')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', userId);
    } else {
      // Add like
      await supabase
        .from('forum_likes')
        .insert({
          topic_id: topicId,
          user_id: userId,
        });
    }

    // Update local state
    setTopics(topics.map(topic => 
      topic.id === topicId 
        ? { 
            ...topic, 
            is_liked: !isLiked, 
            like_count: isLiked ? topic.like_count - 1 : topic.like_count + 1 
          }
        : topic
    ));
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                        <Select
                          value={newTopic.category}
                          onValueChange={(value) => setNewTopic({ ...newTopic, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Kategori seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">
                              <span className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Genel
                              </span>
                            </SelectItem>
                            <SelectItem value="suggestion">
                              <span className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Öneri
                              </span>
                            </SelectItem>
                            <SelectItem value="question">
                              <span className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Soru
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  );
                })}
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
                            <div className="flex items-center gap-2 mb-1">
                              {topic.category && categoryLabels[topic.category] && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${categoryLabels[topic.category].color}`}>
                                  {React.createElement(categoryLabels[topic.category].icon, { className: 'w-3 h-3' })}
                                  {categoryLabels[topic.category].label}
                                </span>
                              )}
                            </div>
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
                              <button
                                onClick={(e) => handleToggleLike(e, topic.id, topic.is_liked)}
                                className={`flex items-center gap-1 transition-colors ${
                                  topic.is_liked ? 'text-red-500' : 'hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${topic.is_liked ? 'fill-current' : ''}`} />
                                {topic.like_count}
                              </button>
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
