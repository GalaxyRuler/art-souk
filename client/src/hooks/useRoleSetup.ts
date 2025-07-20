import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';

export function useRoleSetup() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['/api/user/roles'],
    enabled: isAuthenticated && !authLoading,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading && !authLoading && roleData) {
      // Check if user hasn't completed role setup
      if (!roleData.setupComplete) {
        // Don't redirect if already on role selection page
        if (window.location.pathname !== '/role-selection') {
          navigate('/role-selection');
        }
      }
    }
  }, [isAuthenticated, isLoading, authLoading, roleData, navigate]);

  // For unauthenticated users, don't show loading state
  if (!isAuthenticated && !authLoading) {
    return {
      setupComplete: true, // Unauthenticated users don't need role setup
      userRoles: [],
      isLoading: false,
    };
  }

  return {
    setupComplete: roleData?.setupComplete ?? true, // Default to true to prevent infinite loading
    userRoles: roleData?.roles || [],
    isLoading: authLoading || (isAuthenticated && isLoading),
  };
}
