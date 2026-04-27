import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Reverse-DNS app identifier (used by Apple App Store + Google Play).
  // Keep this stable — changing it after first publish forces users to
  // reinstall and breaks deep links.
  appId: 'app.pourculture',
  appName: 'PourCulture',
  webDir: 'dist',

  // No `server.url` here on purpose. Lovable's web preview hosts a remote
  // dev URL, but if a native iOS/Android build is shipped to the App Store
  // pointing at that URL, the bundle becomes a thin WebView wrapper around
  // an external host — Apple/Google reject that ("not enough native value
  // / depends on a website to function"). For development you can set
  // `server.url` locally without committing it. Production native builds
  // load `webDir` (the Vite output) directly, which is what we want.

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
