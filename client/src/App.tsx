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
import Editorial from "@/pages/Editorial";
import ArtworkDetail from "@/pages/ArtworkDetail";
import ArtistProfile from "@/pages/ArtistProfile";
import Search from "@/pages/Search";
import Dashboard from "@/pages/Dashboard";
import GalleryProfile from "@/pages/GalleryProfile";
import AuctionDetail from "@/pages/AuctionDetail";
import ArticleDetail from "@/pages/ArticleDetail";
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
          <Route path="/editorial" component={Editorial} />
          <Route path="/editorial/:id" component={ArticleDetail} />
          <Route path="/artwork/:id" component={ArtworkDetail} />
          <Route path="/search" component={Search} />
          <Route path="/dashboard" component={Dashboard} />
        </>
      )}
      {/* Public routes accessible to all users */}
      <Route path="/artists" component={Artists} />
      <Route path="/artists/:id" component={ArtistProfile} />
      <Route path="/galleries" component={Galleries} />
      <Route path="/galleries/:id" component={GalleryProfile} />
      <Route path="/auctions" component={Auctions} />
      <Route path="/auctions/:id" component={AuctionDetail} />
      <Route path="/editorial" component={Editorial} />
      <Route path="/editorial/:id" component={ArticleDetail} />
      <Route path="/artwork/:id" component={ArtworkDetail} />
      <Route path="/search" component={Search} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/test" component={AdminTest} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/auth/test" component={AuthTest} />
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
