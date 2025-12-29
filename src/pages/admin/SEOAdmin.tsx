import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { SEOHead } from '@/components/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { SEOPagesManager } from '@/components/admin/seo/SEOPagesManager';
import { SEOGlobalSettingsTab } from '@/components/admin/seo/SEOGlobalSettingsTab';
import { SEORedirectsTab } from '@/components/admin/seo/SEORedirectsTab';
import { SEOAuditTab } from '@/components/admin/seo/SEOAuditTab';
import { SEOChangeLogTab } from '@/components/admin/seo/SEOChangeLogTab';

const SEOAdmin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pages');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data } = await supabase.rpc('check_is_admin');
      if (!data) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <BrutalistLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </BrutalistLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <BrutalistLayout>
      <SEOHead
        title="SEO Admin Panel"
        description="Manage SEO settings for all pages"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">SEO CONTROL CENTER</h1>
          <p className="text-muted-foreground mt-2">
            Manage metadata, indexing, schemas, and run site audits
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-[600px]">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="redirects">Redirects</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <SEOPagesManager />
          </TabsContent>

          <TabsContent value="global">
            <SEOGlobalSettingsTab />
          </TabsContent>

          <TabsContent value="redirects">
            <SEORedirectsTab />
          </TabsContent>

          <TabsContent value="audit">
            <SEOAuditTab />
          </TabsContent>

          <TabsContent value="logs">
            <SEOChangeLogTab />
          </TabsContent>
        </Tabs>
      </div>
    </BrutalistLayout>
  );
};

export default SEOAdmin;
