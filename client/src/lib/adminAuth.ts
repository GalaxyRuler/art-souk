import { apiRequest } from './queryClient';

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalArtists: number;
    totalGalleries: number;
    totalArtworks: number;
    activeAuctions: number;
    totalWorkshops: number;
    totalEvents: number;
    pendingReports: number;
  };
  growth: {
    newUsersThisMonth: number;
    newArtworksThisMonth: number;
  };
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await apiRequest('/api/admin/stats');
    return response;
  },
  
  getUsers: async (page = 1, limit = 20, search = '', role = '', status = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status }),
    });
    
    const response = await apiRequest(`/api/admin/users?${params}`);
    return response;
  },
  
  getKycDocuments: async () => {
    const response = await apiRequest('/api/admin/kyc-documents');
    return response;
  },
  
  updateKycDocument: async (id: string, verificationStatus: string, verificationNotes: string) => {
    const response = await apiRequest(`/api/admin/kyc-documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus, verificationNotes }),
    });
    return response;
  },
  
  updateUserRole: async (userId: string, role: string) => {
    const response = await apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    return response;
  },
  
  setupAdmin: async () => {
    const response = await apiRequest('/api/admin/setup', {
      method: 'POST',
    });
    return response;
  },
};
