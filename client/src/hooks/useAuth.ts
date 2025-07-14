import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export function useAuth() {
  // Get user data from the working profile endpoint
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
