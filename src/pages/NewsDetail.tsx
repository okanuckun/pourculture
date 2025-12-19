import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

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
      <div className="min-h-screen bg-background">
        <RaisinNavbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="h-8 w-32 bg-muted animate-pulse rounded mb-6" />
            <div className="h-12 w-3/4 bg-muted animate-pulse rounded mb-4" />
            <div className="h-6 w-1/2 bg-muted animate-pulse rounded mb-8" />
            <div className="aspect-video bg-muted animate-pulse rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Article Not Found | RAW CELLAR" description="The article you're looking for doesn't exist." />
        <RaisinNavbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 text-primary hover:underline mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </button>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${article.title} | RAW CELLAR`}
        description={article.excerpt || `Read about ${article.title}`}
      />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </button>

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
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
          </header>

          {/* Featured Image */}
          {article.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden mb-8">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="prose prose-lg max-w-none dark:prose-invert">
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
          </article>
        </div>
      </main>
    </div>
  );
};

export default NewsDetail;
