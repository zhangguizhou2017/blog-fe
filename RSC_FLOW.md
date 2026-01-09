# RSC 数据流工作原理

## 1. Server Component 的数据流

### 首页加载流程

```
用户访问 http://localhost:3000
         ↓
    浏览器发送请求
         ↓
  Next.js 服务器接收
         ↓
  执行 app/page.tsx (Server Component)
         ↓
  执行 getPosts() 函数
         ↓
  createServerClient() 创建 Supabase 客户端
         ↓
  直接查询数据库（不经过网络）
  SELECT * FROM posts WHERE published=true AND is_public=true
         ↓
  获取作者信息
  SELECT * FROM user_profiles WHERE id IN (...)
         ↓
  合并数据
         ↓
  React 在服务器上渲染组件
  <Home posts={[...]} />
         ↓
  生成 HTML
         ↓
  返回完整的 HTML 给浏览器
         ↓
  浏览器接收 HTML
         ↓
  直接显示（不需要加载状态）
```

**关键点：**
- 所有数据获取都在服务器上完成
- 浏览器接收的是完整的 HTML
- 不需要额外的 HTTP 请求
- 首屏加载快

### 代码示例

```typescript
// app/page.tsx
async function getPosts() {
  const supabase = createServerClient()

  // 这是一个直接的数据库查询
  // 不是 HTTP 请求，不经过网络
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  return posts
}

// 这是一个 async 组件
export default async function Home() {
  // 在服务器上等待数据
  const posts = await getPosts()

  // 返回包含数据的 JSX
  return (
    <div>
      {posts.map(post => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

## 2. Client Component 的数据流

### 评论区加载流程

```
页面加载完成
         ↓
  React 在浏览器上挂载 CommentsSection 组件
         ↓
  组件初始化状态
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
         ↓
  useEffect 触发
         ↓
  执行 fetchComments() 函数
         ↓
  浏览器发送 HTTP 请求
  GET /api/comments?postId=xxx
         ↓
  Next.js 服务器接收 API 请求
         ↓
  执行 app/api/comments/route.ts
         ↓
  查询数据库
  SELECT * FROM comments WHERE post_id=xxx
         ↓
  返回 JSON 响应
  { code: 200, data: [...] }
         ↓
  浏览器接收 JSON
         ↓
  更新状态
  setComments(data)
         ↓
  组件重新渲染
         ↓
  显示评论列表
```

**关键点：**
- 数据获取在浏览器上执行
- 需要通过 HTTP 请求
- 需要处理加载状态
- 需要处理错误状态

### 代码示例

```typescript
// components/comments-section.tsx
"use client"

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // 这是一个 HTTP 请求
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)

        if (error) throw error

        setComments(data)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  )
}
```

## 3. Server Action 的数据流

### 创建分类流程

```
用户填写表单
         ↓
  用户点击"创建"按钮
         ↓
  handleSubmit 触发
         ↓
  调用 Server Action
  await createCategory(name, description)
         ↓
  浏览器发送特殊的 RSC 请求
  (不是普通的 HTTP 请求)
         ↓
  Next.js 服务器接收
         ↓
  执行 createCategory() 函数
  (这是一个 "use server" 函数)
         ↓
  createServerClient() 创建 Supabase 客户端
         ↓
  直接查询数据库
  INSERT INTO categories (name, description, slug)
         ↓
  返回新创建的分类
         ↓
  浏览器接收响应
         ↓
  更新 UI
```

**关键点：**
- 不需要创建 API 路由
- 类型安全
- 自动处理序列化
- 性能最优

### 代码示例

```typescript
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

  if (error) throw new Error(error.message)

  return data[0]
}

// components/category-form.tsx
"use client"

import { createCategory } from "@/app/actions"

