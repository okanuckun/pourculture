import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import BrutalistHome from "./pages/BrutalistHome";
import Index from "./pages/Index";
import { WineScanButton } from "@/components/WineScanner";
import Discover from "./pages/Discover";
import ExploreCategory from "./pages/ExploreCategory";
import News from "./pages/News";
import AboutNaturalWine from "./pages/AboutNaturalWine";
import SubmitVenue from "./pages/SubmitVenue";
import SubmitWinemaker from "./pages/SubmitWinemaker";
import SubmitWineFair from "./pages/SubmitWineFair";
import VenueDetail from "./pages/VenueDetail";
import WinemakerDetail from "./pages/WinemakerDetail";
import WineFairDetail from "./pages/WineFairDetail";
import NewsDetail from "./pages/NewsDetail";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminClaims from "./pages/AdminClaims";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import KnowledgeHub from "./pages/KnowledgeHub";
import GuideDetail from "./pages/GuideDetail";
import HarvestReportDetail from "./pages/HarvestReportDetail";
import Forum from "./pages/Forum";
import ForumTopic from "./pages/ForumTopic";
import ClaimVenue from "./pages/ClaimVenue";
import OwnerDashboard from "./pages/OwnerDashboard";
import EditVenueProfile from "./pages/EditVenueProfile";
import EditWinemakerProfile from "./pages/EditWinemakerProfile";
import GooglePlaceDetail from "./pages/GooglePlaceDetail";
import WineRoutes from "./pages/WineRoutes";
import RouteDetail from "./pages/RouteDetail";
import CreateRoute from "./pages/CreateRoute";
import EditRoute from "./pages/EditRoute";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import SEOAdmin from "./pages/admin/SEOAdmin";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <WineScanButton />
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
      <Route path="/dashboard" element={<OwnerDashboard />} />
      <Route path="/dashboard/venue/:id/edit" element={<EditVenueProfile />} />
      <Route path="/dashboard/winemaker/:id/edit" element={<EditWinemakerProfile />} />
      <Route path="/claim-venue" element={<ClaimVenue />} />
      <Route path="/place/google/:placeId" element={<GooglePlaceDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
