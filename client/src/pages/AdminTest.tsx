import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, AlertCircle, Crown, Users, Palette, Building, Image } from "lucide-react";
import { Link } from "wouter";

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

export default function AdminTest() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test admin stats API
  const { data: adminStats, error: statsError } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  // Test admin users API
  const { data: adminUsers, error: usersError } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  // Test admin artists API
  const { data: adminArtists, error: artistsError } = useQuery({
    queryKey: ["/api/admin/artists"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  // Test admin galleries API
  const { data: adminGalleries, error: galleriesError } = useQuery({
    queryKey: ["/api/admin/galleries"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  // Test admin artworks API
  const { data: adminArtworks, error: artworksError } = useQuery({
    queryKey: ["/api/admin/artworks"],
    enabled: user?.role === 'admin',
    retry: false,
  });

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Authentication Status
    results.push({
      name: "Authentication Status",
      status: isAuthenticated ? 'pass' : 'fail',
      message: isAuthenticated ? `Authenticated as ${user?.email}` : 'Not authenticated',
    });

    // Test 2: Admin Role Check
    results.push({
      name: "Admin Role Check",
      status: user?.role === 'admin' ? 'pass' : 'fail',
      message: user?.role === 'admin' ? 'User has admin role' : `User role: ${user?.role || 'none'}`,
    });

    // Test 3: Admin Stats API
    results.push({
      name: "Admin Stats API",
      status: adminStats ? 'pass' : (statsError ? 'fail' : 'pending'),
      message: adminStats 
        ? `Retrieved stats: ${adminStats.totalUsers} users, ${adminStats.totalArtists} artists`
        : (statsError ? `Error: ${(statsError as any).message}` : 'Pending...'),
    });

    // Test 4: Admin Users API
    results.push({
      name: "Admin Users API",
      status: adminUsers ? 'pass' : (usersError ? 'fail' : 'pending'),
      message: adminUsers 
        ? `Retrieved ${adminUsers.length} users`
        : (usersError ? `Error: ${(usersError as any).message}` : 'Pending...'),
    });

    // Test 5: Admin Artists API
    results.push({
      name: "Admin Artists API",
      status: adminArtists ? 'pass' : (artistsError ? 'fail' : 'pending'),
      message: adminArtists 
        ? `Retrieved ${adminArtists.length} artists`
        : (artistsError ? `Error: ${(artistsError as any).message}` : 'Pending...'),
    });

    // Test 6: Admin Galleries API
    results.push({
      name: "Admin Galleries API", 
      status: adminGalleries ? 'pass' : (galleriesError ? 'fail' : 'pending'),
      message: adminGalleries 
        ? `Retrieved ${adminGalleries.length} galleries`
        : (galleriesError ? `Error: ${(galleriesError as any).message}` : 'Pending...'),
    });

    // Test 7: Admin Artworks API
    results.push({
      name: "Admin Artworks API",
      status: adminArtworks ? 'pass' : (artworksError ? 'fail' : 'pending'),
      message: adminArtworks 
        ? `Retrieved ${adminArtworks.length} artworks`
        : (artworksError ? `Error: ${(artworksError as any).message}` : 'Pending...'),
    });

    // Test 8: Data Validation
    if (adminStats) {
      const hasValidStats = adminStats.totalUsers >= 0 && adminStats.totalArtists >= 0;
      results.push({
        name: "Data Validation",
        status: hasValidStats ? 'pass' : 'fail',
        message: hasValidStats ? 'All statistics have valid values' : 'Invalid data detected',
      });
    }

    setTestResults(results);
    setIsRunning(false);

    // Show summary toast
    const passCount = results.filter(r => r.status === 'pass').length;
    const totalCount = results.length;
    
    toast({
      title: "Test Results",
      description: `${passCount}/${totalCount} tests passed`,
      variant: passCount === totalCount ? "default" : "destructive",
    });
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard Test Suite</h1>
            <p className="text-muted-foreground">
              Comprehensive testing of admin functionality and API endpoints
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-2">
            <Crown className="h-4 w-4 mr-2" />
            Test Environment
          </Badge>
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current User Status</p>
                <p className="text-sm text-muted-foreground">
                  {isAuthenticated ? `${user?.email} (${user?.role || 'user'})` : 'Not authenticated'}
                </p>
              </div>
              <div className="flex gap-2">
                {!isAuthenticated && (
                  <Button variant="outline" onClick={() => window.location.href = "/api/login"}>
                    Login First
                  </Button>
                )}
                {user?.role !== 'admin' && (
                  <Link href="/admin/setup">
                    <Button variant="outline">
                      Setup Admin
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={runTests} 
                  disabled={isRunning || user?.role !== 'admin'}
                  className="min-w-[120px]"
                >
                  {isRunning ? "Running..." : "Run Tests"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✓ {testResults.filter(r => r.status === 'pass').length} Passed
                </span>
                <span className="text-red-600">
                  ✗ {testResults.filter(r => r.status === 'fail').length} Failed
                </span>
                <span className="text-yellow-600">
                  ◐ {testResults.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin">
                <Button variant="outline" className="w-full justify-start">
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/admin/setup">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Admin Setup
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start">
                  <Image className="h-4 w-4 mr-2" />
                  User Dashboard
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin Data Preview */}
        {user?.role === 'admin' && adminStats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Admin Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Palette className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{adminStats.totalArtists}</div>
                  <div className="text-sm text-muted-foreground">Total Artists</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Building className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{adminStats.totalGalleries}</div>
                  <div className="text-sm text-muted-foreground">Total Galleries</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Image className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{adminStats.totalArtworks}</div>
                  <div className="text-sm text-muted-foreground">Total Artworks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}