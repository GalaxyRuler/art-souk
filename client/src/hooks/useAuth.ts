import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export function useAuth() {
  // Get user data from the working profile endpoint
  const { data: user, isLoading, error, isSuccess, isError } = useQuery<User | null>({
    queryKey: ["/api/profile"],
    retry: false, // No retries to avoid delays
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
    // Handle 401 errors gracefully - they indicate the user is not authenticated
    queryFn: async () => {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });
        
        if (response.status === 401) {
          // 401 is expected when user is not authenticated - return null to complete the query
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Auth error:", error);
        // Return null instead of throwing to complete the query
        return null;
      }
    },
  });

  console.log('🔍 Auth Hook Debug:', {
    user: !!user,
    isLoading,
    isSuccess,
    isError,
    data: user
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
