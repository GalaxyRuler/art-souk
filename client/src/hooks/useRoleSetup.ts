import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';

export function useRoleSetup() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['/api/user/roles'],
    enabled: isAuthenticated,
    staleTime: 0, // Always fetch fresh data to reflect role setup changes
    refetchOnMount: true,
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading && roleData) {
      // Check if user hasn't completed role setup
      if (!roleData.setupComplete) {
        // Don't redirect if already on role selection page
        if (window.location.pathname !== '/role-selection') {
          navigate('/role-selection');
        }
      }
    }
  }, [isAuthenticated, isLoading, roleData, navigate]);

  return {
    setupComplete: roleData?.setupComplete || false,
    userRoles: roleData?.roles || [],
    isLoading,
  };
}
