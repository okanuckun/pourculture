import React, { useState } from 'react';
import { GridNavbar, GridHero, GridOverlay, GridFooter, GridSection } from '@/components/grid';
import { HomeWineMap } from '@/components/WineMap/HomeWineMap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, MapPin } from 'lucide-react';

const GridHomepage = () => {
  const [gridVisible, setGridVisible] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-grotesk">
      {/* Grid Overlay */}
      <GridOverlay visible={gridVisible} />
      
      {/* Navbar */}
      <GridNavbar gridVisible={gridVisible} onGridToggle={setGridVisible} />

      {/* Hero Section */}
      <GridHero gridVisible={gridVisible} />

      {/* Map Section */}
      <section className="py-16 border-t border-foreground/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-12 gap-8 mb-8">
            <div className="col-span-12 md:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Discover
                </h2>
                <p className="text-muted-foreground">
                  Find natural wine venues near you. Explore wine bars, shops, restaurants, and winemakers worldwide.
                </p>
              </motion.div>
            </div>
            <div className="col-span-12 md:col-span-6 flex items-end justify-end">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Open Full Map
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden border border-foreground/10"
          >
            <HomeWineMap className="absolute inset-0" />
          </motion.div>
        </div>
      </section>

      {/* Featured Venues Section */}
      <GridSection 
        title="Featured" 
        subtitle="Hand-picked venues"
        link={{ label: 'View all venues', path: '/discover' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Septime Cave', location: 'Paris, France', category: 'Wine Bar' },
            { name: 'Noble Rot', location: 'London, UK', category: 'Restaurant' },
            { name: 'Ten Bells', location: 'New York, USA', category: 'Wine Bar' },
          ].map((venue, index) => (
            <motion.div
              key={venue.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/5] bg-muted mb-4 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-foreground/5 to-foreground/10 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium mb-1">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {venue.location}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground border border-foreground/10 px-2 py-1">
                  {venue.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GridSection>

      {/* Events Section */}
      <GridSection 
        title="Events" 
        subtitle="Upcoming tastings & fairs"
        link={{ label: 'View all events', path: '/explore/fairs' }}
      >
        <div className="space-y-4">
          {[
            { name: 'RAW Wine Fair', date: 'March 15-16, 2024', location: 'Berlin' },
            { name: 'La Dive Bouteille', date: 'February 5-6, 2024', location: 'Loire Valley' },
            { name: 'Real Wine Fair', date: 'May 12-13, 2024', location: 'London' },
          ].map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-between py-4 border-b border-foreground/10 hover:bg-muted/50 transition-colors px-4 -mx-4 cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <span className="text-4xl font-bold text-muted-foreground/50 group-hover:text-foreground transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-medium mb-1 group-hover:underline">{event.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          ))}
        </div>
      </GridSection>

      {/* Large Typography Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              Join the community
            </p>
            <h2 className="text-[10vw] md:text-[8vw] font-bold tracking-tighter leading-none mb-8">
              DRINK
              <br />
              NATURAL
            </h2>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-8 py-4 border border-foreground text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Start Exploring
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <GridFooter />
    </div>
  );
};

export default GridHomepage;
