import apiClient from '@/lib/api-client'

export interface DashboardStats {
  users: number
  roles: number
  categories: number
}

export const statsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Backend: { code: 200, data: { users: 4, ... } } 
    const response = await apiClient.get('/stats');
    
    // response.data -> Axios'un body kısmı ({ code: 200, data: {...} })
    return response.data.data; 
  },
}