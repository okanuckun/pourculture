import React, { useState } from 'react';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { Book, FileText, Download, Grape, ChevronDown, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Glossary data
const glossaryTerms = [
  { term: 'Biodynamic', definition: 'A holistic approach to farming that treats the vineyard as a self-sustaining ecosystem, following lunar cycles and using natural preparations.' },
  { term: 'Carbonic Maceration', definition: 'A winemaking technique where whole grape clusters ferment in a carbon dioxide-rich environment, producing fruity, low-tannin wines.' },
  { term: 'Conventional Wine', definition: 'Wine made using modern agricultural practices including synthetic pesticides, herbicides, and additives.' },
  { term: 'Indigenous Yeast', definition: 'Wild yeasts naturally present on grape skins and in the winery, used for spontaneous fermentation instead of commercial yeasts.' },
  { term: 'Lees', definition: 'Dead yeast cells and sediment that settle at the bottom of wine vessels. Aging on lees adds complexity and texture.' },
  { term: 'Low Intervention', definition: 'Winemaking philosophy that minimizes additives and manipulation, allowing the wine to express its natural character.' },
  { term: 'Maceration', definition: 'The process of soaking grape skins in juice to extract color, tannins, and flavor compounds.' },
  { term: 'Minimal Sulfites', definition: 'Using little to no sulfur dioxide (SO2) as a preservative. Natural wines typically have less than 40mg/L total sulfites.' },
  { term: 'Natural Wine', definition: 'Wine made from organically or biodynamically grown grapes, fermented with native yeasts, and produced with minimal intervention and additives.' },
  { term: 'Orange Wine', definition: 'White wine made with extended skin contact, giving it an amber/orange color and tannic structure similar to red wine.' },
  { term: 'Organic', definition: 'Farming without synthetic chemicals. Organic wines come from certified organic vineyards.' },
  { term: 'Oxidative', definition: 'A style of winemaking that allows controlled oxygen exposure, creating nutty, complex flavors.' },
  { term: 'Pét-Nat', definition: 'Pétillant Naturel - a naturally sparkling wine bottled before primary fermentation completes, creating gentle bubbles.' },
  { term: 'Skin Contact', definition: 'The practice of leaving grape juice in contact with skins to extract color, tannins, and aromatics.' },
  { term: 'Spontaneous Fermentation', definition: 'Fermentation that occurs naturally from wild yeasts without adding commercial yeast strains.' },
  { term: 'Sulfites', definition: 'Sulfur dioxide compounds used as preservatives in wine. Natural wines use minimal or no added sulfites.' },
  { term: 'Terroir', definition: 'The complete natural environment where wine is produced, including soil, climate, and local traditions.' },
  { term: 'Unfined', definition: 'Wine that has not been clarified using fining agents, retaining more natural character and sometimes appearing cloudy.' },
  { term: 'Unfiltered', definition: 'Wine that has not been passed through a filter to remove sediment, preserving more flavor compounds.' },
  { term: 'Volatile Acidity', definition: 'Acidity from acetic acid that, in small amounts, adds complexity but in excess can taste like vinegar.' },
];

// Guides data
const guides = [
  {
    title: 'How to Taste Natural Wine',
    description: 'A beginner\'s guide to understanding and appreciating natural wine flavors, aromas, and textures.',
    readTime: '5 min read',
    category: 'Beginner',
  },
  {
    title: 'Storing Natural Wine at Home',
    description: 'Tips for properly storing natural wines without sulfites to maximize their lifespan and quality.',
    readTime: '4 min read',
    category: 'Beginner',
  },
  {
    title: 'Food Pairing with Orange Wines',
    description: 'Discover the perfect food matches for skin-contact white wines.',
    readTime: '6 min read',
    category: 'Intermediate',
  },
  {
    title: 'Understanding Wine Labels',
    description: 'Decode natural wine labels and certifications like Demeter, Ecocert, and more.',
    readTime: '7 min read',
    category: 'Beginner',
  },
  {
    title: 'The Art of Decanting',
    description: 'When and how to decant natural wines for optimal enjoyment.',
    readTime: '4 min read',
    category: 'Intermediate',
  },
  {
    title: 'Serving Temperatures',
    description: 'A complete guide to serving temperatures for different natural wine styles.',
    readTime: '3 min read',
    category: 'Beginner',
  },
];

// PDFs data
const pdfResources = [
  {
    title: 'Natural Wine 101',
    description: 'Everything you need to know about natural wine in one comprehensive booklet.',
    pages: 24,
    size: '2.4 MB',
  },
  {
    title: 'Regional Guide: France',
    description: 'Explore the natural wine regions of France, from Loire to Beaujolais.',
    pages: 36,
    size: '4.1 MB',
  },
  {
    title: 'Grape Variety Handbook',
    description: 'A visual guide to indigenous and rare grape varieties used in natural wine.',
    pages: 48,
    size: '5.8 MB',
  },
  {
    title: 'Biodynamic Calendar 2025',
    description: 'A printable calendar with lunar phases and biodynamic farming dates.',
    pages: 14,
    size: '1.2 MB',
  },
];

// Harvest reports data
const harvestReports = [
  {
    year: 2024,
    region: 'Loire Valley, France',
    summary: 'A challenging vintage with late spring frosts and summer heat waves, resulting in concentrated, powerful wines.',
    highlights: ['Early harvest', 'Low yields', 'Exceptional Chenin Blanc'],
  },
  {
    year: 2024,
    region: 'Catalonia, Spain',
    summary: 'Drought conditions led to small berries and intense flavors. Garnacha shows remarkable depth.',
    highlights: ['Water stress management', 'Organic resilience', 'High phenolic ripeness'],
  },
  {
    year: 2024,
    region: 'Sicily, Italy',
    summary: 'A return to classic Mediterranean conditions after years of heat. Nerello Mascalese thrives.',
    highlights: ['Volcanic terroir expression', 'Balanced acidity', 'Extended maceration experiments'],
  },
  {
    year: 2023,
    region: 'Jura, France',
    summary: 'Textbook vintage for oxidative styles. Vin Jaune production reaches new heights.',
    highlights: ['Ideal ripeness', 'Perfect conditions for sous voile aging', 'Strong Savagnin crop'],
  },
];

const KnowledgeHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

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
                {guides.map((guide, index) => (
                  <motion.article
                    key={guide.title}
                    variants={itemVariants}
                    className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        guide.category === 'Beginner' 
                          ? 'bg-green-500/10 text-green-600' 
                          : 'bg-orange-500/10 text-orange-600'
                      }`}>
                        {guide.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{guide.readTime}</span>
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
                {pdfResources.map((pdf, index) => (
                  <motion.div
                    key={pdf.title}
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
                        <span>{pdf.pages} pages</span>
                        <span>{pdf.size}</span>
                      </div>
                    </div>
                    
                    <button className="p-3 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
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
                {harvestReports.map((report, index) => (
                  <motion.article
                    key={`${report.year}-${report.region}`}
                    variants={itemVariants}
                    className="bg-card border border-border rounded-xl p-6 md:p-8"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="font-display text-2xl font-bold text-primary">{report.year}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
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
                      
                      <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                        Full report
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.article>
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
