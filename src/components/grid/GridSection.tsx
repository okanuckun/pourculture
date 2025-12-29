import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface GridSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  link?: {
    label: string;
    path: string;
  };
}

export const GridSection: React.FC<GridSectionProps> = ({
  title,
  subtitle,
  children,
  link,
}) => {
  return (
    <section className="py-16 border-t border-foreground/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Header */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
              {link && (
                <Link
                  to={link.path}
                  className="inline-flex items-center gap-2 text-sm text-foreground hover:text-muted-foreground transition-colors mt-4 group"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
