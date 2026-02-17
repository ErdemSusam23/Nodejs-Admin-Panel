import apiClient from '@/lib/api-client'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
  CategoryFilters,
} from '@/types'

export const categoryApi = {
  // Get all categories with filters
  getCategories: async (filters?: CategoryFilters): Promise<PaginatedResponse<Category>> => {
    const { data } = await apiClient.get('/categories', {
      params: filters,
    })
    return data
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/categories/${id}`)
    return data
  },

  // Create category
  createCategory: async (categoryData: CreateCategoryRequest): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories/add', categoryData)
    return data
  },

  // Update category
  updateCategory: async (id: string, categoryData: UpdateCategoryRequest): Promise<Category> => {
    const { _id, ...rest } = categoryData
    const { data } = await apiClient.post<Category>('/categories/update', { _id: id, ...rest })
    return data
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.post('/categories/delete', { _id: id })
  },

  // Get category tree
  getCategoryTree: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories/tree')
    return data
  },
}