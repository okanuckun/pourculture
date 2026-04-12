import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { WineScanButton } from "@/components/WineScanner";

// Eager: critical pages
import BrutalistHome from "./pages/BrutalistHome";
import NotFound from "./pages/NotFound";

// Lazy: loaded on demand
const Discover = lazy(() => import("./pages/Discover"));
const ExploreCategory = lazy(() => import("./pages/ExploreCategory"));
const News = lazy(() => import("./pages/News"));
const AboutNaturalWine = lazy(() => import("./pages/AboutNaturalWine"));
const SubmitVenue = lazy(() => import("./pages/SubmitVenue"));
const SubmitWinemaker = lazy(() => import("./pages/SubmitWinemaker"));
const SubmitWineFair = lazy(() => import("./pages/SubmitWineFair"));
const VenueDetail = lazy(() => import("./pages/VenueDetail"));
const WinemakerDetail = lazy(() => import("./pages/WinemakerDetail"));
const WineFairDetail = lazy(() => import("./pages/WineFairDetail"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminClaims = lazy(() => import("./pages/AdminClaims"));
const MyEvents = lazy(() => import("./pages/MyEvents"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const KnowledgeHub = lazy(() => import("./pages/KnowledgeHub"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const HarvestReportDetail = lazy(() => import("./pages/HarvestReportDetail"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumTopic = lazy(() => import("./pages/ForumTopic"));
const ClaimVenue = lazy(() => import("./pages/ClaimVenue"));
const People = lazy(() => import("./pages/People"));
const EditVenueProfile = lazy(() => import("./pages/EditVenueProfile"));
const EditWinemakerProfile = lazy(() => import("./pages/EditWinemakerProfile"));
const GooglePlaceDetail = lazy(() => import("./pages/GooglePlaceDetail"));
const WineRoutes = lazy(() => import("./pages/WineRoutes"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const CreateRoute = lazy(() => import("./pages/CreateRoute"));
const EditRoute = lazy(() => import("./pages/EditRoute"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Index = lazy(() => import("./pages/Index"));
const SEOAdmin = lazy(() => import("./pages/admin/SEOAdmin"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <WineScanButton />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<BrutalistHome />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/explore/:category" element={<ExploreCategory />} />
        <Route path="/news" element={<News />} />
        <Route path="/about/natural-wine" element={<AboutNaturalWine />} />
        <Route path="/wine-routes" element={<WineRoutes />} />
        <Route path="/wine-routes/create" element={<CreateRoute />} />
        <Route path="/wine-routes/:slug" element={<RouteDetail />} />
        <Route path="/wine-routes/:slug/edit" element={<EditRoute />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/knowledge" element={<KnowledgeHub />} />
        <Route path="/people" element={<People />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:id" element={<ForumTopic />} />
        <Route path="/guide/:id" element={<GuideDetail />} />
        <Route path="/harvest/:id" element={<HarvestReportDetail />} />
        <Route path="/submit/venue" element={<SubmitVenue />} />
        <Route path="/submit/winemaker" element={<SubmitWinemaker />} />
        <Route path="/submit/event" element={<SubmitWineFair />} />
        <Route path="/venue/:slug" element={<VenueDetail />} />
        <Route path="/winemaker/:slug" element={<WinemakerDetail />} />
        <Route path="/wine-fair/:slug" element={<WineFairDetail />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
        <Route path="/event/:id" element={<Index />} />
        <Route path="/event/:id/edit" element={<EditEvent />} />
        <Route path="/my-events" element={<MyEvents />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/claims" element={<AdminClaims />} />
        <Route path="/admin/seo" element={<SEOAdmin />} />
        <Route path="/profile/venue/:id/edit" element={<EditVenueProfile />} />
        <Route path="/profile/winemaker/:id/edit" element={<EditWinemakerProfile />} />
        <Route path="/claim-venue" element={<ClaimVenue />} />
        <Route path="/place/google/:placeId" element={<GooglePlaceDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </TooltipProvider>
);

export default App;
