import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Grape, Calendar, MapPin, Loader2, Sun, Cloud, Droplets, ThermometerSun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface HarvestReport {
  id: string;
  year: number;
  region: string;
  summary: string;
  highlights: string[];
  created_at: string;
}

// Simulated regional data based on region name
const getRegionalData = (region: string) => {
  const regionLower = region.toLowerCase();
  
  // Climate data varies by region
  if (regionLower.includes('loire')) {
    return {
      country: 'France',
      climate: 'Oceanic',
      keyGrapes: ['Chenin Blanc', 'Cabernet Franc', 'Melon de Bourgogne', 'Sauvignon Blanc'],
      avgTemp: { spring: 12, summer: 21, fall: 14, winter: 6 },
      rainfall: { spring: 55, summer: 45, fall: 65, winter: 70 },
      harvestWindow: 'September - October',
      qualityScore: 88,
    };
  } else if (regionLower.includes('catalonia') || regionLower.includes('spain')) {
    return {
      country: 'Spain',
      climate: 'Mediterranean',
      keyGrapes: ['Garnacha', 'Monastrell', 'Macabeo', 'Xarel·lo'],
      avgTemp: { spring: 15, summer: 26, fall: 18, winter: 10 },
      rainfall: { spring: 45, summer: 20, fall: 70, winter: 50 },
      harvestWindow: 'August - September',
      qualityScore: 91,
    };
  } else if (regionLower.includes('sicily') || regionLower.includes('italy')) {
    return {
      country: 'Italy',
      climate: 'Mediterranean',
      keyGrapes: ['Nerello Mascalese', 'Carricante', 'Frappato', 'Nero d\'Avola'],
      avgTemp: { spring: 16, summer: 27, fall: 20, winter: 12 },
      rainfall: { spring: 35, summer: 15, fall: 55, winter: 65 },
      harvestWindow: 'August - October',
      qualityScore: 90,
    };
  } else if (regionLower.includes('jura')) {
    return {
      country: 'France',
      climate: 'Continental',
      keyGrapes: ['Savagnin', 'Chardonnay', 'Poulsard', 'Trousseau'],
      avgTemp: { spring: 10, summer: 19, fall: 12, winter: 3 },
      rainfall: { spring: 80, summer: 90, fall: 85, winter: 95 },
      harvestWindow: 'September - October',
      qualityScore: 93,
    };
  } else if (regionLower.includes('beaujolais')) {
    return {
      country: 'France',
      climate: 'Continental',
      keyGrapes: ['Gamay', 'Chardonnay'],
      avgTemp: { spring: 11, summer: 20, fall: 13, winter: 4 },
      rainfall: { spring: 65, summer: 70, fall: 75, winter: 60 },
      harvestWindow: 'September',
      qualityScore: 89,
    };
  } else if (regionLower.includes('georgia')) {
    return {
      country: 'Georgia',
      climate: 'Continental',
      keyGrapes: ['Rkatsiteli', 'Saperavi', 'Mtsvane', 'Kisi'],
      avgTemp: { spring: 13, summer: 24, fall: 15, winter: 4 },
      rainfall: { spring: 60, summer: 55, fall: 50, winter: 40 },
      harvestWindow: 'September - October',
      qualityScore: 92,
    };
  }
  
  // Default data
  return {
    country: 'Unknown',
    climate: 'Varied',
    keyGrapes: ['Local Varieties'],
    avgTemp: { spring: 12, summer: 22, fall: 14, winter: 6 },
    rainfall: { spring: 50, summer: 40, fall: 60, winter: 70 },
    harvestWindow: 'September - October',
    qualityScore: 85,
  };
};

const HarvestReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<HarvestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedReports, setRelatedReports] = useState<HarvestReport[]>([]);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('harvest_reports')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) {
      setReport(null);
    } else {
      setReport(data);
      // Fetch other reports from same year
      const { data: related } = await supabase
        .from('harvest_reports')
        .select('*')
        .eq('is_published', true)
        .eq('year', data.year)
        .neq('id', id)
        .limit(3);
      
      setRelatedReports(related || []);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <BrutalistLayout>
        <SEOHead title="Loading..." description="Loading harvest report" />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!report) {
    return (
      <BrutalistLayout>
        <SEOHead title="Report Not Found" description="The requested harvest report could not be found" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Report Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The harvest report you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </div>
      </BrutalistLayout>
    );
  }

  const regionalData = getRegionalData(report.region);
  
  const temperatureData = [
    { season: 'Spring', temp: regionalData.avgTemp.spring },
    { season: 'Summer', temp: regionalData.avgTemp.summer },
    { season: 'Fall', temp: regionalData.avgTemp.fall },
    { season: 'Winter', temp: regionalData.avgTemp.winter },
  ];

  const rainfallData = [
    { season: 'Spring', rainfall: regionalData.rainfall.spring },
    { season: 'Summer', rainfall: regionalData.rainfall.summer },
    { season: 'Fall', rainfall: regionalData.rainfall.fall },
    { season: 'Winter', rainfall: regionalData.rainfall.winter },
  ];

  const qualityData = [
    { subject: 'Ripeness', value: Math.min(100, regionalData.qualityScore + 5) },
    { subject: 'Acidity', value: Math.min(100, regionalData.qualityScore - 3) },
    { subject: 'Health', value: Math.min(100, regionalData.qualityScore + 2) },
    { subject: 'Yield', value: Math.min(100, regionalData.qualityScore - 8) },
    { subject: 'Balance', value: regionalData.qualityScore },
  ];

  const grapeDistribution = regionalData.keyGrapes.map((grape, i) => ({
    name: grape,
    value: 100 - (i * 15),
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#82ca9d', '#ffc658'];

  return (
    <BrutalistLayout>
      <SEOHead 
        title={`${report.year} ${report.region} Harvest Report`}
        description={report.summary}
      />
      
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link to="/knowledge" className="hover:text-primary transition-colors">
                  Knowledge Hub
                </Link>
                <span>/</span>
                <span>Harvest Reports</span>
                <span>/</span>
                <span className="text-foreground">{report.year}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  {/* Year Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-lg font-bold text-primary">{report.year} Vintage</span>
                  </div>

                  {/* Region */}
                  <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                    {report.region}
                  </h1>

                  {/* Country & Climate */}
                  <div className="flex items-center gap-4 text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{regionalData.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sun className="w-4 h-4" />
                      <span>{regionalData.climate}</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                {/* Quality Score */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="hsl(var(--muted))"
                        strokeWidth="12"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="12"
                        strokeDasharray={`${(regionalData.qualityScore / 100) * 553} 553`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-display font-bold text-foreground">
                        {regionalData.qualityScore}
                      </span>
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-12 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Vintage Highlights
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Grape className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Grapes */}
        <section className="py-12 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Key Grape Varieties
              </h2>
              <div className="flex flex-wrap gap-3">
                {regionalData.keyGrapes.map((grape, index) => (
                  <span
                    key={grape}
                    className="px-4 py-2 bg-card border border-border rounded-full text-foreground font-medium"
                  >
                    {grape}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Harvest window: {regionalData.harvestWindow}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Climate & Quality Analysis
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Temperature Chart */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ThermometerSun className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Average Temperature (°C)
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={temperatureData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="temp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rainfall Chart */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Rainfall (mm)
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rainfallData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="season" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="rainfall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quality Radar */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Grape className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Quality Profile
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={qualityData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <PolarRadiusAxis stroke="hsl(var(--border))" fontSize={10} />
                        <Radar
                          name="Quality"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grape Distribution */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Cloud className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Grape Prominence
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={grapeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {grapeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related Reports */}
        {relatedReports.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/20 border-t border-border">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Other {report.year} Reports
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedReports.map((related) => (
                  <Link
                    key={related.id}
                    to={`/harvest/${related.id}`}
                    className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-primary">{related.year}</span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {related.region}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back Button */}
        <section className="py-8 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <Button variant="outline" onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </div>
        </section>
      </main>
    </BrutalistLayout>
  );
};

export default HarvestReportDetail;
