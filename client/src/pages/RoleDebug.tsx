
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, UserCheck, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RoleDebug() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['/api/user/roles'],
    enabled: !!user,
  });

  const { data: fullProfile } = useQuery({
    queryKey: ['/api/profile/full'],
    enabled: !!user,
  });

  const updateRolesMutation = useMutation({
    mutationFn: async (roles: string[]) => {
      const response = await fetch('/api/user/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update roles');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/roles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/full'] });
    },
  });

  const addSellerRole = () => {
    const currentRoles = roleData?.roles || [];
    const newRoles = [...currentRoles];
    
    if (!newRoles.includes('artist')) {
      newRoles.push('artist');
    }
    
    updateRolesMutation.mutate(newRoles);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view role information.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  const userRoles = roleData?.roles || [];
  const hasSellerAccess = userRoles.includes('artist') || userRoles.includes('gallery');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Role Debug Information</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Current User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">User ID:</label>
                <p className="font-mono text-sm">{user?.id || 'Loading...'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Email:</label>
                <p>{user?.email || 'Loading...'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Current Roles:</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {roleLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : userRoles.length > 0 ? (
                    userRoles.map((role: string) => (
                      <Badge key={role} variant="default">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No roles assigned</Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Seller Access:</label>
                <Badge variant={hasSellerAccess ? "default" : "destructive"}>
                  {hasSellerAccess ? "✓ Has Seller Access" : "✗ No Seller Access"}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Role Setup Complete:</label>
                <Badge variant={roleData?.setupComplete ? "default" : "outline"}>
                  {roleData?.setupComplete ? "✓ Complete" : "✗ Incomplete"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Access Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasSellerAccess ? (
                <Alert>
                  <UserCheck className="h-4 w-4" />
                  <AlertDescription>
                    ✓ You have seller access and should be able to view invoices.
                    <br />
                    <a href="/invoice-management" className="text-blue-600 hover:underline mt-2 inline-block">
                      → Go to Invoice Management
                    </a>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have seller access. You need 'artist' or 'gallery' role to access invoices.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={addSellerRole}
                    disabled={updateRolesMutation.isPending}
                    className="w-full"
                  >
                    {updateRolesMutation.isPending ? 'Adding Artist Role...' : 'Add Artist Role (for Testing)'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(fullProfile, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Data Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
                {JSON.stringify(roleData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
