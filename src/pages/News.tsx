import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { NewsCard } from '@/components/NewsCard';
import { ArrowLeft } from 'lucide-react';

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

const News = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        setArticles(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="News | RAW CELLAR"
        description="Latest news and articles about natural wine, winemakers, and the natural wine community."
      />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-foreground mb-2">News & Articles</h1>
            <p className="text-muted-foreground">Stay updated with the latest from the natural wine world</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No news articles yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for the latest updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ''}
                  imageUrl={article.image_url || undefined}
                  publishedAt={article.published_at || new Date().toISOString()}
                  onClick={() => navigate(`/news/${article.slug}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default News;
