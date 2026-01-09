/**
 * RSC vs 传统前后端分离 - 实际代码对比
 *
 * 这个文件展示了同一个功能在两种方式下的实现差异
 */

// ============================================
// 场景：获取分类列表并显示
// ============================================

// ============================================
// 方式 1：RSC（Server Component）
// ============================================

// app/categories/page.tsx
async function getCategories() {
  // 直接在服务器上执行，不需要 HTTP 请求
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error:", error)
    return []
  }

  return data
}

export default async function CategoriesPage() {
  // 在服务器上等待数据
  const categories = await getCategories()

  return (
    <div>
      <h1>分类列表</h1>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * RSC 的工作流程：
 *
 * 1. 用户访问 /categories
 * 2. Next.js 在服务器上执行 getCategories()
 * 3. 直接查询 Supabase 数据库（不经过网络）
 * 4. 服务器返回完整的 HTML（包含分类数据）
 * 5. 浏览器接收 HTML，直接显示
 *
 * 优势：
 * ✅ 只需一次请求
 * ✅ 首屏加载快
 * ✅ 数据已在 HTML 中
 * ✅ 不需要加载状态
 * ✅ 不需要 JavaScript 处理数据获取
 */

// ============================================
// 方式 2：传统前后端分离（Client Component）
// ============================================

// app/categories/page.tsx
"use client"

import { useEffect, useState } from "react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // 在浏览器上执行
    const fetchCategories = async () => {
      try {
        // 发送 HTTP 请求到 API
        const response = await fetch("/api/categories")
        const result = await response.json()

        if (result.code === 200) {
          setCategories(result.data)
        } else {
          setError(result.msg)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error}</div>

  return (
    <div>
      <h1>分类列表</h1>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 传统前后端分离的工作流程：
 *
 * 1. 用户访问 /categories
 * 2. 浏览器接收空的 HTML（没有数据）
 * 3. React 在浏览器上挂载组件
 * 4. useEffect 触发
 * 5. 浏览器发送 HTTP 请求到 /api/categories
 * 6. 服务器返回 JSON 数据
 * 7. 浏览器更新状态，重新渲染
 *
 * 劣势：
 * ❌ 需要多次请求
 * ❌ 首屏加载慢
 * ❌ 需要加载状态
 * ❌ 需要更多 JavaScript
 * ❌ 用户看到加载中的提示
 */

// ============================================
// 场景 2：创建分类
// ============================================

// ============================================
// 方式 1：RSC + Server Action
// ============================================

// app/actions.ts
"use server"

export async function createCategory(name: string, description: string) {
  const supabase = createServerClient()

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, description, slug }])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

// components/category-form.tsx
"use client"

import { createCategory } from "@/app/actions"
import { useState } from "react"

export function CategoryForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 直接调用服务器函数，不需要 API 路由
      const result = await createCategory(name, description)
      console.log("创建成功:", result)
      setName("")
      setDescription("")
    } catch (error) {
      console.error("创建失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="分类名称"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="分类描述"
      />
      <button type="submit" disabled={loading}>
        {loading ? "创建中..." : "创建"}
      </button>
    </form>
  )
}

/**
 * Server Action 的优势：
 * ✅ 不需要创建 API 路由
 * ✅ 类型安全（TypeScript）
 * ✅ 自动处理序列化
 * ✅ 代码更简洁
 * ✅ 性能更好
 */

// ============================================
// 方式 2：传统 API 路由
// ============================================

// app/api/categories/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const { name, description } = body

  const supabase = createServerClient()

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, description, slug }])
    .select()

  if (error) {
    return NextResponse.json(
      { code: 400, msg: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ code: 200, data: data[0] }, { status: 201 })
}

// components/category-form.tsx
"use client"

import { useState } from "react"

export function CategoryForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 需要手动发送 HTTP 请求
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })

      const result = await response.json()

      if (result.code === 200) {
        console.log("创建成功:", result.data)
        setName("")
        setDescription("")
      } else {
        console.error("创建失败:", result.msg)
      }
    } catch (error) {
      console.error("请求失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="分类名称"
        required
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="分类描述"
      />
      <button type="submit" disabled={loading}>
        {loading ? "创建中..." : "创建"}
      </button>
    </form>
  )
}

/**
 * API 路由的劣势：
 * ❌ 需要创建额外的文件
 * ❌ 需要手动处理 HTTP 请求
 * ❌ 需要手动序列化/反序列化
 * ❌ 代码更复杂
 * ❌ 多一层网络请求
 */

// ============================================
// 总结：何时使用哪种方式？
// ============================================

/**
 * 使用 RSC + Server Action：
 * ✅ 内部应用（只有你的前端调用）
 * ✅ 需要快速开发
 * ✅ 需要最佳性能
 * ✅ 不需要 CORS
 *
 * 使用 API 路由：
 * ✅ 第三方应用需要调用
 * ✅ 移动应用需要调用
 * ✅ 需要 CORS 支持
 * ✅ 需要 Webhook
 * ✅ 需要与外部服务集成
 *
 * 你的项目：
 * - 首页、文章详情等：使用 RSC（已实现）
 * - 评论、分类管理等：使用 Client Component + useEffect（已实现）
 * - 创建 API 路由：用于第三方调用或移动应用（已创建）
 */
