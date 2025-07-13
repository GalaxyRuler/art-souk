import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Get user data from the working profile endpoint
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    retry: false,
  });

  // Get user roles from the working roles endpoint
  const { data: rolesData } = useQuery({
    queryKey: ["/api/user/roles"],
    retry: false,
  });

  // Combine the data to create a complete user object
  const user = userData ? {
    ...userData,
    roles: rolesData?.roles || [],
    roleSetupComplete: rolesData?.setupComplete || false
  } : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
