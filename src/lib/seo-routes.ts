// All site routes for SEO management
export interface SiteRoute {
  path: string;
  type: 'static' | 'dynamic';
  pageType: string;
  name: string;
  pattern?: string;
}

export const siteRoutes: SiteRoute[] = [
  // Static pages
  { path: '/', type: 'static', pageType: 'home', name: 'Home' },
  { path: '/discover', type: 'static', pageType: 'listing', name: 'Discover' },
  { path: '/auth', type: 'static', pageType: 'auth', name: 'Authentication' },
  { path: '/news', type: 'static', pageType: 'listing', name: 'News' },
  { path: '/forum', type: 'static', pageType: 'listing', name: 'Forum' },
  { path: '/knowledge-hub', type: 'static', pageType: 'listing', name: 'Knowledge Hub' },
  { path: '/wine-routes', type: 'static', pageType: 'listing', name: 'Wine Routes' },
  { path: '/about-natural-wine', type: 'static', pageType: 'page', name: 'About Natural Wine' },
  { path: '/submit-venue', type: 'static', pageType: 'form', name: 'Submit Venue' },
  { path: '/submit-winemaker', type: 'static', pageType: 'form', name: 'Submit Winemaker' },
  { path: '/submit-wine-fair', type: 'static', pageType: 'form', name: 'Submit Wine Fair' },
  { path: '/claim-venue', type: 'static', pageType: 'form', name: 'Claim Venue' },
  { path: '/create-event', type: 'static', pageType: 'form', name: 'Create Event' },
  { path: '/create-route', type: 'static', pageType: 'form', name: 'Create Route' },
  { path: '/my-events', type: 'static', pageType: 'dashboard', name: 'My Events' },
  { path: '/profile', type: 'static', pageType: 'profile', name: 'User Profile' },
  { path: '/edit-profile', type: 'static', pageType: 'form', name: 'Edit Profile' },
  { path: '/owner-dashboard', type: 'static', pageType: 'dashboard', name: 'Owner Dashboard' },
  
  // Dynamic pages
  { path: '/venue/:slug', type: 'dynamic', pageType: 'venue', name: 'Venue Detail', pattern: '/venue/' },
  { path: '/winemaker/:slug', type: 'dynamic', pageType: 'winemaker', name: 'Winemaker Detail', pattern: '/winemaker/' },
  { path: '/wine-fair/:slug', type: 'dynamic', pageType: 'event', name: 'Wine Fair Detail', pattern: '/wine-fair/' },
  { path: '/news/:slug', type: 'dynamic', pageType: 'article', name: 'News Article', pattern: '/news/' },
  { path: '/guide/:id', type: 'dynamic', pageType: 'guide', name: 'Guide Detail', pattern: '/guide/' },
  { path: '/route/:slug', type: 'dynamic', pageType: 'route', name: 'Wine Route Detail', pattern: '/route/' },
  { path: '/forum/:id', type: 'dynamic', pageType: 'forum', name: 'Forum Topic', pattern: '/forum/' },
  { path: '/explore/:category', type: 'dynamic', pageType: 'category', name: 'Category Page', pattern: '/explore/' },
  { path: '/harvest-report/:id', type: 'dynamic', pageType: 'report', name: 'Harvest Report', pattern: '/harvest-report/' },
  
  // Admin pages (noindex by default)
  { path: '/admin', type: 'static', pageType: 'admin', name: 'Admin Dashboard' },
  { path: '/admin/claims', type: 'static', pageType: 'admin', name: 'Admin Claims' },
  { path: '/admin/seo', type: 'static', pageType: 'admin', name: 'SEO Admin' },
];

export const pageTypeLabels: Record<string, string> = {
  home: 'Homepage',
  listing: 'Listing Page',
  auth: 'Authentication',
  page: 'Static Page',
  form: 'Form Page',
  dashboard: 'User Dashboard',
  profile: 'Profile Page',
  venue: 'Venue Detail',
  winemaker: 'Winemaker Detail',
  event: 'Event Detail',
  article: 'News Article',
  guide: 'Guide Detail',
  route: 'Wine Route',
  forum: 'Forum Topic',
  category: 'Category Page',
  report: 'Harvest Report',
  admin: 'Admin Page',
};

export const schemaTypes = [
  { value: 'WebSite', label: 'WebSite + SearchAction' },
  { value: 'Organization', label: 'Organization' },
  { value: 'BreadcrumbList', label: 'BreadcrumbList' },
  { value: 'Article', label: 'Article' },
  { value: 'BlogPosting', label: 'BlogPosting' },
  { value: 'Person', label: 'Person' },
  { value: 'LocalBusiness', label: 'LocalBusiness' },
  { value: 'FAQPage', label: 'FAQPage' },
  { value: 'Event', label: 'Event' },
  { value: 'Product', label: 'Product' },
  { value: 'Review', label: 'Review' },
];

export const robotsMetaOptions = [
  { value: 'index, follow', label: 'Index, Follow (Default)' },
  { value: 'noindex, follow', label: 'No Index, Follow' },
  { value: 'index, nofollow', label: 'Index, No Follow' },
  { value: 'noindex, nofollow', label: 'No Index, No Follow' },
  { value: 'noarchive', label: 'No Archive' },
  { value: 'nosnippet', label: 'No Snippet' },
];

export const severityColors: Record<string, string> = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
};

export const issueTypes = [
  { value: 'missing_title', label: 'Missing Meta Title', severity: 'critical' },
  { value: 'missing_description', label: 'Missing Meta Description', severity: 'high' },
  { value: 'title_too_long', label: 'Title Too Long (>60 chars)', severity: 'medium' },
  { value: 'title_too_short', label: 'Title Too Short (<30 chars)', severity: 'medium' },
  { value: 'description_too_long', label: 'Description Too Long (>160 chars)', severity: 'medium' },
  { value: 'description_too_short', label: 'Description Too Short (<70 chars)', severity: 'medium' },
  { value: 'missing_h1', label: 'Missing H1 Tag', severity: 'high' },
  { value: 'multiple_h1', label: 'Multiple H1 Tags', severity: 'medium' },
  { value: 'missing_alt', label: 'Images Missing Alt Text', severity: 'medium' },
  { value: 'missing_og_image', label: 'Missing OG Image', severity: 'low' },
  { value: 'missing_schema', label: 'Missing Schema Markup', severity: 'low' },
  { value: 'duplicate_title', label: 'Duplicate Title', severity: 'high' },
  { value: 'duplicate_description', label: 'Duplicate Description', severity: 'medium' },
  { value: 'thin_content', label: 'Thin Content (<300 words)', severity: 'medium' },
  { value: 'orphan_page', label: 'Orphan Page (No Internal Links)', severity: 'medium' },
  { value: 'redirect_chain', label: 'Redirect Chain', severity: 'medium' },
  { value: 'broken_link', label: 'Broken Link (404)', severity: 'critical' },
  { value: 'canonical_issue', label: 'Canonical URL Issue', severity: 'high' },
];
