import { useNavigate } from 'react-router-dom';
import { RaisinNavbar } from '@/components/RaisinNavbar';
import { SEOHead } from '@/components/SEOHead';
import { ArrowLeft, Grape, Leaf, Heart, Sparkles } from 'lucide-react';

const AboutNaturalWine = () => {
  const navigate = useNavigate();

  const principles = [
    {
      icon: Grape,
      title: 'Organic & Biodynamic Grapes',
      description: 'Natural wines start in the vineyard with organically or biodynamically grown grapes, free from synthetic pesticides and herbicides.'
    },
    {
      icon: Leaf,
      title: 'Minimal Intervention',
      description: 'Winemakers use little to no additives during fermentation, allowing the wine to express its true character and terroir.'
    },
    {
      icon: Sparkles,
      title: 'Wild Fermentation',
      description: 'Native yeasts naturally present on grape skins drive the fermentation, creating unique and complex flavors.'
    },
    {
      icon: Heart,
      title: 'No Added Sulfites',
      description: 'Most natural wines contain little to no added sulfites, though small amounts may be used at bottling for stability.'
    }
  ];

  const faqs = [
    {
      question: 'What makes wine "natural"?',
      answer: 'Natural wine is made from organically or biodynamically farmed grapes with minimal intervention in the cellar. This means no additives, indigenous yeast fermentation, and little to no added sulfites.'
    },
    {
      question: 'Does natural wine taste different?',
      answer: 'Yes! Natural wines often have more vibrant, alive flavors. They can be funky, fruity, earthy, or mineral. Each bottle is unique, reflecting the specific vintage and terroir.'
    },
    {
      question: 'Is natural wine healthier?',
      answer: 'While not officially certified as healthier, natural wines contain fewer additives and preservatives. Many people report fewer headaches and better tolerance compared to conventional wines.'
    },
    {
      question: 'How should I store natural wine?',
      answer: 'Store natural wines in a cool, dark place. Because they often have less sulfites, they can be more sensitive to heat and light. Consume within a reasonable timeframe after purchase.'
    },
    {
      question: 'Why is natural wine sometimes cloudy?',
      answer: 'Many natural wines are unfiltered and unfined, which can result in a cloudy appearance. This is completely normal and often indicates minimal processing.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="What is Natural Wine? | RAW CELLAR"
        description="Learn about natural wine: organic grapes, minimal intervention, wild fermentation, and the philosophy behind the natural wine movement."
      />
      <RaisinNavbar />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="container mx-auto px-4 relative">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                What is <span className="text-primary">Natural Wine</span>?
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Natural wine is more than a trend—it's a return to ancient winemaking traditions. 
                It's wine in its purest form: grapes, time, and the skilled hands of passionate winemakers.
              </p>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              The Principles of Natural Wine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <principle.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                A Brief History
              </h2>
              <div className="prose prose-lg text-muted-foreground space-y-6">
                <p>
                  The natural wine movement began in France in the 1960s and 70s, led by pioneers like 
                  Jules Chauvet, a Beaujolais winemaker and scientist who advocated for winemaking without 
                  added sulfur and with indigenous yeasts.
                </p>
                <p>
                  In the following decades, winemakers across France—particularly in Beaujolais, the Loire 
                  Valley, and the Jura—began embracing these principles. Names like Marcel Lapierre, 
                  Pierre Overnoy, and the Puzelat brothers became legends in the movement.
                </p>
                <p>
                  Today, natural wine has become a global phenomenon. From the volcanic slopes of Mount 
                  Etna to the high-altitude vineyards of Argentina, winemakers everywhere are rediscovering 
                  the beauty of minimal intervention winemaking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-xl bg-background border border-border"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Explore?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover natural wine bars, restaurants, and shops near you. Meet the winemakers 
              behind your favorite bottles.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/explore/bars')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Find Wine Bars
              </button>
              <button
                onClick={() => navigate('/explore/winemakers')}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
              >
                Meet Winemakers
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutNaturalWine;
