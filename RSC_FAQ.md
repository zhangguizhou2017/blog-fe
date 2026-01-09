# RSC 常见问题解答

## Q1: 如果用 RSC，我的组件都不用调接口了吗？

**A:** 不完全对。需要分情况：

### ✅ 不需要调接口的情况

**Server Component（服务器组件）**
```typescript
// app/page.tsx - 默认是 Server Component
async function getPosts() {
  const supabase = createServerClient()
  // 直接查询数据库，不需要 HTTP 接口
  const { data } = await supabase.from("posts").select("*")
  return data
}

export default async function Home() {
  const posts = await getPosts()
  return <div>{posts.map(...)}</div>
}
```

### ❌ 需要调接口的情况

**Client Component（客户端组件）**
```typescript
// components/comments-section.tsx
"use client"

export function CommentsSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // 在浏览器上执行，需要通过接口获取数据
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

**为什么？**
- Client Component 在浏览器上执行
- 浏览器无法直接访问数据库
- 必须通过 HTTP 接口获取数据

---

## Q2: 接口请求是怎么触发的？

**A:** 有四种方式：

### 1. Server Component（自动触发）
```typescript
// 在服务器上自动执行，不需要手动触发
async function getUser(id: string) {
  const supabase = createServerClient()
  const { data } = await supabase.from("users").select("*").eq("id", id)
  return data
}

export default async function UserProfile({ id }: { id: string }) {
  const user = await getUser(id)  // 自动执行
  return <div>{user.name}</div>
}
```

### 2. Client Component + useEffect（挂载时触发）
```typescript
"use client"

export function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // 在组件挂载时自动触发
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("*")
      setUsers(data)
    }

    fetchUsers()
  }, [])  // 空依赖数组 = 只在挂载时执行

  return <div>{users.map(...)}</div>
}
```

### 3. Server Action（用户交互时触发）
```typescript
// app/actions.ts
"use server"

export async function deleteUser(id: string) {
  const supabase = createServerClient()
  await supabase.from("users").delete().eq("id", id)
}

// components/user-item.tsx
"use client"

import { deleteUser } from "@/app/actions"

export function UserItem({ user }: { user: User }) {
  const handleDelete = async () => {
    // 用户点击时触发
    await deleteUser(user.id)
  }

  return <button onClick={handleDelete}>删除</button>
}
```

### 4. API 路由（HTTP 请求时触发）
```typescript
// app/api/users/route.ts
export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase.from("users").select("*")
  return NextResponse.json({ data })
}

// 第三方应用调用
// GET http://localhost:3000/api/users
```

---

## Q3: Server Component 和 Client Component 的区别？

**A:** 核心区别在于执行位置：

| 特性 | Server Component | Client Component |
|------|-----------------|-----------------|
| 执行位置 | 服务器 | 浏览器 |
| 可以访问数据库 | ✅ 是 | ❌ 否 |
| 可以使用 useState | ❌ 否 | ✅ 是 |
| 可以使用 useEffect | ❌ 否 | ✅ 是 |
| 可以使用事件监听 | ❌ 否 | ✅ 是 |
| 发送 JS 到浏览器 | ❌ 否 | ✅ 是 |
| 首屏加载速度 | ⚡⚡⚡ 快 | ⚡⚡ 中等 |

**代码示例：**

```typescript
// ✅ Server Component（默认）
export default async function Home() {
  const posts = await getPosts()  // 直接查询数据库
  return <div>{posts.map(...)}</div>
}

// ❌ 错误：Server Component 不能使用 useState
export default async function Home() {
  const [count, setCount] = useState(0)  // ❌ 错误！
  return <div>{count}</div>
}

// ✅ Client Component
"use client"

export default function Home() {
  const [count, setCount] = useState(0)  // ✅ 正确
  return <div>{count}</div>
}

// ❌ 错误：Client Component 不能直接访问数据库
"use client"

export default function Home() {
  const supabase = createServerClient()  // ❌ 错误！
  const { data } = await supabase.from("posts").select("*")
  return <div>{data.map(...)}</div>
}
```

---

## Q4: 为什么有时候需要创建 API 路由？

**A:** 主要有以下几个原因：

### 1. 第三方应用调用
```typescript
// 移动应用、桌面应用需要调用
// GET http://localhost:3000/api/categories
```

### 2. CORS 支持
```typescript
// 跨域请求需要 API 路由
// 浏览器的 CORS 限制
```

### 3. Webhook 处理
```typescript
// 支付服务、GitHub 等的 webhook
// POST /api/webhooks/payment
```

### 4. 与外部服务集成
```typescript
// 需要特殊的 HTTP 头或认证
// POST /api/external-service
```

**你的项目中的例子：**
```typescript
// app/api/categories/route.ts
// 用于第三方应用调用
// 或者移动应用调用
```

---

## Q5: 什么时候用 Server Component，什么时候用 Client Component？

**A:** 简单判断方法：

### 使用 Server Component
```typescript
// ✅ 需要获取数据
async function getUser(id: string) {
  const user = await db.user.findUnique({ where: { id } })
  return user
}

