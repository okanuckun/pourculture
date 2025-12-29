import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wine, MapPin, Globe } from 'lucide-react';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { MapboxMap } from '@/components/WineMap';

const WineMapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Wine Map - Discover Wine Venues Worldwide | pourculture"
        description="Explore wine shops, wine bars, wineries and restaurants on our interactive map. Data from OpenStreetMap."
        keywords="wine map, wine shops, wine bars, wineries, natural wine venues, wine locations"
      />
      <RaisinNavbar />
      
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gradient-to-b from-secondary to-background px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                  <Globe className="w-3 h-3" /> Google Places API
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  World <span className="text-primary">Wine Map</span>
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Discover wine shops, bars, wineries and restaurants worldwide. 
                  Zoom in on any region and click "Search this area" to find venues.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg">
                  <span className="text-lg">🍷</span>
                  <span>Wine Shops</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg">
                  <span className="text-lg">🍸</span>
                  <span>Wine Bars</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg">
                  <span className="text-lg">🍇</span>
                  <span>Wineries</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg">
                  <span className="text-lg">🍽️</span>
                  <span>Restaurants</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Map Container */}
        <div className="px-4 pb-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="h-[calc(100vh-280px)] min-h-[500px] rounded-2xl overflow-hidden shadow-xl border border-border"
            >
              <MapboxMap />
            </motion.div>
            
            {/* Info box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 p-4 bg-card rounded-xl border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">How it works</h3>
                  <p className="text-sm text-muted-foreground">
                    This map uses <strong>Google Places API</strong> to display wine-related venues. 
                    Search for a city or navigate to any area and click "Search this area" to load venues. 
                    Use the category filters to narrow down your search. 
                    Click on any marker to see venue details.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WineMapPage;
