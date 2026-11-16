import { cn } from '@/lib/utils';

type Variant = 'oneline' | 'stacked';

interface BrandLogoProps {
  variant?: Variant;
  /** Force a colour; by default cherry on light theme, cream on dark theme. */
  tone?: 'auto' | 'cherry' | 'cream' | 'ink' | 'pink';
  className?: string;
}

/**
 * Pour Culture wordmark (melted Riviera Nights, rendered to PNG in /public/brand).
 * Height is controlled with className (e.g. "h-6").
 */
export function BrandLogo({ variant = 'oneline', tone = 'auto', className }: BrandLogoProps) {
  const src = (t: string) => `/brand/wordmark-${variant}-${t}.png`;

  if (tone !== 'auto') {
    return <img src={src(tone)} alt="Pour Culture" className={cn('w-auto select-none', className)} draggable={false} />;
  }

  return (
    <>
      <img src={src('cherry')} alt="Pour Culture" className={cn('w-auto select-none dark:hidden', className)} draggable={false} />
      <img src={src('cream')} alt="Pour Culture" className={cn('w-auto select-none hidden dark:block', className)} draggable={false} />
    </>
  );
}

export default BrandLogo;