export default async function UserProfile({ id }: { id: string }) {
  const user = await getUser(id)
  return <div>{user.name}</div>
}

// ✅ 需要访问敏感信息
export default async function Dashboard() {
  const apiKey = process.env.SECRET_API_KEY  // 只在服务器上可用
  return <div>Dashboard</div>
}

// ✅ 需要减少 JavaScript 体积
export default async function StaticPage() {
  const content = await getContent()
  return <div>{content}</div>
}
```

### 使用 Client Component
```typescript
// ✅ 需要使用 hooks
"use client"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ✅ 需要处理用户交互
"use client"

export function Form() {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理表单提交
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// ✅ 需要使用浏览器 API
"use client"

export function LocationComponent() {
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(...)
  }, [])

  return <div>Location</div>
}
```

---

## Q6: 如何在 Client Component 中获取数据？

**A:** 有两种方式：

### 方式 1：使用 Supabase 客户端（推荐）
```typescript
"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export function PostList() {
  const [posts, setPosts] = useState([])
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)

      setPosts(data)
    }

    fetchPosts()
  }, [])

  return <div>{posts.map(...)}</div>
}
```

### 方式 2：使用 API 路由
```typescript
"use client"

import { useEffect, useState } from "react"

export function PostList() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/api/posts")
      const { data } = await response.json()
      setPosts(data)
    }

    fetchPosts()
  }, [])

  return <div>{posts.map(...)}</div>
}
```

**对比：**
- Supabase 客户端：直接连接数据库，更快
- API 路由：多一层网络请求，但更灵活

---

## Q7: Server Action 是什么？

**A:** Server Action 是一种在服务器上执行的函数，可以从客户端直接调用。

```typescript
// app/actions.ts
"use server"

export async function createPost(title: string, content: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content }])
    .select()

  if (error) throw new Error(error.message)

  return data[0]
}

// components/post-form.tsx
"use client"

import { createPost } from "@/app/actions"

export function PostForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 直接调用服务器函数
      const post = await createPost(title, content)
      console.log("创建成功:", post)
    } catch (error) {
      console.error("创建失败:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button type="submit">创建</button>
    </form>
  )
}
```

**优势：**
- ✅ 不需要创建 API 路由
- ✅ 类型安全
- ✅ 自动处理序列化
- ✅ 代码更简洁

---

## Q8: 我的项目中哪些地方用了 RSC？

**A:** 你的项目中的应用：

### 1. 首页 (app/page.tsx)
```typescript
// Server Component
// 直接查询数据库获取文章列表
// 优势：首屏快，SEO 友好
```

### 2. 文章详情 (app/blog/[slug]/page.tsx)
```typescript
// Server Component
// 直接查询数据库获取文章内容
// 优势：首屏快，SEO 友好
```

### 3. 评论区 (components/comments-section.tsx)
```typescript
// Client Component
// 使用 useEffect + Supabase 客户端获取评论
// 原因：需要实时交互
```

### 4. 分类管理 (app/categories/manage/page.tsx)
```typescript
// Client Component
// 使用 useEffect + Supabase 客户端获取分类
// 原因：需要表单交互
```

### 5. API 路由 (app/api/categories/route.ts)
```typescript
// 用于第三方应用调用
// 或者移动应用调用
```

---

## Q9: 如何选择使用哪种方式？

**A:** 决策树：

```
需要获取数据？
├─ 是
│  ├─ 需要在初始加载时获取？
│  │  ├─ 是 → Server Component
│  │  └─ 否 → Client Component + useEffect
│  └─ 需要用户交互触发？
│     ├─ 是 → Server Action 或 API 路由
│     └─ 否 → Server Component
└─ 否
   ├─ 需要使用 hooks？
   │  ├─ 是 → Client Component
   │  └─ 否 → Server Component
   └─ 需要处理用户交互？
      ├─ 是 → Client Component
      └─ 否 → Server Component
```

---

## Q10: 性能对比

**A:** 不同方式的性能对比：

```
首屏加载时间：
Server Component ⚡⚡⚡ 最快
Server Action   ⚡⚡⚡ 最快
Client Component ⚡⚡ 中等
API 路由        ⚡⚡ 中等
传统前后端分离   ⚡ 较慢

网络请求数：
Server Component 1 次
Server Action   1 次
Client Component 2 次
API 路由        1 次
传统前后端分离   2+ 次

JavaScript 体积：
Server Component 最小
Server Action   小
Client Component 中等
API 路由        中等
传统前后端分离   最大
```

---

## 总结

| 问题 | 答案 |
|------|------|
| 都不用调接口？ | 不完全对，Client Component 需要 |
| 接口怎么触发？ | 自动、useEffect、用户交互、HTTP 请求 |
| 何时用 Server？ | 需要获取数据、访问敏感信息 |
| 何时用 Client？ | 需要 hooks、用户交互、浏览器 API |
| 何时用 API 路由？ | 第三方调用、CORS、Webhook |
| 何时用 Server Action？ | 表单提交、用户交互 |
