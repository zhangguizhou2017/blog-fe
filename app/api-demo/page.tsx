"use client"

import { useEffect, useState } from "react"
import { categoryApi } from "@/lib/api/categories"
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function CategoriesApiDemo() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // 获取所有分类
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await categoryApi.getAll()
      if (response.code === 200) {
        setCategories(response.data || [])
        toast({
          title: "成功",
          description: response.msg,
        })
      } else {
        toast({
          title: "错误",
          description: response.msg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 创建分类
  const handleCreate = async () => {
    try {
      const response = await categoryApi.create("新分类", "这是一个新分类")
      if (response.code === 201) {
        toast({
          title: "成功",
          description: response.msg,
        })
        fetchCategories()
      } else {
        toast({
          title: "错误",
          description: response.msg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // 删除分类
  const handleDelete = async (id: string) => {
    try {
      const response = await categoryApi.delete(id)
      if (response.code === 200) {
        toast({
          title: "成功",
          description: response.msg,
        })
        fetchCategories()
      } else {
        toast({
          title: "错误",
          description: response.msg,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">分类 API 演示</h1>
        <div className="flex gap-2">
          <Button onClick={fetchCategories} disabled={loading}>
            {loading ? "加载中..." : "刷新分类"}
          </Button>
          <Button onClick={handleCreate} variant="outline">
            创建新分类
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分类列表 (REST API)</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground">暂无分类</p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">ID: {category.id}</p>
                  </div>
                  <Button
                    onClick={() => handleDelete(category.id)}
                    variant="destructive"
                    size="sm"
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-gray-100 rounded-md">
        <h2 className="font-bold mb-2">API 端点说明</h2>
        <ul className="text-sm space-y-2">
          <li>
            <code className="bg-white px-2 py-1 rounded">GET /api/categories</code> - 获取所有分类
          </li>
          <li>
            <code className="bg-white px-2 py-1 rounded">GET /api/categories/[id]</code> - 获取单个分类
          </li>
          <li>
            <code className="bg-white px-2 py-1 rounded">POST /api/categories</code> - 创建分类
          </li>
          <li>
            <code className="bg-white px-2 py-1 rounded">PUT /api/categories/[id]</code> - 更新分类
          </li>
          <li>
            <code className="bg-white px-2 py-1 rounded">DELETE /api/categories/[id]</code> - 删除分类
          </li>
        </ul>
      </div>
    </div>
  )
}
