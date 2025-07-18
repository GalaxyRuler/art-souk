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
  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include', // Ensure cookies are sent
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Properly serialize body to JSON if it exists
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    requestOptions.body = JSON.stringify(options.body);
  } else if (options.body) {
    requestOptions.body = options.body;
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Enhanced mutation function for better type safety
export const mutationFn = async (url: string, data: any, method: string = 'POST') => {
  return apiRequest(url, {
    method,
    body: data,
  });
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // Reduce from Infinity to 1min
      gcTime: 2 * 60 * 1000, // Updated from cacheTime to gcTime
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// PHASE B: Selective cache cleanup every 10 minutes (but preserve admin stats)
setInterval(() => {
  console.log('🧹 Selective cache cleanup for memory optimization');
  // Don't clear admin stats cache - only clear other old queries
  const adminStatsKeys = ['/api/admin/stats'];
  queryClient.getQueryCache().getAll().forEach(query => {
    const queryKey = query.queryKey[0] as string;
    if (!adminStatsKeys.some(key => queryKey.includes(key))) {
      queryClient.removeQueries({ queryKey: query.queryKey });
    }
  });
}, 10 * 60 * 1000); // Every 10 minutes

// Add function to clear auth cache on logout
export function clearAuthCache() {
  queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/roles'] });
  queryClient.clear();
}
