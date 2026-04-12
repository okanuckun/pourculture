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

      {/* Footer — matches BrutalistLayout footer */}
      <footer className="border-t border-foreground/20 py-8 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">EXPLORE</h3>
              <div className="space-y-2">
                <Link to="/discover?category=bar" className="block text-xs hover:text-muted-foreground">Wine Bars</Link>
                <Link to="/discover?category=wine_shop" className="block text-xs hover:text-muted-foreground">Wine Shops</Link>
                <Link to="/discover?category=restaurant" className="block text-xs hover:text-muted-foreground">Restaurants</Link>
                <Link to="/wine-routes" className="block text-xs hover:text-muted-foreground">Wine Routes</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">LEARN</h3>
              <div className="space-y-2">
                <Link to="/about/natural-wine" className="block text-xs hover:text-muted-foreground">What is Natural Wine?</Link>
                <Link to="/knowledge" className="block text-xs hover:text-muted-foreground">Knowledge Hub</Link>
                <Link to="/people" className="block text-xs hover:text-muted-foreground">People & Books</Link>
                <Link to="/forum" className="block text-xs hover:text-muted-foreground">Forum</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">SUBMIT</h3>
              <div className="space-y-2">
                <Link to="/submit/venue" className="block text-xs hover:text-muted-foreground">Add a Venue</Link>
                <Link to="/submit/winemaker" className="block text-xs hover:text-muted-foreground">Add a Winemaker</Link>
                <Link to="/submit/event" className="block text-xs hover:text-muted-foreground">Submit an Event</Link>
                <Link to="/claim-venue" className="block text-xs hover:text-muted-foreground">Claim Your Business</Link>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] tracking-wider text-muted-foreground mb-3">CONNECT</h3>
              <div className="space-y-2">
                <a href="mailto:hello@pourculture.com" className="block text-xs hover:text-muted-foreground">hello@pourculture.com</a>
                <a href="https://instagram.com/pourculture" target="_blank" rel="noopener noreferrer" className="block text-xs hover:text-muted-foreground">@pourculture</a>
              </div>
            </div>
          </div>
          <div className="border-t border-foreground/10 mt-8 pt-6 text-center">
            <p className="text-[10px] text-muted-foreground tracking-wider">
              © {new Date().getFullYear()} POURCULTURE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default FooterSection;
