import apiClient from '@/lib/api-client'
// AuditLog tipini aşağıda düzelttiğimiz sayfada kullanacağız, 
// o yüzden burada any veya güncel tipi kullanabiliriz.

// Backend modeline uygun tip tanımı
export interface AuditLogItem {
  _id: string
  email: string
  location: string
  proc_type: string
  log: any
  created_at: string
}

export const auditApi = {
  getAuditLogs: async (params: { 
    page: number, 
    limit: number, 
    action?: string, 
    resource?: string, 
    startDate?: string, 
    endDate?: string 
  }) => {
    // Burada params.page değerinin gönderildiğinden emin olun
    const { data } = await apiClient.post('/auditlogs', {
      page: params.page, // <-- Bu satır kritik
      limit: params.limit,
      action: params.action,
      resource: params.resource,
      begin_date: params.startDate,
      end_date: params.endDate
    })
    
    // Backend { code: 200, data: { data: [], pagination: {} } } dönüyor.
    // Dönen verinin içindeki data objesini döndürüyoruz.
    return data.data 
  },

  exportAuditLogs: async (filters?: any): Promise<Blob> => {
    // Export endpoint'i henüz backend'de yoksa burası hata verebilir.
    // Şimdilik GET /auditlogs/export varsayalım veya POST kullanalım.
    const { data } = await apiClient.post('/auditlogs/export', filters, {
      responseType: 'blob',
    })
    return data
  },
}