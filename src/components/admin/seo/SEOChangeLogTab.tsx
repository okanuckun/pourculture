import React, { useState } from 'react';
import { useSEOChangeLog } from '@/hooks/useSEOSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RotateCcw, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const SEOChangeLogTab: React.FC = () => {
  const { logs, loading, revertChange } = useSEOChangeLog();
  const [searchQuery, setSearchQuery] = useState('');
  const [reverting, setReverting] = useState<string | null>(null);

  const filteredLogs = logs.filter(log =>
    log.page_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.field_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRevert = async (logId: string) => {
    setReverting(logId);
    await revertChange(logId);
    setReverting(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Change History</h3>
          <p className="text-sm text-muted-foreground">
            Track all SEO setting changes with rollback capability
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by page or field..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className={log.is_reverted ? 'opacity-50' : ''}>
                  <TableCell className="text-sm">
                    <div>{format(new Date(log.changed_at), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.changed_at), 'HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 rounded">{log.page_path}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.field_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-600 line-through max-w-[100px] truncate">
                        {log.old_value || '(empty)'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-green-600 max-w-[100px] truncate">
                        {log.new_value || '(empty)'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.is_reverted ? (
                      <Badge variant="secondary">Reverted</Badge>
                    ) : (
                      <Badge variant="default">{log.change_type}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!log.is_reverted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevert(log.id)}
                        disabled={reverting === log.id}
                      >
                        {reverting === log.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? 'No matching changes found' : 'No changes recorded yet'}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} changes
      </p>
    </div>
  );
};
