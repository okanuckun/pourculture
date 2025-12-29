import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const GridFooter: React.FC = () => {
  const footerLinks = [
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
  ];

  return (
    <footer className="border-t border-foreground/10 mt-24">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Logo & Copyright */}
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-foreground" />
              <span className="text-sm font-medium tracking-tight uppercase">
                PourCulture
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PourCulture. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-12 md:col-span-4">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
              Navigation
            </p>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-foreground hover:text-muted-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="col-span-12 md:col-span-4">
            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">
              Connect
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:hello@pourculture.com" 
                className="text-sm text-foreground hover:text-muted-foreground transition-colors"
              >
                hello@pourculture.com
              </a>
              <a 
                href="https://instagram.com/pourculture" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground hover:text-muted-foreground transition-colors"
              >
                @pourculture
              </a>
            </div>
          </div>
        </div>

        {/* Large Year */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mt-16 text-right"
        >
          <span className="text-[15vw] font-bold tracking-tighter text-foreground/5 leading-none">
            2024
          </span>
        </motion.div>
      </div>
    </footer>
  );
};
