import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}



type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Simple apiRequest function for admin dashboard
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Ensure cookies are sent
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // Reduce from Infinity to 1min
      cacheTime: 2 * 60 * 1000, // Reduce from 10min to 2min
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// PHASE B: Aggressive cache cleanup every 5 minutes
setInterval(() => {
  console.log('🧹 Clearing query cache for memory optimization');
  queryClient.clear(); // Clear all cached queries
}, 5 * 60 * 1000); // Every 5 minutes

// Add function to clear auth cache on logout
export function clearAuthCache() {
  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/roles'] });
  queryClient.clear();
}
