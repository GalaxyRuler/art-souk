import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function AdminSetup() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/admin/setup', {
        method: 'POST',
      });
      
      toast({
        title: "Success!",
        description: "You are now an admin user. Please refresh the page.",
      });
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Failed to setup admin user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-zinc-400">
              You need to log in first to set up an admin account.
            </p>
            <Link href="/api/login">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center">
      <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-zinc-400">
            <p>Current user: {user?.email}</p>
            <p>Role: {user?.role || 'user'}</p>
          </div>
          
          {user?.role === 'admin' ? (
            <div className="space-y-4">
              <p className="text-orange-500 font-medium">
                ✓ You are already an admin!
              </p>
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">Go to Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-400">
                Click the button below to become the first admin user.
              </p>
              <Button 
                onClick={handleSetupAdmin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {isLoading ? "Setting up..." : "Become Admin"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}