import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryApi } from '@/api/categories'
// Types dosyasını güncellemediysen buradaki tipleri manuel tanımlıyorum
// ki hata almadan çalışsın.
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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

// Backend'e uygun Şema (Sadece name ve is_active var)
const categorySchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  isActive: z.boolean().default(true),
})

type CategoryFormData = z.infer<typeof categorySchema>

// Backend ile uyumlu Tip Tanımı (Burada override ediyoruz)
interface Category {
  _id: string
  name: string
  is_active: boolean // Backend'den gelen snake_case
  createdAt?: string
}

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      isActive: true,
    },
  })

  // Kategorileri Getir
  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories({ limit: 1000 }),
  })

  // Backend wrapper yapısına göre veriyi alalım
  // API { code: 200, data: { data: [...] } } veya { code: 200, data: [...] } dönebilir.
  // Senin swagger'ına göre data içinde array var.
  const categories: Category[] = Array.isArray(categoriesResponse?.data) 
    ? categoriesResponse.data 
    : (categoriesResponse?.data?.data || [])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => categoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori başarıyla oluşturuldu')
      handleCloseDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Kategori oluşturulamadı')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori başarıyla güncellendi')
      handleCloseDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Güncelleme hatası')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Kategori silindi')
      setDeletingCategory(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Silme hatası')
    },
  })

  const onSubmit = (data: CategoryFormData) => {
    // Backend snake_case (is_active) bekliyor
    const submitData = {
      name: data.name,
      is_active: data.isActive, 
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setValue('name', category.name)
    // Backend (is_active) -> Form (isActive) dönüşümü
    setValue('isActive', category.is_active) 
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setEditingCategory(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Kategorileri listeleyin ve yönetin
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {/* DÜZ LİSTE GÖRÜNÜMÜ (Tree View Kaldırıldı) */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kategoriler ({categories.length})
          </CardTitle>
          <CardDescription>
            Sistemdeki aktif ve pasif kategoriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">Yükleniyor...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    Kayıt bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingCategory(category)}
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingCategory} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </DialogTitle>
            <DialogDescription>
              Kategori bilgilerini giriniz.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">İsim *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description ve ParentID alanları Backend'de olmadığı için kaldırıldı */}

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingCategory?.name}</strong> adlı kategoriyi silmek
              istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingCategory && deleteMutation.mutate(deletingCategory._id)
              }
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