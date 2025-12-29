import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSEOPageSettings, useSEOAuditIssues } from '@/hooks/useSEOSettings';
import { issueTypes, severityColors } from '@/lib/seo-routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, Trash2, CheckCircle, AlertCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SEOAuditTab: React.FC = () => {
  const { settings } = useSEOPageSettings();
  const { issues, loading: issuesLoading, createIssue, resolveIssue, clearAllIssues, fetchIssues } = useSEOAuditIssues();
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runAudit = async () => {
    setRunning(true);
    setProgress(0);

    // Clear previous issues
    await clearAllIssues();

    const totalChecks = settings.length * 5; // 5 checks per page
    let completedChecks = 0;
    const newIssues: Array<{ page_path: string; issue_type: string; severity: string; description: string; suggestion: string }> = [];

    for (const page of settings) {
      // Check meta title
      if (!page.meta_title) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'missing_title',
          severity: 'critical',
          description: 'Missing meta title tag',
          suggestion: 'Add a descriptive title between 30-60 characters',
        });
      } else if (page.meta_title.length > 60) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'title_too_long',
          severity: 'medium',
          description: `Title is ${page.meta_title.length} characters (max 60)`,
          suggestion: 'Shorten the title to prevent truncation in search results',
        });
      } else if (page.meta_title.length < 30) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'title_too_short',
          severity: 'medium',
          description: `Title is only ${page.meta_title.length} characters`,
          suggestion: 'Add more descriptive text to improve click-through rate',
        });
      }
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);

      // Check meta description
      if (!page.meta_description) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'missing_description',
          severity: 'high',
          description: 'Missing meta description',
          suggestion: 'Add a compelling description between 70-160 characters',
        });
      } else if (page.meta_description.length > 160) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'description_too_long',
          severity: 'medium',
          description: `Description is ${page.meta_description.length} characters (max 160)`,
          suggestion: 'Shorten description to prevent truncation',
        });
      }
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);

      // Check H1
      if (!page.h1_text) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'missing_h1',
          severity: 'high',
          description: 'No H1 tag detected',
          suggestion: 'Add a single H1 heading to define the page topic',
        });
      }
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);

      // Check OG image
      if (!page.og_image) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'missing_og_image',
          severity: 'low',
          description: 'No Open Graph image set',
          suggestion: 'Add an OG image for better social media sharing',
        });
      }
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);

      // Check schema
      if (!page.schema_data || (Array.isArray(page.schema_data) && page.schema_data.length === 0)) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'missing_schema',
          severity: 'low',
          description: 'No structured data markup',
          suggestion: 'Add JSON-LD schema to help search engines understand your content',
        });
      }
      completedChecks++;
      setProgress((completedChecks / totalChecks) * 100);

      // Check thin content
      if (page.word_count && page.word_count < 300) {
        newIssues.push({
          page_path: page.page_path,
          issue_type: 'thin_content',
          severity: 'medium',
          description: `Only ${page.word_count} words on page`,
          suggestion: 'Add more valuable content to improve rankings (aim for 300+ words)',
        });
      }
    }

    // Check for duplicate titles
    const titles = settings.filter(s => s.meta_title).map(s => ({ path: s.page_path, title: s.meta_title }));
    const titleCounts = titles.reduce((acc, { path, title }) => {
      if (!acc[title!]) acc[title!] = [];
      acc[title!].push(path);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [title, paths] of Object.entries(titleCounts)) {
      if (paths.length > 1) {
        for (const path of paths) {
          newIssues.push({
            page_path: path,
            issue_type: 'duplicate_title',
            severity: 'high',
            description: `Duplicate title found on ${paths.length} pages`,
            suggestion: 'Each page should have a unique title',
          });
        }
      }
    }

    // Save issues
    for (const issue of newIssues) {
      await createIssue(issue);
    }

    await fetchIssues();
    setRunning(false);
    setProgress(100);
    toast({
      title: 'Audit Complete',
      description: `Found ${newIssues.length} issues across ${settings.length} pages`,
    });
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) acc[issue.severity] = [];
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, typeof issues>);

  const unresolvedIssues = issues.filter(i => !i.is_resolved);
  const issuesByType = unresolvedIssues.reduce((acc, issue) => {
    if (!acc[issue.issue_type]) acc[issue.issue_type] = 0;
    acc[issue.issue_type]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Audit</CardTitle>
              <CardDescription>
                Scan your site for common SEO issues
              </CardDescription>
            </div>
            <Button onClick={runAudit} disabled={running}>
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Audit
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {running && (
          <CardContent>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Checking {settings.length} pages...
            </p>
          </CardContent>
        )}
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{groupedIssues['critical']?.filter(i => !i.is_resolved).length || 0}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{groupedIssues['high']?.filter(i => !i.is_resolved).length || 0}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{groupedIssues['medium']?.filter(i => !i.is_resolved).length || 0}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{groupedIssues['low']?.filter(i => !i.is_resolved).length || 0}</p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues by Type */}
      {Object.keys(issuesByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(issuesByType).map(([type, count]) => {
                const issueType = issueTypes.find(t => t.value === type);
                return (
                  <Badge key={type} variant="outline">
                    {issueType?.label || type} ({count})
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({unresolvedIssues.length})</TabsTrigger>
          <TabsTrigger value="critical">Critical ({groupedIssues['critical']?.filter(i => !i.is_resolved).length || 0})</TabsTrigger>
          <TabsTrigger value="high">High ({groupedIssues['high']?.filter(i => !i.is_resolved).length || 0})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({issues.filter(i => i.is_resolved).length})</TabsTrigger>
        </TabsList>

        {['all', 'critical', 'high', 'resolved'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-2">
            {(tab === 'resolved' 
              ? issues.filter(i => i.is_resolved)
              : tab === 'all'
                ? unresolvedIssues
                : groupedIssues[tab]?.filter(i => !i.is_resolved) || []
            ).map((issue) => (
              <Card key={issue.id} className={issue.is_resolved ? 'opacity-60' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(issue.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{issue.description}</span>
                          <Badge variant="outline" className="text-xs">
                            {issueTypes.find(t => t.value === issue.issue_type)?.label || issue.issue_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <code className="bg-muted px-1 rounded">{issue.page_path}</code>
                        </p>
                        {issue.suggestion && (
                          <p className="text-sm text-blue-600 mt-2">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!issue.is_resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveIssue(issue.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {((tab === 'resolved' ? issues.filter(i => i.is_resolved) : 
               tab === 'all' ? unresolvedIssues :
               groupedIssues[tab]?.filter(i => !i.is_resolved) || []).length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                {tab === 'resolved' ? 'No resolved issues yet' : 'No issues found'}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
