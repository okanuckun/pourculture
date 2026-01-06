import React, { useState, useEffect } from 'react';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Users, BookOpen, Award, ExternalLink, Instagram, Twitter, Globe, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface Person {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  category: string;
  display_order: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url?: string;
  amazon_link?: string;
  year?: number;
  display_order: number;
}

const categoryLabels: Record<string, string> = {
  winemaker: 'Winemaker',
  sommelier: 'Sommelier',
  writer: 'Writer',
  influencer: 'Influencer',
};

const People: React.FC = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [people, setPeople] = useState<Person[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [peopleResult, booksResult] = await Promise.all([
        supabase
          .from('featured_people')
          .select('*')
          .eq('is_featured', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('recommended_books')
          .select('*')
          .eq('is_featured', true)
          .order('display_order', { ascending: true })
      ]);

      if (peopleResult.data) {
        setPeople(peopleResult.data);
      }
      if (booksResult.data) {
        setBooks(booksResult.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredPeople = selectedCategory === 'all' 
    ? people 
    : people.filter(p => p.category === selectedCategory);

  const categories = ['all', 'winemaker', 'sommelier', 'writer', 'influencer'];

  return (
    <BrutalistLayout title="People" subtitle="The voices shaping natural wine culture">
      <SEOHead 
        title="People | PourCulture"
        description="Discover the winemakers, writers, sommeliers, and influencers shaping the natural wine world. Essential reading and key figures to follow."
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="border-2 border-foreground p-6 mb-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Natural wine isn't just about what's in the bottle—it's about the people who make it, write about it, 
            and champion it. Here you'll find the key figures worth following, the essential books to read, and 
            the voices that are shaping the future of wine.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start gap-2 bg-transparent border-b-2 border-foreground rounded-none p-0 mb-8">
              <TabsTrigger 
                value="people"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-2 text-xs tracking-wider rounded-none border-2 border-foreground data-[state=active]:border-b-background -mb-[2px]"
              >
                <Users className="w-4 h-4 mr-2" />
                PEOPLE TO FOLLOW
              </TabsTrigger>
              <TabsTrigger 
                value="books"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-2 text-xs tracking-wider rounded-none border-2 border-foreground data-[state=active]:border-b-background -mb-[2px]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                ESSENTIAL READING
              </TabsTrigger>
            </TabsList>

            {/* People Tab */}
            <TabsContent value="people" className="mt-0">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] tracking-wider uppercase transition-colors border-2 ${
                      selectedCategory === cat
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-foreground/30 hover:border-foreground'
                    }`}
                  >
                    {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>

              {/* People Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPeople.map((person) => (
                  <div 
                    key={person.id}
                    className="border-2 border-foreground p-4 hover:bg-foreground/5 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {person.image_url ? (
                          <img src={person.image_url} alt={person.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-foreground/30">
                            {person.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] tracking-wider text-muted-foreground uppercase">
                          {categoryLabels[person.category] || person.category}
                        </span>
                        <h3 className="text-sm font-bold mt-0.5 group-hover:underline">
                          {person.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {person.title}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {person.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-foreground/20">
                      {person.instagram && (
                        <a 
                          href={`https://instagram.com/${person.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {person.twitter && (
                        <a 
                          href={`https://twitter.com/${person.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {person.website && (
                        <a 
                          href={person.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredPeople.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No people found in this category.
                </div>
              )}

              {/* Coming Soon Notice */}
              <div className="mt-8 p-4 border-2 border-dashed border-foreground/30 text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  More profiles coming soon. Know someone who should be featured?{' '}
                  <a href="/forum" className="underline hover:text-foreground">
                    Let us know in the forum
                  </a>
                </p>
              </div>
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <div 
                    key={book.id}
                    className="border-2 border-foreground p-4 hover:bg-foreground/5 transition-colors group"
                  >
                    <div className="flex gap-4">
                      {/* Book Cover */}
                      <div className="w-20 h-28 border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold group-hover:underline">
                          {book.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {book.author}
                          {book.year && <span className="ml-1">({book.year})</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {book.description}
                        </p>
                        {book.amazon_link && (
                          <a 
                            href={book.amazon_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] tracking-wider mt-3 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            BUY NOW
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {books.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No books found.
                </div>
              )}

              {/* Book Submission CTA */}
              <div className="mt-8 p-4 border-2 border-dashed border-foreground/30 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Have a book recommendation?{' '}
                  <a href="/forum" className="underline hover:text-foreground">
                    Share it in the forum
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </BrutalistLayout>
  );
};

export default People;
