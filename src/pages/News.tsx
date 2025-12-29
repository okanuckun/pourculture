import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
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
    <BrutalistLayout 
      title="News & Articles" 
      subtitle="Stay updated with the latest from the natural wine world"
      showBackButton
      backPath="/"
      backLabel="Home"
    >
      <SEOHead 
        title="News | POURCULTURE"
        description="Latest news and articles about natural wine, winemakers, and the natural wine community."
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border border-foreground/20 aspect-[4/3] animate-pulse bg-muted" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 border border-foreground/20">
            <p className="text-lg text-muted-foreground">No news articles yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for the latest updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => navigate(`/news/${article.slug}`)}
                className="border border-foreground/20 cursor-pointer group"
              >
                {article.image_url ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-muted flex items-center justify-center">
                    <span className="text-4xl">📰</span>
                  </div>
                )}
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {article.published_at && (
                      <span className="text-[10px] tracking-wider text-muted-foreground">
                        {format(new Date(article.published_at), 'MMM d, yyyy').toUpperCase()}
                      </span>
                    )}
                    {article.author && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-[10px] tracking-wider text-muted-foreground">
                          {article.author.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-bold tracking-tight mb-2 group-hover:text-muted-foreground transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="inline-block mt-4 text-[10px] tracking-wider text-foreground group-hover:translate-x-1 transition-transform">
                    READ MORE →
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default News;
