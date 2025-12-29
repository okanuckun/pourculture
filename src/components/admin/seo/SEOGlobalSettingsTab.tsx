import React, { useState, useEffect } from 'react';
import { useSEOGlobalSettings } from '@/hooks/useSEOSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { robotsMetaOptions, pageTypeLabels } from '@/lib/seo-routes';

export const SEOGlobalSettingsTab: React.FC = () => {
  const { settings, loading, updateSettings } = useSEOGlobalSettings();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_template: '',
    description_template: '',
    default_og_image: '',
    default_robots_meta: 'index, follow',
    robots_txt_content: '',
    sitemap_include_rules: {} as Record<string, boolean>,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        title_template: settings.title_template || '',
        description_template: settings.description_template || '',
        default_og_image: settings.default_og_image || '',
        default_robots_meta: settings.default_robots_meta || 'index, follow',
        robots_txt_content: settings.robots_txt_content || '',
        sitemap_include_rules: (settings.sitemap_include_rules as Record<string, boolean>) || {},
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSitemapRule = (pageType: string, include: boolean) => {
    setFormData(prev => ({
      ...prev,
      sitemap_include_rules: {
        ...prev.sitemap_include_rules,
        [pageType]: include,
      },
    }));
  };

  // Validate robots.txt
  const robotsTxtWarnings: string[] = [];
  if (formData.robots_txt_content.includes('Disallow: /')) {
    if (!formData.robots_txt_content.includes('Disallow: /admin')) {
      robotsTxtWarnings.push('Consider blocking /admin routes');
    }
  }
  if (!formData.robots_txt_content.includes('Sitemap:')) {
    robotsTxtWarnings.push('Missing Sitemap directive');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Global Settings
        </Button>
      </div>

      <Tabs defaultValue="defaults">
        <TabsList>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value="defaults" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Meta Templates</CardTitle>
              <CardDescription>
                These templates are used when pages don't have custom SEO settings.
                Use {'{PageTitle}'} as a placeholder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title Template</Label>
                <Input
                  value={formData.title_template}
                  onChange={(e) => updateField('title_template', e.target.value)}
                  placeholder="{PageTitle} | PourCulture"
                />
                <p className="text-xs text-muted-foreground">
                  Example output: "Discover Wine Bars | PourCulture"
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description Template (Optional)</Label>
                <Textarea
                  value={formData.description_template}
                  onChange={(e) => updateField('description_template', e.target.value)}
                  placeholder="Default description for pages..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Default OG Image</Label>
                <Input
                  value={formData.default_og_image}
                  onChange={(e) => updateField('default_og_image', e.target.value)}
                  placeholder="https://pourculture.com/og-default.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Default Robots Meta</Label>
                <Select
                  value={formData.default_robots_meta}
                  onValueChange={(value) => updateField('default_robots_meta', value)}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {robotsMetaOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Robots.txt Editor</CardTitle>
              <CardDescription>
                Control how search engines crawl your site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={formData.robots_txt_content}
                onChange={(e) => updateField('robots_txt_content', e.target.value)}
                className="font-mono text-sm min-h-[300px]"
                placeholder={`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth

Sitemap: https://pourculture.com/sitemap.xml`}
              />

              {robotsTxtWarnings.length > 0 && (
                <div className="space-y-2">
                  {robotsTxtWarnings.map((warning, i) => (
                    <div key={i} className="flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateField('robots_txt_content', `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth

Sitemap: https://pourculture.com/sitemap.xml`)}
                >
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Settings</CardTitle>
              <CardDescription>
                Choose which page types to include in your sitemap.xml
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(pageTypeLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={formData.sitemap_include_rules[key] ?? true}
                      onCheckedChange={(checked) => updateSitemapRule(key, checked)}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Sitemap Preview</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pourculture.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pourculture.com/discover</loc>
    <priority>0.9</priority>
  </url>
  <!-- Dynamic pages will be generated automatically -->
</urlset>`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
