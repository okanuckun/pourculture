import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { BrutalistLayout } from '@/components/grid/BrutalistLayout';
import { ArrowLeft } from 'lucide-react';

/**
 * App Store + Google Play both require a publicly reachable Privacy
 * Policy URL during submission. This page is the canonical source.
 *
 * The placeholders marked TODO below should be filled in with the
 * legal-entity name, contact email, and jurisdiction before the first
 * public submission. Update LAST_UPDATED whenever the policy changes
 * and keep an audit trail in seo_change_log if material.
 */
const LAST_UPDATED = '2026-04-27';

const Privacy = () => {
  return (
    <BrutalistLayout>
      <SEOHead
        title="Privacy Policy — PourCulture"
        description="How PourCulture collects, uses, and protects your personal data."
      />

      <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        <header className="mb-10 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            [ legal ]
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Who we are</h2>
            <p>
              PourCulture (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the app&rdquo;) is a
              platform for discovering natural wines, wineries, wine bars, and the people
              behind them. This policy explains what data we collect when you use the
              PourCulture website or mobile app, how we use it, and the rights you have
              over it.
            </p>
            {/* TODO: replace with legal entity name + registered address */}
            <p className="text-xs text-muted-foreground mt-2">
              Operator: <em>[Company name and registered address — fill in before publishing]</em>.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">What we collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Account data:</strong> email address, display name, and (if you
                use Google sign-in) the Google profile basics Google shares with us.
              </li>
              <li>
                <strong>Profile content:</strong> avatar, bio, posts, comments, scans, and
                wine routes you create.
              </li>
              <li>
                <strong>Wine scans:</strong> the photos you take of wine labels are sent
                to our AI analyser to identify the bottle. Scans you don&rsquo;t mark as
                favourites stay private to your account; scans you save as favourites
                appear on your public profile.
              </li>
              <li>
                <strong>Location:</strong> when you use the map / discover features we
                may ask the browser or operating system for your approximate location to
                show nearby venues. This is opt-in via a permission prompt.
              </li>
              <li>
                <strong>Device & usage:</strong> standard server logs (IP, browser, time
                of request) and basic in-app analytics for crash reporting and feature
                improvement.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">How we use it</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To run the core product: authenticate you, save your scans, render the feed, surface nearby venues.</li>
              <li>To identify wines from photos via our AI label-scanner.</li>
              <li>To moderate user-generated content and prevent abuse.</li>
              <li>To send transactional emails (password reset, account notifications).</li>
              <li>To improve the app — aggregated, non-identifying usage signals only.</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal data and we do <strong>not</strong> use it
              for third-party advertising.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Third-party services we rely on</h2>
            <p>
              To run PourCulture we send certain data to a small set of trusted
              processors:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong>Supabase</strong> — database, authentication, file storage, edge functions.</li>
              <li><strong>Google Places & Maps</strong> — venue discovery, autocomplete, place photos.</li>
              <li><strong>Mapbox</strong> — interactive maps and geocoding.</li>
              <li><strong>Lovable AI Gateway (Google Gemini)</strong> — wine label image analysis.</li>
              <li><strong>Google OAuth</strong> — optional sign-in.</li>
              <li><strong>Email delivery</strong> — transactional email for password reset and account notifications.</li>
            </ul>
            <p className="mt-3">
              Each processor handles only the data needed for its specific job and is
              bound by its own privacy commitments.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Data retention</h2>
            <p>
              We keep your account data while your account is active. You can delete your
              account at any time from the profile settings, which removes your profile
              row and posts. Scans you saved as favourites are deleted with the account;
              auth records are retained only as long as legally required for fraud and
              abuse prevention.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Your rights</h2>
            <p>
              Depending on where you live (GDPR for EU/UK users, CCPA for California
              residents, similar elsewhere) you have the right to access, correct, export,
              or delete your personal data, and to withdraw consent for processing. To
              exercise any of these rights, email us at{' '}
              {/* TODO: replace with real support email */}
              <em>[support@pourculture.com — replace with actual address]</em>.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Children</h2>
            <p>
              PourCulture is intended for adults of legal drinking age in their
              jurisdiction. We do not knowingly collect data from anyone under 18 (or the
              applicable local age of majority). If you believe a child has signed up,
              email us and we will remove the account.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Cookies & local storage</h2>
            <p>
              The website uses local storage to keep you signed in and to remember small
              UI preferences. We do not run third-party advertising or cross-site tracking
              cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Changes to this policy</h2>
            <p>
              When we make material changes we&rsquo;ll update the &ldquo;Last
              updated&rdquo; date at the top of this page and, where appropriate, surface
              an in-app notice. Continued use of PourCulture after a change means you
              accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold mb-3">Contact</h2>
            <p>
              {/* TODO: replace with real contact email */}
              Questions or requests? Email <em>[support@pourculture.com]</em>.
            </p>
          </section>
        </div>
      </div>
    </BrutalistLayout>
  );
};

export default Privacy;
