import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const FooterSection: React.FC = () => {
  return (
    <>
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/discover"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors w-full sm:w-auto justify-center"
              >
                START EXPLORING
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto justify-center"
              >
                SIGN UP
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/20">
        <div className="grid grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-foreground/20">
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
              <Link to="/discover" className="block text-sm hover:text-muted-foreground transition-colors">Discover</Link>
              <Link to="/explore/winemakers" className="block text-sm hover:text-muted-foreground transition-colors">Winemakers</Link>
              <Link to="/explore/events" className="block text-sm hover:text-muted-foreground transition-colors">Events</Link>
              <Link to="/about/natural-wine" className="block text-sm hover:text-muted-foreground transition-colors">About Natural Wine</Link>
            </div>
          </div>

          <div className="col-span-6 md:col-span-4 p-6">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
              CONNECT
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:hello@pourculture.com"
                className="block hover:text-muted-foreground transition-colors"
              >
                hello@pourculture.com
              </a>
              <a
                href="https://instagram.com/pourculture"
                className="block hover:text-muted-foreground transition-colors"
              >
                @pourculture
              </a>
            </div>
          </div>
        </div>

        {/* Large Year */}
        <div className="border-t border-foreground/20 p-4 text-right overflow-hidden">
          <span className="text-[20vw] font-bold tracking-tighter text-foreground/5 leading-none">
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
