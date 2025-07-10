import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { i18n } from "@/lib/i18n";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Artists from "@/pages/Artists";
import Galleries from "@/pages/Galleries";
import Auctions from "@/pages/Auctions";
import ArtworkDetail from "@/pages/ArtworkDetail";
import ArtistProfile from "@/pages/ArtistProfile";
import Search from "@/pages/Search";
import Dashboard from "@/pages/Dashboard";
import GalleryProfile from "@/pages/GalleryProfile";
import AuctionDetail from "@/pages/AuctionDetail";
import Workshops from "@/pages/Workshops";
import Events from "@/pages/Events";
import Analytics from "@/pages/Analytics";
import UserPreferences from "@/pages/UserPreferences";
import CollectorDashboard from "@/pages/CollectorDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import EmailTest from "@/pages/EmailTest";
import AchievementsPage from "@/pages/AchievementsPage";
import ManageWorkshops from "@/pages/ManageWorkshops";
import ManageEvents from "@/pages/ManageEvents";
import { CommissionRequests } from "@/pages/CommissionRequests";
import { CommissionDetail } from "@/pages/CommissionDetail";

import Auth from "@/pages/Auth";
import AdminSetup from "@/pages/AdminSetup";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTest from "@/pages/AdminTest";
import AuthTest from "@/pages/AuthTest";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/artists" component={Artists} />
          <Route path="/artists/:id" component={ArtistProfile} />
          <Route path="/galleries" component={Galleries} />
          <Route path="/galleries/:id" component={GalleryProfile} />
          <Route path="/auctions" component={Auctions} />
          <Route path="/auctions/:id" component={AuctionDetail} />
          <Route path="/workshops" component={Workshops} />
          <Route path="/events" component={Events} />

          <Route path="/artwork/:id" component={ArtworkDetail} />
          <Route path="/search" component={Search} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/preferences" component={UserPreferences} />
          <Route path="/collector" component={CollectorDashboard} />
          <Route path="/seller" component={SellerDashboard} />
          <Route path="/achievements/:id" component={AchievementsPage} />
          <Route path="/manage/workshops" component={ManageWorkshops} />
          <Route path="/manage/events" component={ManageEvents} />
          <Route path="/commissions" component={CommissionRequests} />
          <Route path="/commissions/:id" component={CommissionDetail} />
        </>
      )}
      {/* Public routes accessible to all users */}
      <Route path="/artists" component={Artists} />
      <Route path="/artists/:id" component={ArtistProfile} />
      <Route path="/galleries" component={Galleries} />
      <Route path="/galleries/:id" component={GalleryProfile} />
      <Route path="/auctions" component={Auctions} />
      <Route path="/auctions/:id" component={AuctionDetail} />
      <Route path="/workshops" component={Workshops} />
      <Route path="/events" component={Events} />

      <Route path="/artwork/:id" component={ArtworkDetail} />
      <Route path="/search" component={Search} />
      <Route path="/achievements/:id" component={AchievementsPage} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/test" component={AdminTest} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/auth/test" component={AuthTest} />
      <Route path="/email/test" component={EmailTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
