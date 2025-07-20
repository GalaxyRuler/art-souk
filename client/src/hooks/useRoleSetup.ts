import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';

export function useRoleSetup() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Don't run role query for unauthenticated users
  const { data: roleData, isLoading: roleQueryLoading } = useQuery({
    queryKey: ['/api/user/roles'],
    enabled: isAuthenticated && !authLoading,
    retry: false, // Don't retry for role queries
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (isAuthenticated && !roleQueryLoading && !authLoading && roleData) {
      // Check if user hasn't completed role setup
      if (!roleData.setupComplete) {
        // Don't redirect if already on role selection page
        if (window.location.pathname !== '/role-selection') {
          navigate('/role-selection');
        }
      }
    }
  }, [isAuthenticated, roleQueryLoading, authLoading, roleData, navigate]);

  console.log('🔍 RoleSetup Hook Debug:', {
    isAuthenticated,
    authLoading,
    roleQueryLoading,
    roleData,
    shouldReturnEarly: !authLoading && !isAuthenticated
  });

  // For unauthenticated users, immediately return without loading when auth is resolved
  if (!authLoading && !isAuthenticated) {
    return {
      setupComplete: true, // Unauthenticated users don't need role setup
      userRoles: [],
      isLoading: false, // Never loading for unauthenticated users
    };
  }

  // Still loading auth
  if (authLoading) {
    return {
      setupComplete: false,
      userRoles: [],
      isLoading: true,
    };
  }

  // For authenticated users
  return {
    setupComplete: roleData?.setupComplete ?? true, // Default to true to prevent infinite loading
    userRoles: roleData?.roles || [],
    isLoading: roleQueryLoading, // Only role query loading, not auth loading
  };
}
