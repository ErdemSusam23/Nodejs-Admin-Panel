import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleApi } from '@/api/roles'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const roleSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'En az bir yetki seçilmelidir'),
  isActive: z.boolean().default(true),
})

type RoleFormData = z.infer<typeof roleSchema>

// Common permissions list
const AVAILABLE_PERMISSIONS = [
  { value: 'users.read', label: 'Kullanıcıları Görüntüleme', category: 'Kullanıcılar' },
  { value: 'users.create', label: 'Kullanıcı Oluşturma', category: 'Kullanıcılar' },
  { value: 'users.update', label: 'Kullanıcı Güncelleme', category: 'Kullanıcılar' },
  { value: 'users.delete', label: 'Kullanıcı Silme', category: 'Kullanıcılar' },
  { value: 'roles.read', label: 'Rolleri Görüntüleme', category: 'Roller' },
  { value: 'roles.create', label: 'Rol Oluşturma', category: 'Roller' },
  { value: 'roles.update', label: 'Rol Güncelleme', category: 'Roller' },
  { value: 'roles.delete', label: 'Rol Silme', category: 'Roller' },
  { value: 'categories.read', label: 'Kategorileri Görüntüleme', category: 'Kategoriler' },
  { value: 'categories.create', label: 'Kategori Oluşturma', category: 'Kategoriler' },
  { value: 'categories.update', label: 'Kategori Güncelleme', category: 'Kategoriler' },
  { value: 'categories.delete', label: 'Kategori Silme', category: 'Kategoriler' },
  { value: 'audit.read', label: 'Audit Logları Görüntüleme', category: 'Sistem' },
  { value: 'audit.export', label: 'Audit Logları Dışa Aktarma', category: 'Sistem' },
]

const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
  if (!acc[perm.category]) {
    acc[perm.category] = []
  }
  acc[perm.category].push(perm)
  return acc
}, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      isActive: true,
      permissions: [],
    },
  })

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', { page }],
    queryFn: () => roleApi.getRoles({ page, limit: 10 }),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla oluşturuldu')
      setIsCreateOpen(false)
      reset()
      setSelectedPermissions([])
    },
    onError: () => {
      toast.error('Rol oluşturulurken bir hata oluştu')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      roleApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla güncellendi')
      setEditingRole(null)
      reset()
      setSelectedPermissions([])
    },
    onError: () => {
      toast.error('Rol güncellenirken bir hata oluştu')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla silindi')
      setDeletingRole(null)
    },
    onError: () => {
      toast.error('Rol silinirken bir hata oluştu')
    },
  })

  const onSubmit = (data: RoleFormData) => {
    const submitData = {
      ...data,
      permissions: selectedPermissions,
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole._id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setValue('name', role.name)
    setValue('description', role.description || '')
    setValue('isActive', role.isActive)
    setSelectedPermissions(role.permissions || [])
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setEditingRole(null)
    reset()
    setSelectedPermissions([])
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = groupedPermissions[category].map((p) => p.value)
    const allSelected = categoryPerms.every((p) => selectedPermissions.includes(p))
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPerms.includes(p)))
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...categoryPerms])])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rol Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Rolleri ve yetkilerini yönetin
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rol
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Roller ({rolesData?.data?.length || 0})
          </CardTitle>
          <CardDescription>
            Sistemdeki tüm rollerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Yetkiler</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturulma</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : rolesData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Rol bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                rolesData?.data.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.permissions?.length || 0} yetki
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.isActive ? 'default' : 'secondary'}>
                        {role.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingRole(role)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {rolesData?.pagination && rolesData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
              Sayfa {rolesData.pagination.page} / {rolesData.pagination.totalPages}
               </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= rolesData.pagination.totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingRole} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Rol Düzenle' : 'Yeni Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Rol bilgilerini güncelleyin'
                : 'Yeni bir rol oluşturun'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">İsim *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Yetkiler *</Label>
                <Badge variant="outline">
                  {selectedPermissions.length} seçili
                </Badge>
              </div>
              
              {errors.permissions && (
                <p className="text-sm text-destructive">{errors.permissions.message}</p>
              )}

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => {
                  const allSelected = perms.every((p) =>
                    selectedPermissions.includes(p.value)
                  )

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {category}
                          </CardTitle>
                          <Button
                            type="button"
                            variant={allSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleCategoryPermissions(category)}
                          >
                            {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {perms.map((perm) => (
                            <div
                              key={perm.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={perm.value}
                                checked={selectedPermissions.includes(perm.value)}
                                onChange={() => togglePermission(perm.value)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label
                                htmlFor={perm.value}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {perm.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingRole ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingRole}
        onOpenChange={() => setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rolü sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingRole?.name}</strong> adlı rolü silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}