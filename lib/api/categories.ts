import type { Category } from "@/types"

interface ApiResponse<T> {
  code: number
  data?: T
  msg: string
  error_code?: string
}

export const categoryApi = {
  // 获取所有分类
  async getAll(): Promise<ApiResponse<Category[]>> {
    const response = await fetch("/api/categories")
    return response.json()
  },

  // 获取单个分类
  async getById(id: string): Promise<ApiResponse<Category>> {
    const response = await fetch(`/api/categories/${id}`)
    return response.json()
  },

  // 创建分类
  async create(name: string, description?: string): Promise<ApiResponse<Category>> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    })
    return response.json()
  },

  // 更新分类
  async update(
    id: string,
    name: string,
    description?: string
  ): Promise<ApiResponse<Category>> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    })
    return response.json()
  },

  // 删除分类
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },
}
