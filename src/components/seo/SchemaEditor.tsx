import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { schemaTypes } from '@/lib/seo-routes';

interface SchemaEditorProps {
  schemaData: any[];
  onChange: (schemas: any[]) => void;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = ({ schemaData, onChange }) => {
  const [rawJson, setRawJson] = useState(JSON.stringify(schemaData, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('visual');

  const handleRawJsonChange = (value: string) => {
    setRawJson(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onChange(Array.isArray(parsed) ? parsed : [parsed]);
    } catch (e) {
      setJsonError('Invalid JSON syntax');
    }
  };

  const addSchema = (type: string) => {
    const newSchema = createDefaultSchema(type);
    onChange([...schemaData, newSchema]);
    setRawJson(JSON.stringify([...schemaData, newSchema], null, 2));
  };

  const removeSchema = (index: number) => {
    const updated = schemaData.filter((_, i) => i !== index);
    onChange(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  const updateSchema = (index: number, schema: any) => {
    const updated = [...schemaData];
    updated[index] = schema;
    onChange(updated);
    setRawJson(JSON.stringify(updated, null, 2));
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select onValueChange={addSchema}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add schema type" />
              </SelectTrigger>
              <SelectContent>
                {schemaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {schemaData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No schema markup added. Select a type to add.
            </div>
          ) : (
            <div className="space-y-4">
              {schemaData.map((schema, index) => (
                <SchemaCard
                  key={index}
                  schema={schema}
                  onUpdate={(updated) => updateSchema(index, updated)}
                  onRemove={() => removeSchema(index)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="raw">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>JSON-LD</Label>
              {jsonError ? (
                <span className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {jsonError}
                </span>
              ) : (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Valid JSON
                </span>
              )}
            </div>
            <Textarea
              value={rawJson}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className="font-mono text-xs min-h-[300px]"
              placeholder='[{"@type": "WebSite", ...}]'
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface SchemaCardProps {
  schema: any;
  onUpdate: (schema: any) => void;
  onRemove: () => void;
}

const SchemaCard: React.FC<SchemaCardProps> = ({ schema, onUpdate, onRemove }) => {
  const type = schema['@type'] || 'Unknown';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...schema, [field]: value });
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{type}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {getSchemaFields(type).map((field) => (
          <div key={field.name} className="grid grid-cols-4 gap-2 items-center">
            <Label className="text-xs">{field.label}</Label>
            <div className="col-span-3">
              {field.type === 'textarea' ? (
                <Textarea
                  value={schema[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="text-xs"
                  rows={2}
                />
              ) : (
                <Input
                  value={schema[field.name] || ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="text-xs"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

function createDefaultSchema(type: string): any {
  const base = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'WebSite':
      return {
        ...base,
        name: 'PourCulture',
        url: 'https://pourculture.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://pourculture.com/discover?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };
    case 'Organization':
      return {
        ...base,
        name: 'PourCulture',
        url: 'https://pourculture.com',
        logo: '',
        sameAs: [],
      };
    case 'LocalBusiness':
      return {
        ...base,
        name: '',
        address: { '@type': 'PostalAddress', streetAddress: '', addressLocality: '', addressCountry: '' },
        telephone: '',
        openingHours: '',
      };
    case 'Article':
    case 'BlogPosting':
      return {
        ...base,
        headline: '',
        author: { '@type': 'Person', name: '' },
        datePublished: '',
        dateModified: '',
        image: '',
      };
    case 'Person':
      return {
        ...base,
        name: '',
        jobTitle: '',
        url: '',
        image: '',
      };
    case 'Event':
      return {
        ...base,
        name: '',
        startDate: '',
        endDate: '',
        location: { '@type': 'Place', name: '', address: '' },
        description: '',
      };
    case 'FAQPage':
      return {
        ...base,
        mainEntity: [],
      };
    case 'BreadcrumbList':
      return {
        ...base,
        itemListElement: [],
      };
    default:
      return base;
  }
}

function getSchemaFields(type: string): { name: string; label: string; type?: string; placeholder?: string }[] {
  switch (type) {
    case 'WebSite':
      return [
        { name: 'name', label: 'Site Name', placeholder: 'PourCulture' },
        { name: 'url', label: 'URL', placeholder: 'https://pourculture.com' },
      ];
    case 'Organization':
      return [
        { name: 'name', label: 'Name', placeholder: 'Organization name' },
        { name: 'url', label: 'URL', placeholder: 'https://...' },
        { name: 'logo', label: 'Logo URL', placeholder: 'https://...' },
      ];
    case 'LocalBusiness':
      return [
        { name: 'name', label: 'Business Name' },
        { name: 'telephone', label: 'Phone' },
        { name: 'openingHours', label: 'Hours', placeholder: 'Mo-Fr 09:00-18:00' },
      ];
    case 'Article':
    case 'BlogPosting':
      return [
        { name: 'headline', label: 'Headline' },
        { name: 'datePublished', label: 'Published', placeholder: 'YYYY-MM-DD' },
        { name: 'image', label: 'Image URL' },
      ];
    case 'Person':
      return [
        { name: 'name', label: 'Name' },
        { name: 'jobTitle', label: 'Job Title' },
        { name: 'url', label: 'URL' },
      ];
    case 'Event':
      return [
        { name: 'name', label: 'Event Name' },
        { name: 'startDate', label: 'Start Date', placeholder: 'YYYY-MM-DD' },
        { name: 'endDate', label: 'End Date', placeholder: 'YYYY-MM-DD' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ];
    default:
      return [];
  }
}
