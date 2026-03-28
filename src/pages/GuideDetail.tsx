import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Clock, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface Guide {
  id: string;
  title: string;
  description: string;
  content: string | null;
  read_time: string;
  category: string;
  created_at: string;
}

const GuideDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedGuides, setRelatedGuides] = useState<Guide[]>([]);

  useEffect(() => {
    if (id) {
      fetchGuide();
    }
  }, [id]);

  const fetchGuide = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) {
      setGuide(null);
    } else {
      setGuide(data);
      const { data: related } = await supabase
        .from('guides')
        .select('*')
        .eq('is_published', true)
        .eq('category', data.category)
        .neq('id', id)
        .limit(3);
      
      setRelatedGuides(related || []);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <SEOHead title="Loading..." description="Loading guide content" />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!guide) {
    return (
      <BrutalistLayout>
        <SEOHead title="Guide Not Found" description="The requested guide could not be found" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Guide Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The guide you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </div>
      </BrutalistLayout>
    );
  }

  const categoryColors: Record<string, string> = {
    'Beginner': 'bg-green-500/10 text-green-600',
    'Intermediate': 'bg-orange-500/10 text-orange-600',
    'Advanced': 'bg-red-500/10 text-red-600',
  };

  return (
    <BrutalistLayout>
      <SEOHead 
        title={`${guide.title} | Natural Wine Guide`}
        description={guide.description}
      />
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 border-b border-foreground/20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/knowledge" className="hover:text-foreground transition-colors">Knowledge Hub</Link>
              <span>/</span>
              <span>Guides</span>
              <span>/</span>
              <span className="text-foreground">{guide.title}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${categoryColors[guide.category] || 'bg-muted text-muted-foreground'}`}>
                {guide.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{guide.read_time}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {guide.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {guide.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {guide.content ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-3xl font-bold text-foreground mt-8 mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h3>,
                  p: ({ children }) => <p className="text-foreground/90 leading-relaxed mb-4">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90">{children}</ol>,
                  li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-foreground pl-4 italic text-muted-foreground my-6">{children}</blockquote>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  hr: () => <hr className="my-8 border-foreground/20" />,
                }}
              >
                {guide.content}
              </ReactMarkdown>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Full content coming soon. Check back later!</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <section className="py-12 md:py-16 bg-muted/20 border-t border-foreground/20">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold text-foreground mb-8">Related Guides</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedGuides.map((related) => (
                <Link
                  key={related.id}
                  to={`/guide/${related.id}`}
                  className="group bg-card border border-foreground/20 p-5 hover:border-foreground transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[related.category] || 'bg-muted text-muted-foreground'}`}>
                      {related.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{related.read_time}</span>
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:underline mb-2">{related.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{related.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back Button */}
      <section className="py-8 border-t border-foreground/20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Button variant="outline" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </div>
      </section>
    </BrutalistLayout>
  );
};

export default GuideDetail;
