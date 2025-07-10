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
    return <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-zinc-900/80 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-zinc-300"><strong>Status:</strong> {isAuthenticated ? "Logged In" : "Not Logged In"}</p>
            
            {isAuthenticated && user && (
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg space-y-2">
                <p className="text-zinc-300"><strong>User ID:</strong> {user.id}</p>
                <p className="text-zinc-300"><strong>Email:</strong> {user.email || "Not provided"}</p>
                <p className="text-zinc-300"><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p className="text-zinc-300"><strong>Role:</strong> {user.role || "user"}</p>
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
                <p className="text-sm text-zinc-400">
                  Click below to test login with multiple OAuth providers (Google, Apple, X, GitHub, Email)
                </p>
                <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Test Multi-Provider Login
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogout} variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Logout
              </Button>
            )}
          </div>

          <div className="text-xs text-zinc-400 space-y-1">
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