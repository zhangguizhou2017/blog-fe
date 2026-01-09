# React Server Components (RSC) 详解

## 核心概念

### 1. 什么是 RSC？

RSC 是 Next.js 15 的核心特性，允许你在服务器端直接运行 React 组件，而不需要发送到浏览器执行。

**关键点：**
- 服务器组件默认不需要 `"use client"` 标记
- 服务器组件可以直接访问数据库、API、环保变量等
- 服务器组件不会发送 JavaScript 到浏览器

### 2. 两种组件类型

#### Server Component（服务器组件）
```typescript
// app/page.tsx - 默认是服务器组件
async function getPosts() {
  const supabase = createServerClient()
  const { data } = await supabase.from("posts").select("*")
  return data
}

export default async function Home() {
  const posts = await getPosts()  // 直接在服务器上执行
  return <div>{posts.map(...)}</div>
}
```

**特点：**
- ✅ 可以直接访问数据库
- ✅ 可以使用环境变量
- ✅ 可以使用 async/await
- ✅ 不会发送 JavaScript 到浏览器
- ❌ 不能使用 useState、useEffect 等 hooks
- ❌ 不能使用浏览器 API

#### Client Component（客户端组件）
```typescript
// components/comments-section.tsx
"use client"

import { useState, useEffect } from "react"

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // 在浏览器上执行
    fetchComments()
  }, [])

  return <div>{comments.map(...)}</div>
}
```

**特点：**
- ✅ 可以使用 useState、useEffect 等 hooks
- ✅ 可以使用浏览器 API
- ✅ 可以处理用户交互
- ❌ 不能直接访问数据库
- ❌ 不能使用环境变量
- ❌ 需要通过 API 获取数据

## 你的项目中的实际例子

### 例子 1：首页（Server Component）

```typescript
// app/page.tsx
async function getPosts() {
  const supabase = createServerClient()

  // 直接在服务器上查询数据库
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("is_public", true)

  return posts
}

export default async function Home() {
  const posts = await getPosts()  // 等待数据

  return (
    <div>
      {posts.map(post => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

**工作流程：**
1. 用户访问 `/`
2. Next.js 在服务器上执行 `getPosts()`
3. 直接查询 Supabase 数据库
4. 返回 HTML 给浏览器
5. 浏览器接收完整的 HTML（不需要再请求数据）

### 例子 2：评论区（Client Component）

```typescript
// components/comments-section.tsx
"use client"

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // 在浏览器上执行
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)

      setComments(data)
    }

    fetchComments()
  }, [postId])

  return <div>{comments.map(...)}</div>
}
```

**工作流程：**
1. 页面加载时，评论区组件在浏览器上挂载
2. `useEffect` 触发
3. 浏览器发送请求到 Supabase（通过客户端 SDK）
4. 获取数据后更新状态
5. 重新渲染组件

## 接口请求是如何触发的？

### Server Component 中的数据获取

```typescript
// 直接在组件中调用
async function getPostBySlug(slug: string) {
  const supabase = createServerClient()

  // 这是一个直接的数据库查询，不是 HTTP 请求
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single()

  return post
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug)
  return <article>{post.title}</article>
}
```

**触发方式：**
- ✅ 在服务器上直接执行
- ✅ 不经过网络
- ✅ 在页面渲染前完成
- ✅ 数据包含在初始 HTML 中

### Client Component 中的数据获取

```typescript
"use client"

export function CommentsSection({ postId }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // 这会触发一个 HTTP 请求
    const fetchComments = async () => {
      const response = await fetch(`/api/comments?postId=${postId}`)
      const data = await response.json()
      setComments(data)
    }

    fetchComments()
  }, [postId])

  return <div>{comments.map(...)}</div>
}
```

**触发方式：**
- ✅ 在浏览器上执行
- ✅ 通过 HTTP 请求（fetch、axios 等）
- ✅ 在组件挂载后执行
- ✅ 可以处理加载状态、错误等

## 对比：RSC vs 传统前后端分离

### 传统前后端分离

```
浏览器 → 请求 HTML → 服务器返回空 HTML
浏览器 → 请求 /api/posts → 服务器返回 JSON
浏览器 → 用 React 渲染数据
```

**问题：**
- 需要多次请求
- 首屏加载慢
- 需要加载状态管理

### RSC 方式

```
浏览器 → 请求 / → 服务器查询数据库
服务器 → 返回完整的 HTML（包含数据）
浏览器 → 直接显示
```

**优势：**
- 只需一次请求
- 首屏加载快
- 数据已经在 HTML 中

## 何时使用 Server Component vs Client Component？

### 使用 Server Component

✅ 获取数据（数据库、API）
✅ 访问敏感信息（API 密钥、令牌）
✅ 保持大型依赖在服务器上
✅ 减少 JavaScript 发送到浏览器

```typescript
// ✅ 好的做法
async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } })
  return user
}

