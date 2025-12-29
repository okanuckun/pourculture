import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, User, Clock, MessageCircle, Search, Loader2, HelpCircle, Lightbulb, MessagesSquare, Heart, ImagePlus, X } from 'lucide-react';
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
  image_url: string | null;
}

const categories = [
  { value: 'all', label: 'ALL', icon: MessagesSquare },
  { value: 'general', label: 'GENERAL', icon: MessageSquare },
  { value: 'suggestion', label: 'SUGGESTION', icon: Lightbulb },
  { value: 'question', label: 'QUESTION', icon: HelpCircle },
];

const categoryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  general: { label: 'GENERAL', icon: MessageSquare },
  suggestion: { label: 'SUGGESTION', icon: Lightbulb },
  question: { label: 'QUESTION', icon: HelpCircle },
};

const Forum = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', category: 'general' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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
    
    const { data: topicsData, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .order('created_at', { ascending: false });

    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      setLoading(false);
      return;
    }

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
          image_url: topic.image_url,
        };
      })
    );

    setTopics(topicsWithCounts);
    setLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreateTopic = async () => {
    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please sign in to create a topic',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(fileName, selectedImage);

      if (uploadError) {
        toast({
          title: 'Error',
          description: 'Failed to upload image',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from('forum_topics')
      .insert({
        title: newTopic.title.trim(),
        content: newTopic.content.trim(),
        category: newTopic.category,
        user_id: userId,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create topic',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    toast({
      title: 'Success',
      description: 'Topic created successfully',
    });

    setNewTopic({ title: '', content: '', category: 'general' });
    setSelectedImage(null);
    setImagePreview(null);
    setIsDialogOpen(false);
    setSubmitting(false);
    fetchTopics();
  };

  const handleToggleLike = async (e: React.MouseEvent, topicId: string, isLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast({
        title: 'Login required',
        description: 'Please sign in to like topics',
        variant: 'destructive',
      });
      return;
    }

    if (isLiked) {
      await supabase
        .from('forum_likes')
        .delete()
        .eq('topic_id', topicId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('forum_likes')
        .insert({
          topic_id: topicId,
          user_id: userId,
        });
    }

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
    <BrutalistLayout>
      <SEOHead
        title="Forum | POURCULTURE"
        description="Join the natural wine community discussion. Share your experiences, ask questions, and connect with fellow wine enthusiasts."
      />
      
      {/* Hero Section */}
      <div className="border-b border-foreground/20 px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] tracking-wider text-muted-foreground mb-4 block">COMMUNITY</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">Forum</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Share your experiences, ask questions, and connect with fellow wine enthusiasts.
            </p>

            {/* Search and New Topic */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mt-8">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-foreground/20 bg-transparent"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
                    <Plus className="w-4 h-4" />
                    NEW TOPIC
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg border-foreground/20">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New Topic</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Select
                        value={newTopic.category}
                        onValueChange={(value) => setNewTopic({ ...newTopic, category: value })}
                      >
                        <SelectTrigger className="border-foreground/20">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            <span className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              General
                            </span>
                          </SelectItem>
                          <SelectItem value="suggestion">
                            <span className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Suggestion
                            </span>
                          </SelectItem>
                          <SelectItem value="question">
                            <span className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              Question
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input
                        placeholder="Topic title"
                        value={newTopic.title}
                        onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                        className="border-foreground/20"
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Write your topic content..."
                        value={newTopic.content}
                        onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                        rows={5}
                        className="border-foreground/20"
                      />
                    </div>
                    
                    {/* Image Upload */}
                    <div>
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-foreground text-background rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 border border-dashed border-foreground/20 p-4 cursor-pointer hover:border-foreground/40 transition-colors">
                          <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Add image (optional)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-foreground/20">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTopic} disabled={submitting} className="bg-foreground text-background">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
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
                    className={`flex items-center gap-2 px-4 py-2 text-[10px] tracking-wider transition-all ${
                      selectedCategory === cat.value
                        ? 'bg-foreground text-background'
                        : 'border border-foreground/20 hover:border-foreground/50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Topics List */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-12 border border-foreground/20">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No topics found' : 'No topics yet. Be the first to start a discussion!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTopics.map((topic, index) => {
              const categoryInfo = categoryLabels[topic.category] || categoryLabels.general;
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={`/forum/${topic.id}`}
                    className="block border border-foreground/20 p-4 md:p-6 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] tracking-wider border border-foreground/20">
                            <CategoryIcon className="w-3 h-3" />
                            {categoryInfo.label}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-muted-foreground transition-colors">
                          {topic.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {topic.content}
                        </p>
                        
                        {topic.image_url && (
                          <div className="mb-4">
                            <img
                              src={topic.image_url}
                              alt="Topic"
                              className="w-full max-w-md h-32 object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground tracking-wider">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {topic.author_name.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true }).toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {topic.comment_count}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleToggleLike(e, topic.id, topic.is_liked)}
                        className={`flex items-center gap-1 px-3 py-1.5 border transition-colors ${
                          topic.is_liked 
                            ? 'border-primary text-primary' 
                            : 'border-foreground/20 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${topic.is_liked ? 'fill-current' : ''}`} />
                        <span className="text-[10px] tracking-wider">{topic.like_count}</span>
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default Forum;
