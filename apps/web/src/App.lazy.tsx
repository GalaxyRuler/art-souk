import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Lazy load heavy components
const Home = lazy(() => import("./pages/Home"));
const Landing = lazy(() => import("./pages/Landing"));
const Artists = lazy(() => import("./pages/Artists"));
const Galleries = lazy(() => import("./pages/Galleries"));
const Auctions = lazy(() => import("./pages/Auctions"));
const Workshops = lazy(() => import("./pages/Workshops"));
const Events = lazy(() => import("./pages/Events"));
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"));
const ArtistProfile = lazy(() => import("./pages/ArtistProfile"));
const GalleryProfile = lazy(() => import("./pages/GalleryProfile"));
const AuctionDetail = lazy(() => import("./pages/AuctionDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CollectorDashboard = lazy(() => import("./pages/CollectorDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const VirtualExhibitions = lazy(() => import("./pages/VirtualExhibitions"));
const CommissionRequests = lazy(() => import("./pages/CommissionRequests"));
const CommissionDetail = lazy(() => import("./pages/CommissionDetail"));
const UserPreferences = lazy(() => import("./pages/UserPreferences"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const Search = lazy(() => import("./pages/Search"));
const Auth = lazy(() => import("./pages/Auth"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const NotFound = lazy(() => import("./pages/not-found"));

// Lazy loading wrapper component
function LazyRoute({ component: Component, ...props }: { component: React.LazyExoticComponent<() => JSX.Element> }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function AppRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={() => <LazyRoute component={Home} />} />
        <Route path="/landing" component={() => <LazyRoute component={Landing} />} />
        <Route path="/artists" component={() => <LazyRoute component={Artists} />} />
        <Route path="/artists/:id" component={() => <LazyRoute component={ArtistProfile} />} />
        <Route path="/galleries" component={() => <LazyRoute component={Galleries} />} />
        <Route path="/galleries/:id" component={() => <LazyRoute component={GalleryProfile} />} />
        <Route path="/auctions" component={() => <LazyRoute component={Auctions} />} />
        <Route path="/auctions/:id" component={() => <LazyRoute component={AuctionDetail} />} />
        <Route path="/workshops" component={() => <LazyRoute component={Workshops} />} />
        <Route path="/events" component={() => <LazyRoute component={Events} />} />
        <Route path="/artwork/:id" component={() => <LazyRoute component={ArtworkDetail} />} />
        <Route path="/virtual-exhibitions" component={() => <LazyRoute component={VirtualExhibitions} />} />
        <Route path="/commissions" component={() => <LazyRoute component={CommissionRequests} />} />
        <Route path="/commissions/:id" component={() => <LazyRoute component={CommissionDetail} />} />
        <Route path="/search" component={() => <LazyRoute component={Search} />} />
        <Route path="/auth" component={() => <LazyRoute component={Auth} />} />
        <Route path="/role-selection" component={() => <LazyRoute component={RoleSelection} />} />
        <Route path="/dashboard" component={() => <LazyRoute component={Dashboard} />} />
        <Route path="/collector-dashboard" component={() => <LazyRoute component={CollectorDashboard} />} />
        <Route path="/seller-dashboard" component={() => <LazyRoute component={SellerDashboard} />} />
        <Route path="/admin-dashboard" component={() => <LazyRoute component={AdminDashboard} />} />
        <Route path="/analytics" component={() => <LazyRoute component={AnalyticsDashboard} />} />
        <Route path="/preferences" component={() => <LazyRoute component={UserPreferences} />} />
        <Route path="/achievements" component={() => <LazyRoute component={AchievementsPage} />} />
        <Route component={() => <LazyRoute component={NotFound} />} />
      </Switch>
    </Router>
  );
}