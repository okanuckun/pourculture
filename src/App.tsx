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
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
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
