import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { VenueCard } from '@/components/VenueCard';
import { WinemakerCard } from '@/components/WinemakerCard';
import { WineFairCard } from '@/components/WineFairCard';
import { NewsCard } from '@/components/NewsCard';
import { SEOHead } from '@/components/SEOHead';
import { HomeWineMap } from '@/components/WineMap';
import { WineQuiz } from '@/components/WineQuiz';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Wine, Sparkles, Globe, Heart, MapPin } from 'lucide-react';

const RaisinHome = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<any[]>([]);
  const [winemakers, setWinemakers] = useState<any[]>([]);
  const [wineFairs, setWineFairs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [venuesRes, winemakersRes, fairsRes, newsRes] = await Promise.all([
      supabase.from('venues').select('*').eq('is_featured', true).limit(6),
      supabase.from('winemakers').select('*').limit(8),
      supabase.from('wine_fairs').select('*').gte('start_date', new Date().toISOString().split('T')[0]).order('start_date').limit(10),
      supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(8),
    ]);
    
    setVenues(venuesRes.data || []);
    setWinemakers(winemakersRes.data || []);
    setWineFairs(fairsRes.data || []);
    setNews(newsRes.data || []);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead 
        title="pourculture - Natural Wine & Food Lovers"
        description="Discover natural wine bars, restaurants, wine shops and winemakers near you. pourculture is your guide to the best natural wine spots."
        keywords="natural wine, organic wine, wine bars, restaurants, winemakers, pourculture"
      />
      <RaisinNavbar />

      {/* Hero Section with Interactive Wine Map */}
      <section className="relative min-h-screen pt-16 flex flex-col">
        {/* Vintage Background */}
        <div className="absolute inset-0 overflow-hidden" style={{
          background: 'linear-gradient(180deg, #f8f0e3 0%, #e8dcc8 50%, #d4c4a8 100%)',
        }}>
          {/* Decorative wine elements */}
          <motion.div 
            className="absolute top-24 left-8 text-4xl opacity-40"
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🍷
          </motion.div>
          <motion.div 
            className="absolute top-32 right-12 text-3xl opacity-40"
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            🍇
          </motion.div>
          <motion.div 
            className="absolute bottom-32 left-16 text-2xl opacity-40"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            🌿
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header Text */}
          <div className="text-center pt-8 pb-4 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 border-2 border-amber-400"
                style={{ 
                  background: 'linear-gradient(180deg, #fef3c7, #fde68a)',
                  color: '#92400e',
                  fontFamily: 'Georgia, serif',
                }}>
                <MapPin className="w-4 h-4" />
                Explore Natural Wine Venues Worldwide
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
              style={{ fontFamily: 'Georgia, serif', color: '#451a03' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-amber-700">RAW</span>{' '}
              <span className="text-amber-900">CELLAR</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl max-w-2xl mx-auto mb-2"
              style={{ fontFamily: 'Georgia, serif', color: '#78350f' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover wine bars, shops & winemakers on the vintage map
            </motion.p>
          </div>

          {/* Interactive Vintage Map */}
          <div className="flex-1 relative">
            <motion.div 
              className="w-full h-[450px] md:h-[550px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <HomeWineMap className="w-full h-full" />
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            className="flex justify-center pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.div
              className="flex flex-col items-center gap-2 cursor-pointer"
              style={{ color: '#92400e' }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
              <span className="text-xs uppercase tracking-wider font-serif">Scroll to explore more</span>
              <div className="w-6 h-10 rounded-full border-2 border-amber-600/50 flex justify-center pt-2">
                <motion.div 
                  className="w-1.5 h-3 rounded-full bg-amber-600"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Wine Quiz Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" /> Kişisel Rehber
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Hangi şarap <span className="text-primary">sana göre?</span>
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Birkaç basit soruyla damak tadına en uygun şarabı keşfet.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <WineQuiz />
          </motion.div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 md:px-8 bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Wine Venues', icon: Wine, color: 'primary' },
              { number: '200+', label: 'Winemakers', icon: Heart, color: 'accent' },
              { number: '50+', label: 'Countries', icon: Globe, color: 'primary' },
              { number: '1000+', label: 'Natural Wines', icon: Sparkles, color: 'accent' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-3xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center ${stat.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                </div>
                <p className="text-3xl font-display font-bold text-foreground">{stat.number}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex items-end justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Wine className="w-3 h-3" /> Featured Spots
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Venues to <span className="text-accent">Discover</span>
              </h2>
              <p className="text-muted-foreground mt-2 max-w-lg">
                Hand-picked natural wine bars, restaurants and shops loved by the community.
              </p>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
            >
              View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {venues.length > 0 ? venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <VenueCard
                  id={venue.id}
                  name={venue.name}
                  category={venue.category}
                  address={venue.address}
                  city={venue.city}
                  imageUrl={venue.image_url}
                  isOpen={venue.is_open}
                  isClaimed={venue.is_claimed}
                  googleRating={venue.google_rating}
                  onClick={() => navigate(`/venue/${venue.slug}`)}
                />
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No venues yet. Be the first to add one!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Winemakers Section */}
      <section className="py-16 px-4 md:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex items-end justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-3">
                🍇 Meet the Makers
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                Passionate <span className="text-primary">Winemakers</span>
              </h2>
            </div>
            <button 
              onClick={() => navigate('/winemakers')}
              className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 group"
            >
              All Winemakers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {winemakers.length > 0 ? winemakers.map((winemaker, index) => (
              <motion.div
                key={winemaker.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <WinemakerCard
                  id={winemaker.id}
                  name={winemaker.name}
                  domainName={winemaker.domain_name}
                  region={winemaker.region}
                  country={winemaker.country}
                  imageUrl={winemaker.image_url}
                  isNew={winemaker.is_new}
                  onClick={() => navigate(`/winemaker/${winemaker.slug}`)}
                />
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No winemakers yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Wine Fairs Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wine-red/10 text-wine-red text-xs font-medium mb-3">
              🎉 Upcoming Events
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Natural Wine <span className="text-accent">Fairs</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Meet winemakers and taste their wines at these upcoming events!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wineFairs.length > 0 ? wineFairs.slice(0, 4).map((fair, index) => (
              <motion.div
                key={fair.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <WineFairCard
                  id={fair.id}
                  title={fair.title}
                  description={fair.description}
                  posterUrl={fair.poster_url}
                  price={fair.price}
                  ticketUrl={fair.ticket_url}
                  startDate={fair.start_date}
                  endDate={fair.end_date}
                  city={fair.city}
                  country={fair.country}
                  isProOnly={fair.is_pro_only}
                  onClick={() => navigate(`/wine-fair/${fair.slug}`)}
                />
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No upcoming wine fairs.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 px-4 md:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              📰 Latest Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Wine <span className="text-accent">News</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {news.length > 0 ? news.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <NewsCard
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  imageUrl={article.image_url}
                  publishedAt={article.published_at}
                  onClick={() => navigate(`/news/${article.slug}`)}
                />
              </motion.div>
            )) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No news articles yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 md:px-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Wine className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">pourculture</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Your guide to discovering natural wines, passionate winemakers, and authentic wine experiences around the world.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => navigate('/about-natural-wine')} className="hover:text-foreground transition-colors">About</button>
              <button onClick={() => navigate('/explore')} className="hover:text-foreground transition-colors">Explore</button>
              <button onClick={() => navigate('/news')} className="hover:text-foreground transition-colors">News</button>
            </div>
            <div className="mt-8 pt-8 border-t border-border w-full">
              <p className="text-xs text-muted-foreground">
                © 2025 pourculture. Made with 🍷 for natural wine lovers.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RaisinHome;
