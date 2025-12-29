import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          setNotFound(true);
        } else {
          setArticle(data);
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <div className="h-6 w-32 bg-muted animate-pulse mb-6" />
          <div className="h-10 w-3/4 bg-muted animate-pulse mb-4" />
          <div className="h-6 w-1/2 bg-muted animate-pulse mb-8" />
          <div className="aspect-video bg-muted animate-pulse mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse" />
            <div className="h-4 bg-muted animate-pulse" />
            <div className="h-4 w-2/3 bg-muted animate-pulse" />
          </div>
        </div>
      </BrutalistLayout>
    );
  }

  if (notFound || !article) {
    return (
      <BrutalistLayout title="Article Not Found" showBackButton backPath="/news" backLabel="News">
        <SEOHead title="Article Not Found | PourCulture" description="The article you're looking for doesn't exist." />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">ARTICLE NOT FOUND</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate('/news')}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            BACK TO NEWS
          </Button>
        </div>
      </BrutalistLayout>
    );
  }

  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : null;

  return (
    <BrutalistLayout showBackButton backPath="/news" backLabel="News">
      <SEOHead 
        title={`${article.title} | PourCulture`}
        description={article.excerpt || `Read about ${article.title}`}
      />
      
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </motion.header>

        {/* Featured Image */}
        {article.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="aspect-video border-2 border-foreground/20 overflow-hidden mb-8"
          >
            <img 
              src={article.image_url} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          {article.content ? (
            <div 
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : article.excerpt ? (
            <p className="text-foreground leading-relaxed">{article.excerpt}</p>
          ) : (
            <p className="text-muted-foreground italic">No content available.</p>
          )}
        </motion.div>
      </article>
    </BrutalistLayout>
  );
};

export default NewsDetail;
