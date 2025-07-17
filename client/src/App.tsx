import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nextProvider } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSetup } from "@/hooks/useRoleSetup";
import { i18n } from "@/lib/i18n";
import ErrorBoundary from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

// Eagerly load critical pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";

// Lazy load non-critical pages for better performance
const Artists = lazy(() => import("@/pages/Artists"));
const Galleries = lazy(() => import("@/pages/Galleries"));
const Auctions = lazy(() => import("@/pages/Auctions"));
const ArtworkDetail = lazy(() => import("@/pages/ArtworkDetail"));
const ArtistProfile = lazy(() => import("@/pages/ArtistProfile"));
const Search = lazy(() => import("@/pages/Search"));
// Dashboard is now eagerly loaded above
const GalleryProfile = lazy(() => import("@/pages/GalleryProfile"));
const AuctionDetail = lazy(() => import("@/pages/AuctionDetail"));
const Workshops = lazy(() => import("@/pages/Workshops"));
const Events = lazy(() => import("@/pages/Events"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"));
const UserPreferences = lazy(() => import("@/pages/UserPreferences"));
const CollectorDashboard = lazy(() => import("@/pages/CollectorDashboard"));
const SellerDashboard = lazy(() => import("@/pages/SellerDashboard"));
const EmailTest = lazy(() => import("@/pages/EmailTest"));
const AchievementsPage = lazy(() => import("@/pages/AchievementsPage"));
const ManageWorkshops = lazy(() => import("@/pages/ManageWorkshops"));
const ManageEvents = lazy(() => import("@/pages/ManageEvents"));
const CommissionRequests = lazy(() => import("@/pages/CommissionRequests").then(m => ({ default: m.CommissionRequests })));
const CommissionDetail = lazy(() => import("@/pages/CommissionDetail").then(m => ({ default: m.CommissionDetail })));
const TestCommissions = lazy(() => import("@/pages/TestCommissions"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const ArtworkManagement = lazy(() => import("@/pages/ArtworkManagement"));
const ShippingManagement = lazy(() => import("@/pages/ShippingManagement"));
const InvoiceManagement = lazy(() => import("@/pages/InvoiceManagement"));
// const TapPaymentSetup = lazy(() => import("@/pages/TapPaymentSetup")); // Disabled until sufficient traffic

// Admin pages
const AdminSetup = lazy(() => import("@/pages/AdminSetup"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminTest = lazy(() => import("@/pages/AdminTest"));
const AuthTest = lazy(() => import("@/pages/AuthTest"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner className="h-8 w-8 mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setupComplete, isLoading: roleLoading } = useRoleSetup();

  // Loading state
  if (isLoading || roleLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Home route - different for authenticated vs unauthenticated */}
        <Route path="/" component={isAuthenticated ? Home : Landing} />
        <Route path="/home" component={Home} />
        <Route path="/landing" component={Landing} />
        
        {/* Make artwork management publicly accessible for testing */}
        <Route path="/artworks/manage" component={ArtworkManagement} />
        
        {/* Public routes - accessible to all users */}
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
        <Route path="/commissions" component={CommissionRequests} />
        <Route path="/commissions/:id" component={CommissionDetail} />
        
        {/* Admin routes */}
        <Route path="/admin/setup" component={AdminSetup} />
        <Route path="/admin/test" component={AdminTest} />
        <Route path="/admin" component={AdminDashboard} />
        
        {/* Test routes */}
        <Route path="/auth/test" component={AuthTest} />
        <Route path="/email/test" component={EmailTest} />
        <Route path="/test/commissions" component={TestCommissions} />
        
        {/* Dashboard route - accessible to authenticated users */}
        <Route path="/dashboard" component={Dashboard} />
        
        {/* Testing: Make analytics accessible for debugging */}
        <Route path="/analytics" component={Analytics} />
        <Route path="/analytics/dashboard" component={AnalyticsDashboard} />
        
        {/* Testing: Make seller dashboard accessible for debugging */}
        <Route path="/seller" component={SellerDashboard} />
        
        {/* Testing: Make invoice management accessible for debugging */}
        <Route path="/invoice-management" component={InvoiceManagement} />
        <Route path="/shipping-management" component={ShippingManagement} />
        
        {/* Authenticated-only routes */}
        {isAuthenticated && (
          <>
            <Route path="/preferences" component={UserPreferences} />
            <Route path="/collector" component={CollectorDashboard} />
            <Route path="/manage/workshops" component={ManageWorkshops} />
            <Route path="/manage/events" component={ManageEvents} />
            <Route path="/artworks/manage" component={ArtworkManagement} />
            <Route path="/role-selection" component={RoleSelection} />
            {/* <Route path="/tap-payment-setup" component={TapPaymentSetup} /> */}
          </>
        )}
        
        {/* 404 Route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
