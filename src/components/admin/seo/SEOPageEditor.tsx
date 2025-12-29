import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSEOPageSettings, useSEOChangeLog } from '@/hooks/useSEOSettings';
import { robotsMetaOptions } from '@/lib/seo-routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SERPPreview } from '@/components/seo/SERPPreview';
import { OGPreview } from '@/components/seo/OGPreview';
import { SchemaEditor } from '@/components/seo/SchemaEditor';
import { SEOScoreCard, calculateSEOScore } from '@/components/seo/SEOScoreCard';

interface SEOPageEditorProps {
  pagePath: string;
  pageType: string;
  existingSettings?: any;
  onClose: () => void;
}

export const SEOPageEditor: React.FC<SEOPageEditorProps> = ({
  pagePath,
  pageType,
  existingSettings,
  onClose,
}) => {
  const { upsertSettings } = useSEOPageSettings();
  const { logChange } = useSEOChangeLog(pagePath);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('meta');

  const [formData, setFormData] = useState({
    meta_title: existingSettings?.meta_title || '',
    meta_description: existingSettings?.meta_description || '',
    meta_keywords: existingSettings?.meta_keywords || '',
    focus_keyword: existingSettings?.focus_keyword || '',
    secondary_keywords: existingSettings?.secondary_keywords || [],
    robots_meta: existingSettings?.robots_meta || 'index, follow',
    canonical_mode: existingSettings?.canonical_mode || 'auto',
    canonical_url: existingSettings?.canonical_url || '',
    include_in_sitemap: existingSettings?.include_in_sitemap ?? true,
    og_title: existingSettings?.og_title || '',
    og_description: existingSettings?.og_description || '',
    og_image: existingSettings?.og_image || '',
    twitter_card_type: existingSettings?.twitter_card_type || 'summary_large_image',
    twitter_image: existingSettings?.twitter_image || '',
    schema_data: existingSettings?.schema_data || [],
    h1_text: existingSettings?.h1_text || '',
    word_count: existingSettings?.word_count || 0,
  });

  const seoScore = calculateSEOScore({
    meta_title: formData.meta_title,
    meta_description: formData.meta_description,
    h1_text: formData.h1_text,
    og_image: formData.og_image,
    schema_data: formData.schema_data,
    robots_meta: formData.robots_meta,
    word_count: formData.word_count,
  });

  const handleSave = async () => {
    setSaving(true);
    const user = (await supabase.auth.getUser()).data.user;

    // Log changes
    const fieldsToCheck = ['meta_title', 'meta_description', 'robots_meta', 'canonical_url', 'og_image'];
    for (const field of fieldsToCheck) {
      const oldValue = existingSettings?.[field] || null;
      const newValue = formData[field as keyof typeof formData] || null;
      if (oldValue !== newValue) {
        await logChange({
          page_path: pagePath,
          change_type: existingSettings ? 'update' : 'create',
          field_name: field,
          old_value: oldValue?.toString() || null,
          new_value: newValue?.toString() || null,
          changed_by: user?.id || '',
        });
      }
    }

    const result = await upsertSettings({
      page_path: pagePath,
      page_type: pageType,
      seo_score: seoScore,
      ...formData,
    });

    setSaving(false);
    if (result) {
      onClose();
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const baseUrl = 'https://pourculture.com';

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SEOScoreCard
                score={seoScore}
                title={formData.meta_title}
                description={formData.meta_description}
                robotsMeta={formData.robots_meta}
                h1Text={formData.h1_text}
                ogImage={formData.og_image}
                schemaCount={formData.schema_data?.length || 0}
                wordCount={formData.word_count}
              />
            </div>
            <div className="flex flex-col justify-center">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="meta">Meta / SERP</TabsTrigger>
          <TabsTrigger value="indexing">Indexing</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Meta Tab */}
        <TabsContent value="meta" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => updateField('meta_title', e.target.value)}
                  placeholder="Page title for search engines"
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_title.length}/60 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => updateField('meta_description', e.target.value)}
                  placeholder="Brief description for search results"
                  rows={3}
                  maxLength={170}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 characters recommended
                </p>
              </div>

              <div className="space-y-2">
                <Label>Focus Keyword (Internal)</Label>
                <Input
                  value={formData.focus_keyword}
                  onChange={(e) => updateField('focus_keyword', e.target.value)}
                  placeholder="Primary keyword for this page"
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords (Optional)</Label>
                <Input
                  value={formData.meta_keywords}
                  onChange={(e) => updateField('meta_keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">SERP Preview</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Desktop</p>
                  <SERPPreview
                    title={formData.meta_title || 'Page Title'}
                    description={formData.meta_description || 'Page description...'}
                    url={`${baseUrl}${pagePath}`}
                    type="desktop"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Mobile</p>
                  <SERPPreview
                    title={formData.meta_title || 'Page Title'}
                    description={formData.meta_description || 'Page description...'}
                    url={`${baseUrl}${pagePath}`}
                    type="mobile"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Indexing Tab */}
        <TabsContent value="indexing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Robots Meta</Label>
                <Select
                  value={formData.robots_meta}
                  onValueChange={(value) => updateField('robots_meta', value)}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Canonical Mode</Label>
                <Select
                  value={formData.canonical_mode}
                  onValueChange={(value) => updateField('canonical_mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (self-referencing)</SelectItem>
                    <SelectItem value="manual">Manual URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.canonical_mode === 'manual' && (
                <div className="space-y-2">
                  <Label>Canonical URL</Label>
                  <Input
                    value={formData.canonical_url}
                    onChange={(e) => updateField('canonical_url', e.target.value)}
                    placeholder="https://pourculture.com/..."
                  />
                </div>
              )}

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Include in Sitemap</Label>
                  <p className="text-xs text-muted-foreground">Add this page to sitemap.xml</p>
                </div>
                <Switch
                  checked={formData.include_in_sitemap}
                  onCheckedChange={(checked) => updateField('include_in_sitemap', checked)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Indexability Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.robots_meta.includes('noindex') && (
                  <div className="flex items-start gap-2 text-orange-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>This page is set to noindex and won't appear in search results</span>
                  </div>
                )}
                {formData.canonical_mode === 'manual' && formData.canonical_url && (
                  <div className="flex items-start gap-2 text-blue-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>Canonical points to: {formData.canonical_url}</span>
                  </div>
                )}
                {!formData.include_in_sitemap && (
                  <div className="flex items-start gap-2 text-yellow-600 text-sm">
                    <AlertTriangle className="w-4 h-4 mt-0.5" />
                    <span>Page excluded from sitemap</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input
                  value={formData.og_title}
                  onChange={(e) => updateField('og_title', e.target.value)}
                  placeholder={formData.meta_title || 'Same as meta title'}
                />
              </div>

              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea
                  value={formData.og_description}
                  onChange={(e) => updateField('og_description', e.target.value)}
                  placeholder={formData.meta_description || 'Same as meta description'}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input
                  value={formData.og_image}
                  onChange={(e) => updateField('og_image', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Twitter Card Type</Label>
                <Select
                  value={formData.twitter_card_type}
                  onValueChange={(value) => updateField('twitter_card_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Facebook / WhatsApp Preview</p>
                <OGPreview
                  title={formData.og_title || formData.meta_title || 'Page Title'}
                  description={formData.og_description || formData.meta_description || 'Page description'}
                  image={formData.og_image}
                  url={`${baseUrl}${pagePath}`}
                  type="facebook"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Twitter Preview</p>
                <OGPreview
                  title={formData.og_title || formData.meta_title || 'Page Title'}
                  description={formData.og_description || formData.meta_description || 'Page description'}
                  image={formData.twitter_image || formData.og_image}
                  url={`${baseUrl}${pagePath}`}
                  type="twitter"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="space-y-6">
          <SchemaEditor
            schemaData={formData.schema_data || []}
            onChange={(schemas) => updateField('schema_data', schemas)}
          />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>H1 Text (Extracted)</Label>
                <Input
                  value={formData.h1_text}
                  onChange={(e) => updateField('h1_text', e.target.value)}
                  placeholder="H1 heading of the page"
                />
                <p className="text-xs text-muted-foreground">
                  For tracking purposes. Update when page content changes.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Word Count (Approx)</Label>
                <Input
                  type="number"
                  value={formData.word_count}
                  onChange={(e) => updateField('word_count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Content Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>H1 Present</span>
                  <span className={formData.h1_text ? 'text-green-600' : 'text-red-600'}>
                    {formData.h1_text ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Word Count</span>
                  <span className={formData.word_count >= 300 ? 'text-green-600' : 'text-yellow-600'}>
                    {formData.word_count} words
                  </span>
                </div>
                {formData.word_count < 300 && (
                  <p className="text-yellow-600 text-xs">
                    Content may be too thin. Aim for 300+ words.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
