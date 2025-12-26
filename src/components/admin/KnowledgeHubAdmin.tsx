import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Loader2, Upload, X, Book, FileText, Download, Grape } from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  content: string | null;
  read_time: string;
  category: string;
  is_published: boolean;
}

interface PdfResource {
  id: string;
  title: string;
  description: string;
  file_url: string | null;
  pages: number | null;
  file_size: string | null;
  is_published: boolean;
}

interface HarvestReport {
  id: string;
  year: number;
  region: string;
  summary: string;
  highlights: string[];
  is_published: boolean;
}

export const KnowledgeHubAdmin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('glossary');
  const [loading, setLoading] = useState(true);
  
  // Glossary state
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([]);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '' });
  const [isAddingTerm, setIsAddingTerm] = useState(false);
  
  // Guides state
  const [guides, setGuides] = useState<Guide[]>([]);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [newGuide, setNewGuide] = useState<Omit<Guide, 'id'>>({
    title: '', description: '', content: '', read_time: '5 min read', category: 'Beginner', is_published: false
  });
  const [isAddingGuide, setIsAddingGuide] = useState(false);
  
  // PDF state
  const [pdfResources, setPdfResources] = useState<PdfResource[]>([]);
  const [editingPdf, setEditingPdf] = useState<PdfResource | null>(null);
  const [newPdf, setNewPdf] = useState<Omit<PdfResource, 'id'>>({
    title: '', description: '', file_url: null, pages: null, file_size: null, is_published: false
  });
  const [isAddingPdf, setIsAddingPdf] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  // Harvest reports state
  const [harvestReports, setHarvestReports] = useState<HarvestReport[]>([]);
  const [editingReport, setEditingReport] = useState<HarvestReport | null>(null);
  const [newReport, setNewReport] = useState<Omit<HarvestReport, 'id'>>({
    year: new Date().getFullYear(), region: '', summary: '', highlights: [], is_published: false
  });
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [highlightInput, setHighlightInput] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchGlossary(), fetchGuides(), fetchPdfs(), fetchReports()]);
    setLoading(false);
  };

  const fetchGlossary = async () => {
    const { data, error } = await supabase.from('glossary_terms').select('*').order('term');
    if (!error) setGlossaryTerms(data || []);
  };

  const fetchGuides = async () => {
    const { data, error } = await supabase.from('guides').select('*').order('created_at', { ascending: false });
    if (!error) setGuides(data || []);
  };

  const fetchPdfs = async () => {
    const { data, error } = await supabase.from('pdf_resources').select('*').order('created_at', { ascending: false });
    if (!error) setPdfResources(data || []);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase.from('harvest_reports').select('*').order('year', { ascending: false });
    if (!error) setHarvestReports(data || []);
  };

  // Glossary handlers
  const handleSaveTerm = async () => {
    if (!newTerm.term || !newTerm.definition) {
      toast({ title: 'Hata', description: 'Terim ve tanım gerekli', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('glossary_terms').insert(newTerm);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Terim eklendi' });
      setNewTerm({ term: '', definition: '' });
      setIsAddingTerm(false);
      fetchGlossary();
    }
    setSaving(false);
  };

  const handleUpdateTerm = async () => {
    if (!editingTerm) return;
    setSaving(true);
    const { error } = await supabase.from('glossary_terms')
      .update({ term: editingTerm.term, definition: editingTerm.definition })
      .eq('id', editingTerm.id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Terim güncellendi' });
      setEditingTerm(null);
      fetchGlossary();
    }
    setSaving(false);
  };

  const handleDeleteTerm = async (id: string) => {
    if (!confirm('Bu terimi silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('glossary_terms').delete().eq('id', id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Terim silindi' });
      fetchGlossary();
    }
  };

  // Guide handlers
  const handleSaveGuide = async () => {
    if (!newGuide.title || !newGuide.description) {
      toast({ title: 'Hata', description: 'Başlık ve açıklama gerekli', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('guides').insert(newGuide);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Rehber eklendi' });
      setNewGuide({ title: '', description: '', content: '', read_time: '5 min read', category: 'Beginner', is_published: false });
      setIsAddingGuide(false);
      fetchGuides();
    }
    setSaving(false);
  };

  const handleUpdateGuide = async () => {
    if (!editingGuide) return;
    setSaving(true);
    const { error } = await supabase.from('guides')
      .update({
        title: editingGuide.title,
        description: editingGuide.description,
        content: editingGuide.content,
        read_time: editingGuide.read_time,
        category: editingGuide.category,
        is_published: editingGuide.is_published
      })
      .eq('id', editingGuide.id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Rehber güncellendi' });
      setEditingGuide(null);
      fetchGuides();
    }
    setSaving(false);
  };

  const handleDeleteGuide = async (id: string) => {
    if (!confirm('Bu rehberi silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('guides').delete().eq('id', id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Rehber silindi' });
      fetchGuides();
    }
  };

  // PDF handlers
  const handlePdfUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pdf: Omit<PdfResource, 'id'> | PdfResource,
    setPdf: (pdf: any) => void
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    if (file.type !== 'application/pdf') {
      toast({ title: 'Geçersiz dosya', description: 'Sadece PDF dosyası yükleyebilirsiniz', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Dosya çok büyük', description: 'PDF 20MB\'dan küçük olmalı', variant: 'destructive' });
      return;
    }

    setUploadingPdf(true);
    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage
        .from('knowledge-hub')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('knowledge-hub')
        .getPublicUrl(fileName);

      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setPdf({ ...pdf, file_url: publicUrl, file_size: `${fileSizeMB} MB` });
      toast({ title: 'Başarılı', description: 'PDF yüklendi' });
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSavePdf = async () => {
    if (!newPdf.title || !newPdf.description) {
      toast({ title: 'Hata', description: 'Başlık ve açıklama gerekli', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('pdf_resources').insert(newPdf);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'PDF kaynağı eklendi' });
      setNewPdf({ title: '', description: '', file_url: null, pages: null, file_size: null, is_published: false });
      setIsAddingPdf(false);
      fetchPdfs();
    }
    setSaving(false);
  };

  const handleUpdatePdf = async () => {
    if (!editingPdf) return;
    setSaving(true);
    const { error } = await supabase.from('pdf_resources')
      .update({
        title: editingPdf.title,
        description: editingPdf.description,
        file_url: editingPdf.file_url,
        pages: editingPdf.pages,
        file_size: editingPdf.file_size,
        is_published: editingPdf.is_published
      })
      .eq('id', editingPdf.id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'PDF güncellendi' });
      setEditingPdf(null);
      fetchPdfs();
    }
    setSaving(false);
  };

  const handleDeletePdf = async (id: string) => {
    if (!confirm('Bu PDF\'i silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('pdf_resources').delete().eq('id', id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'PDF silindi' });
      fetchPdfs();
    }
  };

  // Harvest report handlers
  const addHighlight = (report: any, setReport: any) => {
    if (!highlightInput.trim()) return;
    setReport({ ...report, highlights: [...report.highlights, highlightInput.trim()] });
    setHighlightInput('');
  };

  const removeHighlight = (report: any, setReport: any, index: number) => {
    setReport({ ...report, highlights: report.highlights.filter((_: any, i: number) => i !== index) });
  };

  const handleSaveReport = async () => {
    if (!newReport.region || !newReport.summary) {
      toast({ title: 'Hata', description: 'Bölge ve özet gerekli', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('harvest_reports').insert(newReport);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Hasat raporu eklendi' });
      setNewReport({ year: new Date().getFullYear(), region: '', summary: '', highlights: [], is_published: false });
      setIsAddingReport(false);
      fetchReports();
    }
    setSaving(false);
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;
    setSaving(true);
    const { error } = await supabase.from('harvest_reports')
      .update({
        year: editingReport.year,
        region: editingReport.region,
        summary: editingReport.summary,
        highlights: editingReport.highlights,
        is_published: editingReport.is_published
      })
      .eq('id', editingReport.id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Rapor güncellendi' });
      setEditingReport(null);
      fetchReports();
    }
    setSaving(false);
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return;
    const { error } = await supabase.from('harvest_reports').delete().eq('id', id);
    if (error) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Başarılı', description: 'Rapor silindi' });
      fetchReports();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Sözlük</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Rehberler</span>
          </TabsTrigger>
          <TabsTrigger value="pdfs" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="harvest" className="flex items-center gap-2">
            <Grape className="h-4 w-4" />
            <span className="hidden sm:inline">Hasat</span>
          </TabsTrigger>
        </TabsList>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-4">
          {!isAddingTerm && !editingTerm && (
            <Button onClick={() => setIsAddingTerm(true)}>
              <Plus className="h-4 w-4 mr-2" /> Yeni Terim Ekle
            </Button>
          )}

          {(isAddingTerm || editingTerm) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{isAddingTerm ? 'Yeni Terim' : 'Terimi Düzenle'}</h3>
              <Input
                placeholder="Terim"
                value={isAddingTerm ? newTerm.term : editingTerm?.term || ''}
                onChange={(e) => isAddingTerm 
                  ? setNewTerm({ ...newTerm, term: e.target.value })
                  : setEditingTerm(editingTerm ? { ...editingTerm, term: e.target.value } : null)
                }
              />
              <Textarea
                placeholder="Tanım"
                rows={3}
                value={isAddingTerm ? newTerm.definition : editingTerm?.definition || ''}
                onChange={(e) => isAddingTerm
                  ? setNewTerm({ ...newTerm, definition: e.target.value })
                  : setEditingTerm(editingTerm ? { ...editingTerm, definition: e.target.value } : null)
                }
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setIsAddingTerm(false); setEditingTerm(null); }}>İptal</Button>
                <Button onClick={isAddingTerm ? handleSaveTerm : handleUpdateTerm} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}

          {!isAddingTerm && !editingTerm && (
            <div className="space-y-2">
              {glossaryTerms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz terim eklenmemiş</p>
              ) : (
                glossaryTerms.map((term) => (
                  <div key={term.id} className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{term.term}</h4>
                      <p className="text-sm text-muted-foreground">{term.definition}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="outline" onClick={() => setEditingTerm(term)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-destructive" onClick={() => handleDeleteTerm(term.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          {!isAddingGuide && !editingGuide && (
            <Button onClick={() => setIsAddingGuide(true)}>
              <Plus className="h-4 w-4 mr-2" /> Yeni Rehber Ekle
            </Button>
          )}

          {(isAddingGuide || editingGuide) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{isAddingGuide ? 'Yeni Rehber' : 'Rehberi Düzenle'}</h3>
              <Input
                placeholder="Başlık"
                value={isAddingGuide ? newGuide.title : editingGuide?.title || ''}
                onChange={(e) => isAddingGuide
                  ? setNewGuide({ ...newGuide, title: e.target.value })
                  : setEditingGuide(editingGuide ? { ...editingGuide, title: e.target.value } : null)
                }
              />
              <Textarea
                placeholder="Kısa açıklama"
                rows={2}
                value={isAddingGuide ? newGuide.description : editingGuide?.description || ''}
                onChange={(e) => isAddingGuide
                  ? setNewGuide({ ...newGuide, description: e.target.value })
                  : setEditingGuide(editingGuide ? { ...editingGuide, description: e.target.value } : null)
                }
              />
              <Textarea
                placeholder="İçerik (opsiyonel)"
                rows={6}
                value={isAddingGuide ? newGuide.content || '' : editingGuide?.content || ''}
                onChange={(e) => isAddingGuide
                  ? setNewGuide({ ...newGuide, content: e.target.value })
                  : setEditingGuide(editingGuide ? { ...editingGuide, content: e.target.value } : null)
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Okuma Süresi</label>
                  <Input
                    placeholder="5 min read"
                    value={isAddingGuide ? newGuide.read_time : editingGuide?.read_time || ''}
                    onChange={(e) => isAddingGuide
                      ? setNewGuide({ ...newGuide, read_time: e.target.value })
                      : setEditingGuide(editingGuide ? { ...editingGuide, read_time: e.target.value } : null)
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Kategori</label>
                  <Select
                    value={isAddingGuide ? newGuide.category : editingGuide?.category || 'Beginner'}
                    onValueChange={(value) => isAddingGuide
                      ? setNewGuide({ ...newGuide, category: value })
                      : setEditingGuide(editingGuide ? { ...editingGuide, category: value } : null)
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Başlangıç</SelectItem>
                      <SelectItem value="Intermediate">Orta</SelectItem>
                      <SelectItem value="Advanced">İleri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAddingGuide ? newGuide.is_published : editingGuide?.is_published || false}
                  onChange={(e) => isAddingGuide
                    ? setNewGuide({ ...newGuide, is_published: e.target.checked })
                    : setEditingGuide(editingGuide ? { ...editingGuide, is_published: e.target.checked } : null)
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Yayınla</span>
              </label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setIsAddingGuide(false); setEditingGuide(null); }}>İptal</Button>
                <Button onClick={isAddingGuide ? handleSaveGuide : handleUpdateGuide} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}

          {!isAddingGuide && !editingGuide && (
            <div className="space-y-2">
              {guides.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz rehber eklenmemiş</p>
              ) : (
                guides.map((guide) => (
                  <div key={guide.id} className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{guide.title}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${guide.is_published ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {guide.is_published ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{guide.category} • {guide.read_time}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="outline" onClick={() => setEditingGuide(guide)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-destructive" onClick={() => handleDeleteGuide(guide.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* PDFs Tab */}
        <TabsContent value="pdfs" className="space-y-4">
          {!isAddingPdf && !editingPdf && (
            <Button onClick={() => setIsAddingPdf(true)}>
              <Plus className="h-4 w-4 mr-2" /> Yeni PDF Ekle
            </Button>
          )}

          {(isAddingPdf || editingPdf) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{isAddingPdf ? 'Yeni PDF' : 'PDF Düzenle'}</h3>
              <Input
                placeholder="Başlık"
                value={isAddingPdf ? newPdf.title : editingPdf?.title || ''}
                onChange={(e) => isAddingPdf
                  ? setNewPdf({ ...newPdf, title: e.target.value })
                  : setEditingPdf(editingPdf ? { ...editingPdf, title: e.target.value } : null)
                }
              />
              <Textarea
                placeholder="Açıklama"
                rows={2}
                value={isAddingPdf ? newPdf.description : editingPdf?.description || ''}
                onChange={(e) => isAddingPdf
                  ? setNewPdf({ ...newPdf, description: e.target.value })
                  : setEditingPdf(editingPdf ? { ...editingPdf, description: e.target.value } : null)
                }
              />
              
              {/* PDF Upload */}
              <div>
                <label className="text-sm font-medium mb-1 block">PDF Dosyası</label>
                {(isAddingPdf ? newPdf.file_url : editingPdf?.file_url) ? (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">PDF yüklendi</p>
                      <p className="text-xs text-muted-foreground">{isAddingPdf ? newPdf.file_size : editingPdf?.file_size}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => isAddingPdf
                        ? setNewPdf({ ...newPdf, file_url: null, file_size: null })
                        : setEditingPdf(editingPdf ? { ...editingPdf, file_url: null, file_size: null } : null)
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handlePdfUpload(
                        e,
                        isAddingPdf ? newPdf : editingPdf!,
                        isAddingPdf ? setNewPdf : setEditingPdf
                      )}
                      disabled={uploadingPdf}
                    />
                    {uploadingPdf && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sayfa Sayısı</label>
                  <Input
                    type="number"
                    placeholder="24"
                    value={(isAddingPdf ? newPdf.pages : editingPdf?.pages) || ''}
                    onChange={(e) => {
                      const pages = e.target.value ? parseInt(e.target.value) : null;
                      isAddingPdf
                        ? setNewPdf({ ...newPdf, pages })
                        : setEditingPdf(editingPdf ? { ...editingPdf, pages } : null);
                    }}
                  />
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAddingPdf ? newPdf.is_published : editingPdf?.is_published || false}
                  onChange={(e) => isAddingPdf
                    ? setNewPdf({ ...newPdf, is_published: e.target.checked })
                    : setEditingPdf(editingPdf ? { ...editingPdf, is_published: e.target.checked } : null)
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Yayınla</span>
              </label>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setIsAddingPdf(false); setEditingPdf(null); }}>İptal</Button>
                <Button onClick={isAddingPdf ? handleSavePdf : handleUpdatePdf} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}

          {!isAddingPdf && !editingPdf && (
            <div className="space-y-2">
              {pdfResources.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz PDF eklenmemiş</p>
              ) : (
                pdfResources.map((pdf) => (
                  <div key={pdf.id} className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{pdf.title}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${pdf.is_published ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                            {pdf.is_published ? 'Yayında' : 'Taslak'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{pdf.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {pdf.pages && `${pdf.pages} sayfa`} {pdf.file_size && `• ${pdf.file_size}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="outline" onClick={() => setEditingPdf(pdf)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-destructive" onClick={() => handleDeletePdf(pdf.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        {/* Harvest Reports Tab */}
        <TabsContent value="harvest" className="space-y-4">
          {!isAddingReport && !editingReport && (
            <Button onClick={() => setIsAddingReport(true)}>
              <Plus className="h-4 w-4 mr-2" /> Yeni Hasat Raporu Ekle
            </Button>
          )}

          {(isAddingReport || editingReport) && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-foreground">{isAddingReport ? 'Yeni Hasat Raporu' : 'Raporu Düzenle'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Yıl</label>
                  <Input
                    type="number"
                    value={isAddingReport ? newReport.year : editingReport?.year || new Date().getFullYear()}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      isAddingReport
                        ? setNewReport({ ...newReport, year })
                        : setEditingReport(editingReport ? { ...editingReport, year } : null);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Bölge</label>
                  <Input
                    placeholder="Loire Valley, France"
                    value={isAddingReport ? newReport.region : editingReport?.region || ''}
                    onChange={(e) => isAddingReport
                      ? setNewReport({ ...newReport, region: e.target.value })
                      : setEditingReport(editingReport ? { ...editingReport, region: e.target.value } : null)
                    }
                  />
                </div>
              </div>
              <Textarea
                placeholder="Hasat özeti"
                rows={3}
                value={isAddingReport ? newReport.summary : editingReport?.summary || ''}
                onChange={(e) => isAddingReport
                  ? setNewReport({ ...newReport, summary: e.target.value })
                  : setEditingReport(editingReport ? { ...editingReport, summary: e.target.value } : null)
                }
              />
              
              {/* Highlights */}
              <div>
                <label className="text-sm font-medium mb-1 block">Öne Çıkanlar</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Öne çıkan ekle"
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHighlight(
                          isAddingReport ? newReport : editingReport,
                          isAddingReport ? setNewReport : setEditingReport
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addHighlight(
                      isAddingReport ? newReport : editingReport,
                      isAddingReport ? setNewReport : setEditingReport
                    )}
                  >
                    Ekle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isAddingReport ? newReport.highlights : editingReport?.highlights || []).map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm">
                      {h}
                      <button
                        type="button"
                        onClick={() => removeHighlight(
                          isAddingReport ? newReport : editingReport,
                          isAddingReport ? setNewReport : setEditingReport,
                          i
                        )}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAddingReport ? newReport.is_published : editingReport?.is_published || false}
                  onChange={(e) => isAddingReport
                    ? setNewReport({ ...newReport, is_published: e.target.checked })
                    : setEditingReport(editingReport ? { ...editingReport, is_published: e.target.checked } : null)
                  }
                  className="rounded border-border"
                />
                <span className="text-sm">Yayınla</span>
              </label>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setIsAddingReport(false); setEditingReport(null); }}>İptal</Button>
                <Button onClick={isAddingReport ? handleSaveReport : handleUpdateReport} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
                </Button>
              </div>
            </div>
          )}

          {!isAddingReport && !editingReport && (
            <div className="space-y-2">
              {harvestReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz hasat raporu eklenmemiş</p>
              ) : (
                harvestReports.map((report) => (
                  <div key={report.id} className="flex items-start justify-between p-4 bg-card border border-border rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary">{report.year}</span>
                        <h4 className="font-semibold text-foreground">{report.region}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${report.is_published ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {report.is_published ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{report.summary}</p>
                      {report.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {report.highlights.map((h, i) => (
                            <span key={i} className="px-2 py-0.5 bg-muted text-xs rounded-full text-muted-foreground">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="icon" variant="outline" onClick={() => setEditingReport(report)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-destructive" onClick={() => handleDeleteReport(report.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
