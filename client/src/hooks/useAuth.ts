import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export function useAuth() {
  // Get user data from the working profile endpoint
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/profile"],
    retry: false,
    // Handle 401 errors gracefully - they indicate the user is not authenticated
    queryFn: async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });
        
        if (response.status === 401) {
          // 401 is expected when user is not authenticated
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
