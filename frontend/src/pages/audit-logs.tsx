import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditApi, AuditLogItem } from '@/api/audit'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

const ACTION_TYPES = [
  { value: 'Add', label: 'Ekleme' },
  { value: 'Update', label: 'Güncelleme' },
  { value: 'Delete', label: 'Silme' },
  { value: 'Login', label: 'Giriş' },
]

const RESOURCE_TYPES = [
  { value: 'Users', label: 'Kullanıcılar' },
  { value: 'Roles', label: 'Roller' },
  { value: 'Categories', label: 'Kategoriler' },
]

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [filterAction, setFilterAction] = useState<string>('')
  const [filterResource, setFilterResource] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)

  // Fetch audit logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: [
      'audit-logs',
      { page, filterAction, filterResource, startDate, endDate },
    ],
    queryFn: () =>
      auditApi.getAuditLogs({
        page,
        limit: 20,
        action: filterAction || undefined,
        resource: filterResource || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  const clearFilters = () => {
    setFilterAction('')
    setFilterResource('')
    setStartDate('')
    setEndDate('')
    setPage(1) // Filtre temizlenince ilk sayfaya dön
  }

  // Helper fonksiyonlar
  const getActionLabel = (action: string) => {
    const found = ACTION_TYPES.find(a => a.value === action);
    return found ? found.label : action;
  }

  const getResourceLabel = (resource: string) => {
    const found = RESOURCE_TYPES.find(r => r.value === resource);
    return found ? found.label : resource;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logları</h1>
          <p className="text-muted-foreground mt-2">
            Sistem aktivitelerini görüntüleyin
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>İşlem</Label>
              <Select value={filterAction} onValueChange={(val) => { setFilterAction(val === "all" ? "" : val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm işlemler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm işlemler</SelectItem>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kaynak</Label>
              <Select value={filterResource} onValueChange={(val) => { setFilterResource(val === "all" ? "" : val); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm kaynaklar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm kaynaklar</SelectItem>
                  {RESOURCE_TYPES.map((resource) => (
                    <SelectItem key={resource.value} value={resource.value}>
                      {resource.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
               <Label>Başlangıç</Label>
               <Input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
            </div>

            <div className="space-y-2">
               <Label>Bitiş</Label>
               <Input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
            </div>

            <div className="space-y-2">
               <Label>&nbsp;</Label>
               <Button variant="outline" className="w-full" onClick={clearFilters}>
                 <X className="mr-2 h-4 w-4" /> Temizle
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table & Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Loglar ({logsData?.pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kullanıcı (Email)</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Kaynak</TableHead>
                <TableHead className="text-right">Detay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Yükleniyor...</TableCell></TableRow>
              ) : logsData?.data?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Kayıt Bulunamadı</TableCell></TableRow>
              ) : (
                logsData?.data.map((log: AuditLogItem) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: tr }) : '-'}
                    </TableCell>
                    <TableCell>{log.email || 'Sistem'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getActionLabel(log.proc_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getResourceLabel(log.location)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* --- EKLENEN SAYFALAMA BÖLÜMÜ --- */}
          {logsData && logsData.pagination && logsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Sayfa {logsData.pagination.page} / {logsData.pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= logsData.pagination.totalPages}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {/* --- SONU --- */}

        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Log Detayı</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <Label className="text-muted-foreground text-xs uppercase">Kullanıcı</Label>
                   <p className="font-medium">{selectedLog.email}</p>
                </div>
                <div>
                   <Label className="text-muted-foreground text-xs uppercase">Tarih</Label>
                   <p className="font-medium">{format(new Date(selectedLog.created_at), 'dd.MM.yyyy HH:mm:ss')}</p>
                </div>
                <div>
                   <Label className="text-muted-foreground text-xs uppercase">İşlem</Label>
                   <p className="font-medium">{selectedLog.proc_type}</p>
                </div>
                <div>
                   <Label className="text-muted-foreground text-xs uppercase">Konum</Label>
                   <p className="font-medium">{selectedLog.location}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase">Log Verisi (JSON)</Label>
                <div className="bg-slate-950 text-slate-50 p-4 rounded-md mt-2 overflow-auto max-h-[300px]">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(selectedLog.log, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}