export function CategoryForm() {
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 直接调用 Server Action
      // 不需要 fetch、不需要 API 路由
      const result = await createCategory(name, "")
      console.log("创建成功:", result)
    } catch (error) {
      console.error("创建失败:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button type="submit">创建</button>
    </form>
  )
}
```

## 4. API 路由的数据流

### 第三方应用调用流程

```
第三方应用（移动应用、桌面应用等）
         ↓
  发送 HTTP 请求
  GET /api/categories
         ↓
  Next.js 服务器接收
         ↓
  执行 app/api/categories/route.ts
         ↓
  createServerClient() 创建 Supabase 客户端
         ↓
  直接查询数据库
  SELECT * FROM categories
         ↓
  返回 JSON 响应
  { code: 200, data: [...] }
         ↓
  第三方应用接收 JSON
         ↓
  第三方应用处理数据
```

**关键点：**
- 用于第三方应用调用
- 返回 JSON 格式
- 支持 CORS
- 可以添加认证

### 代码示例

```typescript
// app/api/categories/route.ts
export async function GET() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json(
        { code: 400, error_code: "query_failed", msg: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      code: 200,
      data,
      msg: "获取分类列表成功",
    })
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, error_code: "server_error", msg: err.message },
      { status: 500 }
    )
  }
}
```

## 5. 对比：四种方式的性能

### 首屏加载时间对比

```
┌─────────────────────────────────────────────────────────┐
│ 方式                    │ 首屏加载时间 │ 网络请求数 │
├─────────────────────────────────────────────────────────┤
│ Server Component        │ ⚡⚡⚡ 最快  │ 1 次      │
│ Server Action           │ ⚡⚡⚡ 最快  │ 1 次      │
│ Client Component        │ ⚡⚡ 中等   │ 2 次      │
│ 传统前后端分离          │ ⚡ 较慢    │ 2+ 次     │
│ API 路由 (第三方)       │ ⚡⚡ 中等   │ 1 次      │
└─────────────────────────────────────────────────────────┘
```

## 6. 你的项目中的实际应用

### 首页 (app/page.tsx)
```
类型: Server Component
数据获取: 直接查询数据库
流程: 服务器 → 查询 → 渲染 → 返回 HTML
优势: 首屏快，SEO 友好
```

### 文章详情 (app/blog/[slug]/page.tsx)
```
类型: Server Component
数据获取: 直接查询数据库
流程: 服务器 → 查询 → 渲染 → 返回 HTML
优势: 首屏快，SEO 友好
```

### 评论区 (components/comments-section.tsx)
```
类型: Client Component
数据获取: useEffect + Supabase 客户端
流程: 浏览器 → HTTP 请求 → 更新状态 → 重新渲染
原因: 需要实时交互
```

### 分类管理 (app/categories/manage/page.tsx)
```
类型: Client Component
数据获取: useEffect + Supabase 客户端
流程: 浏览器 → HTTP 请求 → 更新状态 → 重新渲染
原因: 需要表单交互
```

### API 路由 (app/api/categories/route.ts)
```
类型: API 路由
用途: 第三方应用调用
流程: 第三方 → HTTP 请求 → 查询数据库 → 返回 JSON
```

## 7. 何时触发接口请求？

### Server Component
- ✅ 在服务器上自动执行
- ✅ 在页面渲染前完成
- ✅ 不需要手动触发

### Client Component
- ✅ 在 useEffect 中触发
- ✅ 在组件挂载时执行
- ✅ 可以通过依赖数组控制

### Server Action
- ✅ 在用户交互时触发
- ✅ 通过函数调用触发
- ✅ 自动处理序列化

### API 路由
- ✅ 在第三方应用请求时触发
- ✅ 通过 HTTP 请求触发
- ✅ 需要手动处理

## 总结

| 方式 | 何时执行 | 如何触发 | 适用场景 |
|------|--------|--------|--------|
| Server Component | 服务器 | 自动 | 初始数据加载 |
| Client Component | 浏览器 | useEffect | 交互式数据 |
| Server Action | 服务器 | 函数调用 | 表单提交 |
| API 路由 | 服务器 | HTTP 请求 | 第三方调用 |
