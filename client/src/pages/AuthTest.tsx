import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AuthTest() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p><strong>Status:</strong> {isAuthenticated ? "Logged In" : "Not Logged In"}</p>
            
            {isAuthenticated && user && (
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email || "Not provided"}</p>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Role:</strong> {user.role || "user"}</p>
                {user.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click below to test login with multiple OAuth providers (Google, Apple, X, GitHub, Email)
                </p>
                <Button onClick={handleLogin} className="w-full">
                  Test Multi-Provider Login
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Logout
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Expected behavior:</p>
            <p>• Redirect to Replit.com</p>
            <p>• Show multiple login options (Google, Apple, X, GitHub, Email)</p>
            <p>• Redirect back after authentication</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
