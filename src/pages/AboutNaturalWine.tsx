import { useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { ArrowLeft, Grape, Leaf, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutNaturalWine = () => {
  const navigate = useNavigate();

  const principles = [
    {
      icon: Grape,
      title: 'Organic & Biodynamic Grapes',
      description:
        'Natural wines start in the vineyard with organically or biodynamically grown grapes, free from synthetic pesticides and herbicides.',
    },
    {
      icon: Leaf,
      title: 'Minimal Intervention',
      description:
        'Winemakers use little to no additives during fermentation, allowing the wine to express its true character and terroir.',
    },
    {
      icon: Sparkles,
      title: 'Wild Fermentation',
      description:
        'Native yeasts naturally present on grape skins drive the fermentation, creating unique and complex flavors.',
    },
    {
      icon: Heart,
      title: 'No Added Sulfites',
      description:
        'Most natural wines contain little to no added sulfites, though small amounts may be used at bottling for stability.',
    },
  ];

  const faqs = [
    {
      question: 'What makes wine “natural”?',
      answer:
        'Natural wine is made from organically or biodynamically farmed grapes with minimal intervention in the cellar. This means no additives, indigenous yeast fermentation, and little to no added sulfites.',
    },
    {
      question: 'Does natural wine taste different?',
      answer:
        'Yes. Natural wines often feel more vibrant and alive. They can be funky, fruity, earthy, or mineral—each bottle reflects its vintage and terroir.',
    },
    {
      question: 'Is natural wine healthier?',
      answer:
        'There is no official “healthier” claim, but natural wines typically contain fewer additives and preservatives. Many people report better tolerance than conventional wines.',
    },
    {
      question: 'How should I store natural wine?',
      answer:
        'Store bottles in a cool, dark place. With lower sulfites, some natural wines can be more sensitive to heat and light. Enjoy within a reasonable time after purchase.',
    },
    {
      question: 'Why is natural wine sometimes cloudy?',
      answer:
        'Many natural wines are unfiltered and unfined, which can create cloudiness. It’s normal and often signals minimal processing.',
    },
  ];

  return (
    <BrutalistLayout
      title="WHAT IS NATURAL WINE?"
      subtitle="A minimal-intervention approach: organic grapes, native fermentation, and fewer additives—wine as a living expression of place."
      showBackButton
      backPath="/"
      backLabel="Home"
    >
      <SEOHead
        title="What Is Natural Wine? | PourCulture"
        description="Learn what natural wine is: organic grapes, minimal intervention, wild fermentation, and the philosophy behind the movement."
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        {/* Intro */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-12 gap-6 border-b border-foreground/20 pb-10"
        >
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              What is natural wine?
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
              Natural wine is more than a trend—it’s a return to older winemaking traditions. Think grapes,
              time, and craft, with minimal additives and maximum transparency.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <div className="border-2 border-foreground/20 p-4">
              <p className="text-[10px] tracking-wider text-muted-foreground">QUICK TAKE</p>
              <p className="mt-2 text-sm leading-relaxed">
                Organic farming + native yeast + minimal cellar interventions.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Principles */}
        <section className="py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">PRINCIPLES</h2>
            <span className="text-[10px] tracking-wider text-muted-foreground">THE BASELINE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((p) => (
              <article key={p.title} className="border-2 border-foreground/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 border border-foreground/20 flex items-center justify-center">
                    <p.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight">{p.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* History */}
        <section className="py-10 border-t border-foreground/20">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">A BRIEF HISTORY</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The modern movement grew in France in the late 20th century and then spread worldwide.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="border-2 border-foreground/20 p-6">
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    The natural wine movement is often traced to France in the 1960s–70s, inspired by
                    pioneers like Jules Chauvet, who advocated for minimal sulfur and indigenous yeasts.
                  </p>
                  <p>
                    Over time, winemakers in regions like Beaujolais, the Loire Valley, and the Jura embraced
                    these principles, building a culture around transparency and low-intervention craft.
                  </p>
                  <p>
                    Today, natural wine is global—from volcanic soils to high-altitude vineyards—driven by
                    growers who value place, season, and honesty in the bottle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-10 border-t border-foreground/20">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">FAQ</h2>
            <span className="text-[10px] tracking-wider text-muted-foreground">COMMON QUESTIONS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((f) => (
              <article key={f.question} className="border-2 border-foreground/20 p-5">
                <h3 className="text-sm font-bold tracking-tight">{f.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 border-t border-foreground/20">
          <div className="border-2 border-foreground p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">READY TO EXPLORE?</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Discover venues and producers near you—then save your favorites for later.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs tracking-wider hover:bg-foreground/90 transition-colors"
                >
                  EXPLORE MAP
                </Link>
                <button
                  onClick={() => navigate('/explore/winemaker')}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground text-xs tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                  MEET WINEMAKERS
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="mt-6 inline-flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              BACK TO HOME
            </button>
          </div>
        </section>
      </main>
    </BrutalistLayout>
  );
};

export default AboutNaturalWine;
