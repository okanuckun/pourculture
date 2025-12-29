import React, { useState } from 'react';
import { useSEORedirects } from '@/hooks/useSEOSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Edit, ArrowRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SEORedirectsTab: React.FC = () => {
  const { redirects, loading, createRedirect, updateRedirect, deleteRedirect } = useSEORedirects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    source_path: '',
    target_path: '',
    redirect_type: 301,
    is_active: true,
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.source_path || !formData.target_path) {
      toast({ title: 'Error', description: 'Both paths are required', variant: 'destructive' });
      return;
    }

    if (formData.source_path === formData.target_path) {
      toast({ title: 'Error', description: 'Source and target cannot be the same', variant: 'destructive' });
      return;
    }

    if (editingId) {
      await updateRedirect(editingId, formData);
    } else {
      await createRedirect(formData);
    }

    setFormData({ source_path: '', target_path: '', redirect_type: 301, is_active: true });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (redirect: any) => {
    setFormData({
      source_path: redirect.source_path,
      target_path: redirect.target_path,
      redirect_type: redirect.redirect_type,
      is_active: redirect.is_active,
    });
    setEditingId(redirect.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this redirect?')) {
      await deleteRedirect(id);
    }
  };

  // Detect redirect chains
  const findChains = () => {
    const chains: { source: string; chain: string[] }[] = [];
    
    for (const r of redirects) {
      const chainedRedirect = redirects.find(r2 => r2.source_path === r.target_path);
      if (chainedRedirect) {
        chains.push({
          source: r.source_path,
          chain: [r.target_path, chainedRedirect.target_path],
        });
      }
    }
    
    return chains;
  };

  const chains = findChains();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">URL Redirects</h3>
          <p className="text-sm text-muted-foreground">
            Manage 301/302 redirects for moved or deleted pages
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({ source_path: '', target_path: '', redirect_type: 301, is_active: true });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Redirect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Add'} Redirect</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Source Path</Label>
                <Input
                  value={formData.source_path}
                  onChange={(e) => setFormData({ ...formData, source_path: e.target.value })}
                  placeholder="/old-page"
                />
              </div>

              <div className="space-y-2">
                <Label>Target Path</Label>
                <Input
                  value={formData.target_path}
                  onChange={(e) => setFormData({ ...formData, target_path: e.target.value })}
                  placeholder="/new-page"
                />
              </div>

              <div className="space-y-2">
                <Label>Redirect Type</Label>
                <Select
                  value={formData.redirect_type.toString()}
                  onValueChange={(value) => setFormData({ ...formData, redirect_type: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="301">301 (Permanent)</SelectItem>
                    <SelectItem value="302">302 (Temporary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingId ? 'Update' : 'Create'} Redirect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {chains.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              Redirect Chains Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {chains.map((chain, i) => (
              <div key={i} className="text-sm flex items-center gap-2">
                <code className="bg-muted px-1 rounded">{chain.source}</code>
                <ArrowRight className="w-3 h-3" />
                {chain.chain.map((path, j) => (
                  <React.Fragment key={j}>
                    <code className="bg-muted px-1 rounded">{path}</code>
                    {j < chain.chain.length - 1 && <ArrowRight className="w-3 h-3" />}
                  </React.Fragment>
                ))}
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Consider collapsing these chains into direct redirects for better SEO.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead></TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[80px]">Hits</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-sm">{redirect.source_path}</TableCell>
                  <TableCell>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{redirect.target_path}</TableCell>
                  <TableCell>
                    <Badge variant={redirect.redirect_type === 301 ? 'default' : 'secondary'}>
                      {redirect.redirect_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={redirect.is_active ? 'default' : 'outline'}>
                      {redirect.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{redirect.hit_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(redirect)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(redirect.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {redirects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No redirects configured yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