export default async function UserProfile({ id }: { id: string }) {
  const user = await getUser(id)
  return <div>{user.name}</div>
}
```

### 使用 Client Component

✅ 需要使用 hooks（useState、useEffect）
✅ 需要事件监听器（onClick、onChange）
✅ 需要浏览器 API（localStorage、geolocation）
✅ 需要实时交互

```typescript
// ✅ 好的做法
"use client"

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({ postId, content })
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">发表评论</button>
    </form>
  )
}
```

## 混合使用的最佳实践

### 模式 1：Server Component 获取数据，传给 Client Component

```typescript
// app/blog/[slug]/page.tsx - Server Component
async function getPost(slug: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single()
  return data
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)

  return (
    <div>
      <h1>{post.title}</h1>
      {/* 传递数据给客户端组件 */}
      <CommentsSection postId={post.id} />
    </div>
  )
}

// components/comments-section.tsx - Client Component
"use client"

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // 只在客户端获取评论
    fetchComments()
  }, [postId])

  return <div>{comments.map(...)}</div>
}
```

### 模式 2：Server Action（服务器函数）

```typescript
// app/actions.ts
"use server"

export async function createComment(postId: string, content: string) {
  const supabase = createServerClient()

  const { data } = await supabase
    .from("comments")
    .insert([{ post_id: postId, content }])
    .select()

  return data
}

// components/comment-form.tsx - Client Component
"use client"

import { createComment } from "@/app/actions"

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 直接调用服务器函数，不需要 API 路由
    await createComment(postId, content)
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">发表评论</button>
    </form>
  )
}
```

## 总结

| 特性 | Server Component | Client Component |
|------|-----------------|-----------------|
| 数据获取 | ✅ 直接 | ❌ 需要 API |
| 访问数据库 | ✅ 是 | ❌ 否 |
| 使用 hooks | ❌ 否 | ✅ 是 |
| 用户交互 | ❌ 否 | ✅ 是 |
| 浏览器 API | ❌ 否 | ✅ 是 |
| 发送 JS 到浏览器 | ❌ 否 | ✅ 是 |
| 首屏加载 | ✅ 快 | ❌ 慢 |

## 你的项目中的应用

### 首页（app/page.tsx）
- **类型：** Server Component
- **数据获取：** 直接查询数据库
- **优势：** 首屏快速加载，包含完整数据

### 文章详情（app/blog/[slug]/page.tsx）
- **类型：** Server Component
- **数据获取：** 直接查询数据库
- **优势：** SEO 友好，初始数据完整

### 评论区（components/comments-section.tsx）
- **类型：** Client Component
- **数据获取：** useEffect + Supabase 客户端
- **原因：** 需要实时交互和状态管理

### 分类管理（app/categories/manage/page.tsx）
- **类型：** Client Component
- **数据获取：** useEffect + Supabase 客户端
- **原因：** 需要表单交互和状态管理

## 何时需要创建 API 路由？

虽然 RSC 很强大，但在以下情况下仍需要 API 路由：

1. **第三方客户端调用**
   ```typescript
   // 移动应用、桌面应用需要调用
   GET /api/categories
   ```

2. **需要 CORS 支持**
   ```typescript
   // 跨域请求需要 API 路由
   ```

3. **Webhook 处理**
   ```typescript
   // 支付服务、GitHub 等的 webhook
   POST /api/webhooks/payment
   ```

4. **第三方集成**
   ```typescript
   // 与外部服务集成
   ```

所以，你创建的 REST API 主要用于：
- 第三方应用调用
- 移动应用调用
- 需要 CORS 的场景
- 与 RSC 无关的特殊需求
