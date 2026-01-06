import React, { useState } from 'react';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Users, BookOpen, Award, ExternalLink, Instagram, Twitter, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Person {
  id: string;
  name: string;
  title: string;
  bio: string;
  image?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
  category: 'winemaker' | 'sommelier' | 'writer' | 'influencer';
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover?: string;
  amazonLink?: string;
  year?: number;
}

// Sample data - bu veriler daha sonra database'den çekilebilir
const featuredPeople: Person[] = [
  {
    id: '1',
    name: 'Alice Feiring',
    title: 'Wine Writer & Author',
    bio: 'Pioneering natural wine journalist and author of "Natural Wine for the People" and "The Dirty Guide to Wine".',
    category: 'writer',
    twitter: 'alicefeiring',
    website: 'https://www.alicefeiring.com',
  },
  {
    id: '2',
    name: 'Pascaline Lepeltier',
    title: 'Master Sommelier',
    bio: 'One of the most influential voices in natural wine, Master Sommelier and co-founder of Racines NY.',
    category: 'sommelier',
    instagram: 'pascalinelepeltier',
  },
  {
    id: '3',
    name: 'Isabelle Legeron MW',
    title: 'Master of Wine',
    bio: 'Founder of RAW Wine, the world\'s leading natural wine fair, and author of "Natural Wine: An Introduction to Organic and Biodynamic Wines".',
    category: 'writer',
    instagram: 'rawwine',
    website: 'https://www.rawwine.com',
  },
  {
    id: '4',
    name: 'Frank Cornelissen',
    title: 'Winemaker',
    bio: 'Belgian-born winemaker on Mount Etna, producing some of the most sought-after natural wines in the world.',
    category: 'winemaker',
    website: 'https://www.frankcornelissen.it',
  },
  {
    id: '5',
    name: 'Elisabetta Foradori',
    title: 'Winemaker',
    bio: 'Pioneer of natural winemaking in Trentino, known for her exceptional Teroldego and amphora-aged wines.',
    category: 'winemaker',
    instagram: 'foradori_winery',
  },
  {
    id: '6',
    name: 'Eric Texier',
    title: 'Winemaker',
    bio: 'Rhône Valley winemaker and former nuclear physicist, known for his experimental approach to natural winemaking.',
    category: 'winemaker',
  },
];

const essentialBooks: Book[] = [
  {
    id: '1',
    title: 'Natural Wine for the People',
    author: 'Alice Feiring',
    description: 'A comprehensive guide to natural wine, covering what it is, how it\'s made, and how to find and enjoy it.',
    year: 2019,
  },
  {
    id: '2',
    title: 'The Dirty Guide to Wine',
    author: 'Alice Feiring',
    description: 'A sommelier-quality wine guide that focuses on terroir and natural winemaking.',
    year: 2017,
  },
  {
    id: '3',
    title: 'Natural Wine: An Introduction',
    author: 'Isabelle Legeron MW',
    description: 'The definitive introduction to natural wine by the founder of RAW Wine.',
    year: 2014,
  },
  {
    id: '4',
    title: 'Amber Revolution',
    author: 'Simon J. Woolf',
    description: 'The story of orange wine and its renaissance, from Georgia to the modern natural wine movement.',
    year: 2018,
  },
  {
    id: '5',
    title: 'Wine Science',
    author: 'Jamie Goode',
    description: 'A scientific approach to understanding wine, terroir, and the winemaking process.',
    year: 2014,
  },
  {
    id: '6',
    title: 'I Taste Red',
    author: 'Jamie Goode',
    description: 'Exploring the science of wine tasting and what we really experience when we taste wine.',
    year: 2016,
  },
];

const categoryLabels: Record<Person['category'], string> = {
  winemaker: 'Winemaker',
  sommelier: 'Sommelier',
  writer: 'Writer',
  influencer: 'Influencer',
};

const People: React.FC = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [selectedCategory, setSelectedCategory] = useState<Person['category'] | 'all'>('all');

  const filteredPeople = selectedCategory === 'all' 
    ? featuredPeople 
    : featuredPeople.filter(p => p.category === selectedCategory);

  const categories: (Person['category'] | 'all')[] = ['all', 'winemaker', 'sommelier', 'writer', 'influencer'];

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
                  {cat === 'all' ? 'All' : categoryLabels[cat]}
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
                    {/* Avatar Placeholder */}
                    <div className="w-16 h-16 border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-foreground/30">
                          {person.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] tracking-wider text-muted-foreground uppercase">
                        {categoryLabels[person.category]}
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
              {essentialBooks.map((book) => (
                <div 
                  key={book.id}
                  className="border-2 border-foreground p-4 hover:bg-foreground/5 transition-colors group"
                >
                  <div className="flex gap-4">
                    {/* Book Cover Placeholder */}
                    <div className="w-20 h-28 border-2 border-foreground bg-muted flex items-center justify-center flex-shrink-0">
                      {book.cover ? (
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
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
                      {book.amazonLink && (
                        <a 
                          href={book.amazonLink}
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
      </div>
    </BrutalistLayout>
  );
};

export default People;
