import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Book, FileText, Download, Grape, ChevronRight, Search, ExternalLink, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
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

// Fallback data when database is empty
const fallbackGlossary: GlossaryTerm[] = [
  { id: '1', term: 'Biodynamic', definition: 'A holistic approach to farming that treats the vineyard as a self-sustaining ecosystem, following lunar cycles and using natural preparations.' },
  { id: '2', term: 'Natural Wine', definition: 'Wine made from organically or biodynamically grown grapes, fermented with native yeasts, and produced with minimal intervention and additives.' },
  { id: '3', term: 'Orange Wine', definition: 'White wine made with extended skin contact, giving it an amber/orange color and tannic structure similar to red wine.' },
  { id: '4', term: 'Pét-Nat', definition: 'Pétillant Naturel - a naturally sparkling wine bottled before primary fermentation completes, creating gentle bubbles.' },
  { id: '5', term: 'Terroir', definition: 'The complete natural environment where wine is produced, including soil, climate, and local traditions.' },
];

const fallbackGuides: Guide[] = [
  { id: '1', title: 'How to Taste Natural Wine', description: "A beginner's guide to understanding and appreciating natural wine flavors, aromas, and textures.", read_time: '5 min read', category: 'Beginner' },
  { id: '2', title: 'Storing Natural Wine at Home', description: 'Tips for properly storing natural wines without sulfites to maximize their lifespan and quality.', read_time: '4 min read', category: 'Beginner' },
];

const fallbackPdfs: PdfResource[] = [
  { id: '1', title: 'Natural Wine 101', description: 'Everything you need to know about natural wine in one comprehensive booklet.', pages: 24, file_size: '2.4 MB', file_url: null },
];

const fallbackReports: HarvestReport[] = [
  { id: '1', year: 2024, region: 'Loire Valley, France', summary: 'A challenging vintage with late spring frosts and summer heat waves, resulting in concentrated, powerful wines.', highlights: ['Early harvest', 'Low yields', 'Exceptional Chenin Blanc'] },
];

const KnowledgeHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [pdfResources, setPdfResources] = useState<PdfResource[]>([]);
  const [harvestReports, setHarvestReports] = useState<HarvestReport[]>([]);

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

  const filteredTerms = glossaryTerms.filter(
    item => item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="Open Knowledge Hub | Natural Wine Library"
          description="Free educational resources about natural wine. Explore our glossary, guides, PDF booklets, and harvest reports."
        />
        <RaisinNavbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Open Knowledge Hub | Natural Wine Library"
        description="Free educational resources about natural wine. Explore our glossary, guides, PDF booklets, and harvest reports."
      />
      <RaisinNavbar />
      
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Book className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Open Knowledge Hub</span>
              </div>
              
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
                Not a blog; a library.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Free, shareable resources about natural wine culture. From glossaries to harvest reports, 
                everything you need to deepen your understanding.
              </p>

              <p className="text-sm italic text-muted-foreground/80">
                "If natural wine is a culture, this is its library."
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-8 border-y border-border bg-muted/30">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { id: 'glossary', icon: Book, label: 'Glossary' },
                { id: 'guides', icon: FileText, label: 'Guides' },
                { id: 'pdfs', icon: Download, label: 'PDF Booklets' },
                { id: 'harvest', icon: Grape, label: 'Harvest Reports' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-primary/10 text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Glossary Section */}
        <section id="glossary" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Book className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">Glossary</h2>
                  <p className="text-muted-foreground">Essential natural wine terminology</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search terms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredTerms.map((item, index) => (
                    <AccordionItem
                      key={item.term}
                      value={item.term}
                      className="bg-card border border-border rounded-lg px-4 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-display text-lg font-semibold text-foreground">
                          {item.term}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                        {item.definition}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Guides Section */}
        <section id="guides" className="py-16 md:py-24 bg-muted/20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">Short Guides</h2>
                  <p className="text-muted-foreground">Quick reads to level up your wine knowledge</p>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => (
                  <Link
                    key={guide.id}
                    to={`/guide/${guide.id}`}
                  >
                    <motion.article
                      variants={itemVariants}
                      className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          guide.category === 'Beginner' 
                            ? 'bg-green-500/10 text-green-600' 
                            : guide.category === 'Advanced'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-orange-500/10 text-orange-600'
                        }`}>
                          {guide.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{guide.read_time}</span>
                      </div>
                      
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {guide.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-primary text-sm font-medium">
                        Read guide
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* PDF Booklets Section */}
        <section id="pdfs" className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">PDF Mini Booklets</h2>
                  <p className="text-muted-foreground">Download and share freely</p>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {pdfResources.map((pdf) => (
                  <motion.div
                    key={pdf.id}
                    variants={itemVariants}
                    className="group flex items-start gap-4 bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="w-16 h-20 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {pdf.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {pdf.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {pdf.pages && <span>{pdf.pages} pages</span>}
                        {pdf.file_size && <span>{pdf.file_size}</span>}
                      </div>
                    </div>
                    
                    {pdf.file_url && (
                      <a 
                        href={pdf.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>

              <motion.p 
                variants={itemVariants}
                className="text-center text-sm text-muted-foreground mt-8"
              >
                All resources are Creative Commons licensed. Share freely with attribution.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Harvest Reports Section */}
        <section id="harvest" className="py-16 md:py-24 bg-muted/20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Grape className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">Harvest Reports</h2>
                  <p className="text-muted-foreground">Vintage insights from wine regions</p>
                </div>
              </motion.div>

              <div className="space-y-6">
                {harvestReports.map((report) => (
                  <Link key={report.id} to={`/harvest/${report.id}`}>
                    <motion.article
                      variants={itemVariants}
                      className="bg-card border border-border rounded-xl p-6 md:p-8 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="font-display text-2xl font-bold text-primary">{report.year}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {report.region}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {report.summary}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {report.highlights.map((highlight) => (
                              <span
                                key={highlight}
                                className="px-3 py-1 text-xs font-medium bg-muted rounded-full text-muted-foreground"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          Full report
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl p-8 md:p-12 text-center border border-border">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Contribute to the Library
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                Are you a winemaker, sommelier, or wine educator? Share your knowledge and help grow this free resource.
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors">
                Submit Content
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default KnowledgeHub;
