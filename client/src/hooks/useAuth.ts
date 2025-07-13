import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Get user data from the working profile endpoint
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
