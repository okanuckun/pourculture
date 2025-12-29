import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSEOPageSettings } from '@/hooks/useSEOSettings';
import { siteRoutes, pageTypeLabels } from '@/lib/seo-routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, Download, Settings, AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SEOPageEditor } from './SEOPageEditor';

interface PageItem {
  path: string;
  type: string;
  name: string;
  settings?: any;
}

export const SEOPagesManager: React.FC = () => {
  const { settings, loading, fetchSettings, upsertSettings } = useSEOPageSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [dynamicPages, setDynamicPages] = useState<PageItem[]>([]);
  const { toast } = useToast();

  // Fetch dynamic pages from database
  useEffect(() => {
    const fetchDynamicPages = async () => {
      const pages: PageItem[] = [];

      // Fetch venues
      const { data: venues } = await supabase.from('venues').select('slug, name');
      venues?.forEach(v => pages.push({ path: `/venue/${v.slug}`, type: 'venue', name: v.name }));

      // Fetch winemakers
      const { data: winemakers } = await supabase.from('winemakers').select('slug, name');
      winemakers?.forEach(w => pages.push({ path: `/winemaker/${w.slug}`, type: 'winemaker', name: w.name }));

      // Fetch wine fairs
      const { data: fairs } = await supabase.from('wine_fairs').select('slug, title');
      fairs?.forEach(f => pages.push({ path: `/wine-fair/${f.slug}`, type: 'event', name: f.title }));

      // Fetch news
      const { data: news } = await supabase.from('news').select('slug, title').eq('is_published', true);
      news?.forEach(n => pages.push({ path: `/news/${n.slug}`, type: 'article', name: n.title }));

      // Fetch guides
      const { data: guides } = await supabase.from('guides').select('id, title').eq('is_published', true);
      guides?.forEach(g => pages.push({ path: `/guide/${g.id}`, type: 'guide', name: g.title }));

      // Fetch routes
      const { data: routes } = await supabase.from('wine_routes').select('slug, title').eq('is_published', true);
      routes?.forEach(r => pages.push({ path: `/route/${r.slug}`, type: 'route', name: r.title }));

      setDynamicPages(pages);
    };

    fetchDynamicPages();
  }, []);

  // Combine static and dynamic pages
  const allPages: PageItem[] = [
    ...siteRoutes.filter(r => r.type === 'static').map(r => ({
      path: r.path,
      type: r.pageType,
      name: r.name,
      settings: settings.find(s => s.page_path === r.path),
    })),
    ...dynamicPages.map(p => ({
      ...p,
      settings: settings.find(s => s.page_path === p.path),
    })),
  ];

  // Filter pages
  const filteredPages = allPages.filter(page => {
    const matchesSearch = page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || page.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'indexed' && (!page.settings?.robots_meta || !page.settings.robots_meta.includes('noindex'))) ||
      (filterStatus === 'noindex' && page.settings?.robots_meta?.includes('noindex')) ||
      (filterStatus === 'missing' && !page.settings);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(filteredPages.map(p => p.path));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (path: string, checked: boolean) => {
    if (checked) {
      setSelectedPages([...selectedPages, path]);
    } else {
      setSelectedPages(selectedPages.filter(p => p !== path));
    }
  };

  const handleBulkNoindex = async () => {
    for (const path of selectedPages) {
      await upsertSettings({ page_path: path, robots_meta: 'noindex, follow' });
    }
    setSelectedPages([]);
    toast({ title: 'Bulk update complete', description: `${selectedPages.length} pages set to noindex` });
  };

  const handleExportCSV = () => {
    const headers = ['Path', 'Type', 'Title', 'Description', 'Robots', 'Canonical', 'Score'];
    const rows = filteredPages.map(p => [
      p.path,
      p.type,
      p.settings?.meta_title || '',
      p.settings?.meta_description || '',
      p.settings?.robots_meta || 'index, follow',
      p.settings?.canonical_url || 'auto',
      p.settings?.seo_score || 0,
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seo-pages-export.csv';
    a.click();
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-black';
    if (score >= 40) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Page type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(pageTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="indexed">Indexed</SelectItem>
                <SelectItem value="noindex">Noindex</SelectItem>
                <SelectItem value="missing">Missing SEO</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPages.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{selectedPages.length} pages selected</span>
              <Button variant="outline" size="sm" onClick={handleBulkNoindex}>
                Set Noindex
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedPages([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[80px]">Index</TableHead>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead className="w-[80px]">Score</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPages.includes(page.path)}
                      onCheckedChange={(checked) => handleSelectPage(page.path, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{page.name}</div>
                      <div className="text-xs text-muted-foreground">{page.path}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {pageTypeLabels[page.type] || page.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {page.settings?.robots_meta?.includes('noindex') ? (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm truncate max-w-[200px]">
                      {page.settings?.meta_title || (
                        <span className="text-muted-foreground italic">Not set</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(page.settings?.seo_score)}>
                      {page.settings?.seo_score || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={editingPage === page.path} onOpenChange={(open) => setEditingPage(open ? page.path : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit SEO: {page.name}</DialogTitle>
                        </DialogHeader>
                        <SEOPageEditor
                          pagePath={page.path}
                          pageType={page.type}
                          existingSettings={page.settings}
                          onClose={() => {
                            setEditingPage(null);
                            fetchSettings();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No pages found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filteredPages.length} of {allPages.length} pages
      </div>
    </div>
  );
};
