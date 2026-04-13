import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wine, Camera, BookOpen, Lock } from 'lucide-react';
import { AuthSheet } from '@/components/AuthSheet';

interface AuthGateProps {
  /** What the user tried to access */
  feature: 'scan' | 'journal' | 'feed';
  className?: string;
}

const FEATURE_CONFIG = {
  scan: {
    icon: Camera,
    title: 'Scan & Discover Wines',
    description: 'Create a free account to scan wine labels and build your personal wine journal.',
    cta: 'Sign up to start scanning',
  },
  journal: {
    icon: BookOpen,
    title: 'Your Wine Journal',
    description: 'Track your wine journey — scanned bottles, tasting notes, and completed routes.',
    cta: 'Sign up to access your journal',
  },
  feed: {
    icon: Wine,
    title: 'Join the Community',
    description: 'Sign up to keep exploring, share your own wine moments, and connect with fellow enthusiasts.',
    cta: 'Sign up to see more',
  },
};

export const AuthGate: React.FC<AuthGateProps> = ({ feature, className = '' }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const config = FEATURE_CONFIG[feature];
  const Icon = config.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}
      >
        <div className="w-16 h-16 rounded-full bg-foreground/5 border-2 border-foreground/10 flex items-center justify-center mb-6">
          <Icon className="w-7 h-7 text-foreground/60" />
        </div>

        <h2 className="text-xl font-bold tracking-tight mb-2">{config.title}</h2>
        <p className="text-sm text-muted-foreground max-w-xs mb-8">{config.description}</p>

        <button
          onClick={() => setAuthOpen(true)}
          className="px-8 py-3 bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
        >
          {config.cta}
        </button>

        <button
          onClick={() => setAuthOpen(true)}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Already have an account? <span className="underline">Sign in</span>
        </button>
      </motion.div>

      <AuthSheet isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};
