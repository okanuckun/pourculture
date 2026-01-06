import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GridNavbarProps {
  gridVisible?: boolean;
  onGridToggle?: (visible: boolean) => void;
}

export const GridNavbar: React.FC<GridNavbarProps> = ({ 
  gridVisible = false, 
  onGridToggle 
}) => {
  const location = useLocation();
  const [crazyMode, setCrazyMode] = useState(false);

  const navLinks = [
    { label: 'Intro', path: '/' },
    { label: 'Map', path: '/discover' },
    { label: 'Winemakers', path: '/explore/winemakers' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/10">
      <div className="bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-14 px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-sm font-medium tracking-tight uppercase">
              POURCULTURE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#EF553A] ml-0.5 mb-1"></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <React.Fragment key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm transition-colors hover:text-foreground ${
                    location.pathname === link.path 
                      ? 'text-foreground font-medium' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
                {index < navLinks.length - 1 && (
                  <span className="text-muted-foreground/50 mx-2">/</span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            {/* Grid Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Grid:</span>
              <div className="flex rounded-full border border-foreground/20 overflow-hidden">
                <button
                  onClick={() => onGridToggle?.(true)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    gridVisible 
                      ? 'bg-foreground text-background' 
                      : 'bg-transparent text-foreground hover:bg-foreground/5'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => onGridToggle?.(false)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    !gridVisible 
                      ? 'bg-foreground text-background' 
                      : 'bg-transparent text-foreground hover:bg-foreground/5'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Crazy Mode Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Crazy Mode:</span>
              <div className="flex rounded-full border border-foreground/20 overflow-hidden">
                <button
                  onClick={() => setCrazyMode(true)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    crazyMode 
                      ? 'bg-foreground text-background' 
                      : 'bg-transparent text-foreground hover:bg-foreground/5'
                  }`}
                >
                  On
                </button>
                <button
                  onClick={() => setCrazyMode(false)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    !crazyMode 
                      ? 'bg-foreground text-background' 
                      : 'bg-transparent text-foreground hover:bg-foreground/5'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Copyright */}
            <span className="hidden lg:block text-sm text-muted-foreground">
              PourCulture ©2024
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
