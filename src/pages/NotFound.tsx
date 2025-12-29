import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <BrutalistLayout>
      <SEOHead 
        title="404 - Page Not Found | PourCulture"
        description="The page you're looking for doesn't exist. Return to discover natural wine venues and events."
      />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto border-2 border-foreground flex items-center justify-center mb-8">
            <span className="text-5xl font-bold">404</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">PAGE NOT FOUND</h1>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-bold uppercase tracking-wide hover:bg-foreground/90 transition-colors"
            >
              GO HOME
            </Link>
            <Link 
              to="/discover" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-foreground text-sm font-bold uppercase tracking-wide hover:bg-foreground hover:text-background transition-colors"
            >
              DISCOVER VENUES
            </Link>
          </div>
        </motion.div>
      </div>
    </BrutalistLayout>
  );
};

export default NotFound;
