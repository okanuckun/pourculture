import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Book, FileText, Download, Grape, Search, ExternalLink, Loader2, Heart, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteButton } from '@/components/FavoriteButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  read_time: string;
  category: string;
}

interface PdfResource {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  pages: number | null;
  file_size: string | null;
}

interface HarvestReport {
  id: string;
  year: number;
  region: string;
  summary: string;
  highlights: string[];
}

const fallbackGlossary: GlossaryTerm[] = [
  { id: '1', term: 'Biodynamic', definition: 'A holistic approach to farming that treats the vineyard as a self-sustaining ecosystem.' },
  { id: '2', term: 'Natural Wine', definition: 'Wine made with minimal intervention and additives.' },
  { id: '3', term: 'Orange Wine', definition: 'White wine made with extended skin contact.' },
  { id: '4', term: 'Pét-Nat', definition: 'Pétillant Naturel - a naturally sparkling wine.' },
  { id: '5', term: 'Terroir', definition: 'The complete natural environment where wine is produced.' },
];

const fallbackGuides: Guide[] = [
  { id: '1', title: 'How to Taste Natural Wine', description: "A beginner's guide to understanding natural wine.", read_time: '5 min read', category: 'Beginner' },
];

const fallbackPdfs: PdfResource[] = [
  { id: '1', title: 'Natural Wine 101', description: 'Everything you need to know about natural wine.', pages: 24, file_size: '2.4 MB', file_url: null },
];

const fallbackReports: HarvestReport[] = [
  { id: '1', year: 2024, region: 'Loire Valley, France', summary: 'A challenging vintage with excellent results.', highlights: ['Early harvest', 'Low yields'] },
];

