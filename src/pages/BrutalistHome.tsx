import React from 'react';
import { BrutalistHero } from '@/components/grid/BrutalistHero';
import { HomeWineMap } from '@/components/WineMap/HomeWineMap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MapPin, Calendar, Star } from 'lucide-react';

const BrutalistHome = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-grotesk">
      {/* Hero Section */}
      <BrutalistHero />

      {/* Map Section */}
      <section className="border-b border-foreground/20">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-3 border-r border-foreground/20 p-4">
            <div className="sticky top-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
                INTERACTIVE MAP
              </p>
              <h3 className="text-2xl font-bold tracking-tight mb-4">
                EXPLORE
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                Find natural wine venues near you. Filter by category, location, and status.
              </p>
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-xs border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
              >
                FULL MAP
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-9">
            <div className="aspect-[16/9] md:aspect-[21/12]">
              <HomeWineMap className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-foreground/20">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: 'TOTAL VENUES', value: '1,247', suffix: '+' },
            { label: 'COUNTRIES', value: '43', suffix: '' },
            { label: 'VERIFIED', value: '89', suffix: '%' },
            { label: 'ACTIVE USERS', value: '12K', suffix: '+' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 border-r border-foreground/20 last:border-r-0"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <p className="text-4xl md:text-5xl font-bold tracking-tighter">
                {stat.value}
                <span className="text-muted-foreground">{stat.suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="border-b border-foreground/20">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-3 border-r border-foreground/20 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              UPCOMING
            </p>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              EVENTS
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Wine fairs, tastings, and natural wine events worldwide.
            </p>
          </div>
          
          <div className="col-span-12 md:col-span-9 divide-y divide-foreground/20">
            {[
              { name: 'RAW WINE FAIR', date: 'MAR 15-16', location: 'BERLIN', year: '2024' },
              { name: 'LA DIVE BOUTEILLE', date: 'FEB 5-6', location: 'LOIRE', year: '2024' },
              { name: 'REAL WINE FAIR', date: 'MAY 12-13', location: 'LONDON', year: '2024' },
              { name: 'VINI VERI', date: 'APR 8-10', location: 'VERONA', year: '2024' },
            ].map((event, index) => (
              <motion.div
                key={event.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-8">
                  <span className="text-3xl md:text-4xl font-bold text-muted-foreground/30 group-hover:text-foreground transition-colors w-16">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold tracking-tight group-hover:underline">
                      {event.name}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
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
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{event.year}</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              JOIN THE COMMUNITY
            </p>
            <h2 className="text-[12vw] md:text-[8vw] font-bold tracking-tighter leading-[0.85] mb-8">
              DRINK
              <br />
              <span className="text-muted-foreground/30">NATURAL</span>
            </h2>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                START EXPLORING
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                SIGN UP
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/20">
        <div className="grid grid-cols-12 divide-x divide-foreground/20">
          <div className="col-span-12 md:col-span-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-foreground rounded-sm" />
              <span className="text-sm font-bold tracking-tight">POURCULTURE</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} PourCulture. All rights reserved.
            </p>
          </div>
          
          <div className="col-span-6 md:col-span-4 p-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              NAVIGATION
            </p>
            <div className="space-y-2">
              {['Discover', 'Winemakers', 'Events', 'About'].map((link) => (
                <Link
                  key={link}
                  to={`/${link.toLowerCase()}`}
                  className="block text-sm hover:text-muted-foreground transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="col-span-6 md:col-span-4 p-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              CONNECT
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:hello@pourculture.com" className="block hover:text-muted-foreground transition-colors">
                hello@pourculture.com
              </a>
              <a href="https://instagram.com/pourculture" className="block hover:text-muted-foreground transition-colors">
                @pourculture
              </a>
            </div>
          </div>
        </div>
        
        {/* Large Year */}
        <div className="border-t border-foreground/20 p-4 text-right overflow-hidden">
          <span className="text-[20vw] font-bold tracking-tighter text-foreground/5 leading-none">
            2024
          </span>
        </div>
      </footer>
    </div>
  );
};

export default BrutalistHome;
