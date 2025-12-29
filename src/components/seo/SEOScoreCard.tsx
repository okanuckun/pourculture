import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Circle } from 'lucide-react';

interface SEOScoreCardProps {
  score: number;
  title: string;
  description: string;
  robotsMeta: string;
  h1Text: string | null;
  ogImage: string | null;
  schemaCount: number;
  wordCount: number;
}

export const SEOScoreCard: React.FC<SEOScoreCardProps> = ({
  score,
  title,
  description,
  robotsMeta,
  h1Text,
  ogImage,
  schemaCount,
  wordCount,
}) => {
  const checks = [
    {
      label: 'Meta Title',
      status: title && title.length >= 30 && title.length <= 60 ? 'pass' : title ? 'warn' : 'fail',
      detail: title ? `${title.length} chars` : 'Missing',
    },
    {
      label: 'Meta Description',
      status: description && description.length >= 70 && description.length <= 160 ? 'pass' : description ? 'warn' : 'fail',
      detail: description ? `${description.length} chars` : 'Missing',
    },
    {
      label: 'H1 Tag',
      status: h1Text ? 'pass' : 'fail',
      detail: h1Text ? 'Present' : 'Missing',
    },
    {
      label: 'OG Image',
      status: ogImage ? 'pass' : 'warn',
      detail: ogImage ? 'Set' : 'Not set',
    },
    {
      label: 'Schema Markup',
      status: schemaCount > 0 ? 'pass' : 'warn',
      detail: schemaCount > 0 ? `${schemaCount} types` : 'None',
    },
    {
      label: 'Indexable',
      status: robotsMeta.includes('noindex') ? 'fail' : 'pass',
      detail: robotsMeta.includes('noindex') ? 'No' : 'Yes',
    },
    {
      label: 'Content Length',
      status: wordCount >= 300 ? 'pass' : wordCount >= 100 ? 'warn' : 'fail',
      detail: `${wordCount} words`,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 60) return 'text-yellow-500 border-yellow-500';
    if (score >= 40) return 'text-orange-500 border-orange-500';
    return 'text-red-500 border-red-500';
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${getScoreColor(score)}`}>
          <span className="text-xl font-bold">{score}</span>
        </div>
        <div>
          <h4 className="font-semibold">SEO Score</h4>
          <p className="text-sm text-muted-foreground">
            {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor'}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {getIcon(check.status)}
              <span>{check.label}</span>
            </div>
            <span className="text-muted-foreground">{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function calculateSEOScore(settings: {
  meta_title: string | null;
  meta_description: string | null;
  h1_text: string | null;
  og_image: string | null;
  schema_data: any[];
  robots_meta: string;
  word_count: number | null;
}): number {
  let score = 0;
  const maxScore = 100;

  // Meta title (20 points)
  if (settings.meta_title) {
    const len = settings.meta_title.length;
    if (len >= 30 && len <= 60) score += 20;
    else if (len > 0) score += 10;
  }

  // Meta description (20 points)
  if (settings.meta_description) {
    const len = settings.meta_description.length;
    if (len >= 70 && len <= 160) score += 20;
    else if (len > 0) score += 10;
  }

  // H1 tag (15 points)
  if (settings.h1_text) score += 15;

  // OG image (10 points)
  if (settings.og_image) score += 10;

  // Schema markup (15 points)
  if (settings.schema_data && settings.schema_data.length > 0) {
    score += Math.min(15, settings.schema_data.length * 5);
  }

  // Indexable (10 points)
  if (!settings.robots_meta.includes('noindex')) score += 10;

  // Content length (10 points)
  const wordCount = settings.word_count || 0;
  if (wordCount >= 300) score += 10;
  else if (wordCount >= 100) score += 5;

  return Math.min(score, maxScore);
}