const categories = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const KnowledgeHub = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [pdfResources, setPdfResources] = useState<PdfResource[]>([]);
  const [harvestReports, setHarvestReports] = useState<HarvestReport[]>([]);
  
  const { favorites, userId, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [glossaryRes, guidesRes, pdfsRes, reportsRes] = await Promise.all([
      supabase.from('glossary_terms').select('*').order('term'),
      supabase.from('guides').select('*').eq('is_published', true).order('created_at', { ascending: false }),
      supabase.from('pdf_resources').select('*').eq('is_published', true).order('created_at', { ascending: false }),
      supabase.from('harvest_reports').select('*').eq('is_published', true).order('year', { ascending: false }),
    ]);

    setGlossaryTerms(glossaryRes.data?.length ? glossaryRes.data : fallbackGlossary);
    setGuides(guidesRes.data?.length ? guidesRes.data : fallbackGuides);
    setPdfResources(pdfsRes.data?.length ? pdfsRes.data : fallbackPdfs);
    setHarvestReports(reportsRes.data?.length ? reportsRes.data : fallbackReports);
    
    setLoading(false);
  };

  const effectiveGlossarySearch = globalSearch || glossarySearch;
  const availableLetters = new Set(glossaryTerms.map(item => item.term.charAt(0).toUpperCase()));
  
  const filteredTerms = glossaryTerms.filter(item => {
    const matchesSearch = !effectiveGlossarySearch || 
      item.term.toLowerCase().includes(effectiveGlossarySearch.toLowerCase()) ||
      item.definition.toLowerCase().includes(effectiveGlossarySearch.toLowerCase());
    const matchesLetter = selectedLetter === 'All' || item.term.charAt(0).toUpperCase() === selectedLetter;
    const matchesFavorite = !showFavoritesOnly || isFavorite('glossary', item.id);
    return matchesSearch && matchesLetter && matchesFavorite;
  });

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = !globalSearch || 
      guide.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      guide.description.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || isFavorite('guide', guide.id);
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const filteredPdfs = pdfResources.filter(pdf => {
    const matchesSearch = !globalSearch ||
      pdf.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      pdf.description.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || isFavorite('pdf', pdf.id);
    return matchesSearch && matchesFavorite;
  });

  const filteredReports = harvestReports.filter(report => {
    const matchesSearch = !globalSearch ||
      report.region.toLowerCase().includes(globalSearch.toLowerCase()) ||
      report.summary.toLowerCase().includes(globalSearch.toLowerCase()) ||
      report.year.toString().includes(globalSearch);
    const matchesFavorite = !showFavoritesOnly || isFavorite('harvest_report', report.id);
    return matchesSearch && matchesFavorite;
  });

  const totalFavorites = favorites.length;

  if (loading) {
    return (
      <BrutalistLayout>
        <SEOHead title="Knowledge Hub | Natural Wine Library" description="Free educational resources about natural wine." />
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </BrutalistLayout>
    );
  }

  return (
    <BrutalistLayout
      title="KNOWLEDGE HUB"
      subtitle="Not a blog; a library. Free, shareable resources about natural wine culture."
    >
      <SEOHead
        title="Knowledge Hub | Natural Wine Library"
        description="Free educational resources about natural wine. Explore our glossary, guides, PDF booklets, and harvest reports."
      />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Search & Filters */}
        <div className="border-b border-foreground/20 pb-6 mb-8">
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search across all resources..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pl-10 h-10 text-sm border-2 border-foreground/20 focus:border-foreground"
            />
          </div>

          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'glossary', icon: Book, label: 'GLOSSARY', count: filteredTerms.length },
              { id: 'guides', icon: FileText, label: 'GUIDES', count: filteredGuides.length },
              { id: 'pdfs', icon: Download, label: 'PDF BOOKLETS', count: filteredPdfs.length },
              { id: 'harvest', icon: Grape, label: 'HARVEST REPORTS', count: filteredReports.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] tracking-wider transition-colors border-2 ${
                  activeSection === item.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/20 hover:border-foreground'
                }`}
              >
                <item.icon className="w-3 h-3" />
                <span>{item.label}</span>
                <span className="text-[9px] opacity-60">({item.count})</span>
              </button>
            ))}
          </div>

          {/* Favorites Toggle */}
          {userId && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 text-[10px] tracking-wider transition-colors border-2 ${
                showFavoritesOnly
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-foreground/20 hover:border-foreground'
              }`}
            >
              <Heart className={`w-3 h-3 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>MY FAVORITES ({totalFavorites})</span>
            </button>
          )}
        </div>

        {/* Glossary Section */}
        <section id="glossary" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">GLOSSARY</h2>
            </div>

            {/* Alphabetic Filter */}
            <div className="flex flex-wrap gap-1 mb-6">
              {alphabet.map((letter) => {
                const isAvailable = letter === 'All' || availableLetters.has(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && setSelectedLetter(letter)}
                    disabled={!isAvailable}
                    className={`w-7 h-7 text-[10px] font-medium transition-colors border ${
                      selectedLetter === letter
                        ? 'bg-foreground text-background border-foreground'
                        : isAvailable
                        ? 'border-foreground/20 hover:border-foreground'
                        : 'border-foreground/10 text-muted-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    {letter === 'All' ? '∀' : letter}
                  </button>
                );
              })}
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              {filteredTerms.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.term}
                  className="border-2 border-foreground/20 px-4"
                >
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    <span>{item.term}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {item.definition}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>

        {/* Guides Section */}
        <section id="guides" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">GUIDES</h2>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-[10px] tracking-wider transition-colors border ${
                    selectedCategory === category
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-foreground/20 hover:border-foreground'
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/knowledge/guide/${guide.id}`}
                  className="group border-2 border-foreground/20 p-4 hover:border-foreground transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] tracking-wider text-muted-foreground">{guide.category.toUpperCase()}</span>
                    <span className="text-[10px] text-muted-foreground">{guide.read_time}</span>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:underline">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] tracking-wider">
                    READ MORE <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* PDF Booklets Section */}
        <section id="pdfs" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">PDF BOOKLETS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="border-2 border-foreground/20 p-4"
                >
                  <h3 className="font-bold mb-2">{pdf.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{pdf.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-4">
                    {pdf.pages && <span>{pdf.pages} pages</span>}
                    {pdf.file_size && <span>{pdf.file_size}</span>}
                  </div>
                  {pdf.file_url ? (
                    <a
                      href={pdf.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-foreground text-background text-[10px] tracking-wider hover:bg-foreground/90 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      DOWNLOAD PDF
                    </a>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Coming soon</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Harvest Reports Section */}
        <section id="harvest" className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Grape className="w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">HARVEST REPORTS</h2>
            </div>

            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Link
                  key={report.id}
                  to={`/knowledge/harvest/${report.id}`}
                  className="group block border-2 border-foreground/20 p-4 hover:border-foreground transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl font-bold">{report.year}</span>
                    <span className="text-[10px] tracking-wider text-muted-foreground">{report.region.toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{report.summary}</p>
                  {report.highlights && report.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {report.highlights.slice(0, 3).map((highlight, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-1 border border-foreground/20">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="border-2 border-foreground p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">CONTRIBUTE</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            Have knowledge to share? We welcome contributions from wine professionals, 
            educators, and enthusiasts.
          </p>
          <a
            href="mailto:contribute@pourculture.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs tracking-wider hover:bg-foreground/90 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            GET IN TOUCH
          </a>
        </section>
      </div>
    </BrutalistLayout>
  );
};

export default KnowledgeHub;
