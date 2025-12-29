import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SEOPageSettings {
  id: string;
  page_path: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  robots_meta: string;
  canonical_mode: string;
  canonical_url: string | null;
  include_in_sitemap: boolean;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card_type: string | null;
  twitter_image: string | null;
  schema_data: any;
  is_published: boolean;
  status_code: number | null;
  h1_text: string | null;
  word_count: number | null;
  seo_score: number | null;
  created_at: string;
  updated_at: string;
}

interface SEOGlobalSettings {
  id: string;
  title_template: string;
  description_template: string | null;
  default_og_image: string | null;
  default_robots_meta: string;
  robots_txt_content: string;
  sitemap_include_rules: any;
  created_at: string;
  updated_at: string;
}

interface SEORedirect {
  id: string;
  source_path: string;
  target_path: string;
  redirect_type: number;
  is_active: boolean;
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SEOChangeLog {
  id: string;
  page_path: string;
  change_type: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  changed_at: string;
  is_reverted: boolean;
  reverted_at: string | null;
  reverted_by: string | null;
}

interface SEOAuditIssue {
  id: string;
  page_path: string;
  issue_type: string;
  severity: string;
  description: string;
  suggestion: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export function useSEOPageSettings() {
  const [settings, setSettings] = useState<SEOPageSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_page_settings')
      .select('*')
      .order('page_path');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSettings(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const upsertSettings = async (pageSettings: Partial<SEOPageSettings> & { page_path: string }) => {
    const user = (await supabase.auth.getUser()).data.user;
    
    const { data, error } = await supabase
      .from('seo_page_settings')
      .upsert({ 
        ...pageSettings, 
        updated_by: user?.id 
      }, { onConflict: 'page_path' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
      return null;
    }
    
    toast({ title: 'Settings saved', description: 'SEO settings updated successfully' });
    await fetchSettings();
    return data;
  };

  const deleteSettings = async (pagePath: string) => {
    const { error } = await supabase
      .from('seo_page_settings')
      .delete()
      .eq('page_path', pagePath);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchSettings();
    return true;
  };

  return { settings, loading, fetchSettings, upsertSettings, deleteSettings };
}

export function useSEOGlobalSettings() {
  const [settings, setSettings] = useState<SEOGlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_global_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSettings(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<SEOGlobalSettings>) => {
    if (!settings?.id) return null;
    
    const { data, error } = await supabase
      .from('seo_global_settings')
      .update(newSettings)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    toast({ title: 'Global settings saved' });
    setSettings(data);
    return data;
  };

  return { settings, loading, fetchSettings, updateSettings };
}

export function useSEORedirects() {
  const [redirects, setRedirects] = useState<SEORedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRedirects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_redirects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setRedirects(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  const createRedirect = async (redirect: Omit<SEORedirect, 'id' | 'created_at' | 'updated_at' | 'hit_count' | 'last_hit_at'>) => {
    const user = (await supabase.auth.getUser()).data.user;
    
    const { data, error } = await supabase
      .from('seo_redirects')
      .insert({ ...redirect, created_by: user?.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating redirect', description: error.message, variant: 'destructive' });
      return null;
    }
    
    toast({ title: 'Redirect created' });
    await fetchRedirects();
    return data;
  };

  const updateRedirect = async (id: string, updates: Partial<SEORedirect>) => {
    const { data, error } = await supabase
      .from('seo_redirects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
    
    await fetchRedirects();
    return data;
  };

  const deleteRedirect = async (id: string) => {
    const { error } = await supabase
      .from('seo_redirects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchRedirects();
    return true;
  };

  return { redirects, loading, fetchRedirects, createRedirect, updateRedirect, deleteRedirect };
}

export function useSEOChangeLog(pagePath?: string) {
  const [logs, setLogs] = useState<SEOChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('seo_change_log')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(100);

    if (pagePath) {
      query = query.eq('page_path', pagePath);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, [pagePath, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logChange = async (change: Omit<SEOChangeLog, 'id' | 'changed_at' | 'is_reverted' | 'reverted_at' | 'reverted_by'>) => {
    const { error } = await supabase
      .from('seo_change_log')
      .insert(change);

    if (error) {
      console.error('Error logging change:', error);
    }
  };

  const revertChange = async (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return false;

    const user = (await supabase.auth.getUser()).data.user;
    
    // Revert the change
    const { error: updateError } = await supabase
      .from('seo_page_settings')
      .update({ [log.field_name]: log.old_value })
      .eq('page_path', log.page_path);

    if (updateError) {
      toast({ title: 'Error reverting', description: updateError.message, variant: 'destructive' });
      return false;
    }

    // Mark as reverted
    await supabase
      .from('seo_change_log')
      .update({ 
        is_reverted: true, 
        reverted_at: new Date().toISOString(),
        reverted_by: user?.id 
      })
      .eq('id', logId);

    toast({ title: 'Change reverted' });
    await fetchLogs();
    return true;
  };

  return { logs, loading, fetchLogs, logChange, revertChange };
}

export function useSEOAuditIssues() {
  const [issues, setIssues] = useState<SEOAuditIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_audit_issues')
      .select('*')
      .order('severity')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setIssues(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const createIssue = async (issue: Omit<SEOAuditIssue, 'id' | 'created_at' | 'updated_at' | 'is_resolved' | 'resolved_at' | 'resolved_by'>) => {
    const { error } = await supabase
      .from('seo_audit_issues')
      .insert(issue);

    if (error) {
      console.error('Error creating issue:', error);
      return false;
    }
    
    await fetchIssues();
    return true;
  };

  const resolveIssue = async (issueId: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    
    const { error } = await supabase
      .from('seo_audit_issues')
      .update({ 
        is_resolved: true, 
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id 
      })
      .eq('id', issueId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    toast({ title: 'Issue marked as resolved' });
    await fetchIssues();
    return true;
  };

  const clearAllIssues = async () => {
    const { error } = await supabase
      .from('seo_audit_issues')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    
    await fetchIssues();
    return true;
  };

  return { issues, loading, fetchIssues, createIssue, resolveIssue, clearAllIssues };
}
