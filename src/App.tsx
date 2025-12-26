import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import RaisinHome from "./pages/RaisinHome";
import Index from "./pages/Index";
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
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import KnowledgeHub from "./pages/KnowledgeHub";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<RaisinHome />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/explore/:category" element={<ExploreCategory />} />
      <Route path="/news" element={<News />} />
      <Route path="/about/natural-wine" element={<AboutNaturalWine />} />
      <Route path="/knowledge" element={<KnowledgeHub />} />
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
