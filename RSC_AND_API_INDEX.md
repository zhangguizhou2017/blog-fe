# 📚 RSC 和 API 完整学习指南

## 快速导航

### 🎯 我想快速了解 RSC

→ 阅读 [RSC_VISUAL.md](RSC_VISUAL.md) - 包含可视化流程图

### 🤔 我有具体的问题

→ 查看 [RSC_FAQ.md](RSC_FAQ.md) - 常见问题解答

### 📖 我想深入学习

→ 阅读 [RSC_GUIDE.md](RSC_GUIDE.md) - 完整的概念讲解

### 💻 我想看代码示例

→ 查看 [RSC_EXAMPLES.md](RSC_EXAMPLES.md) - 实际代码对比

### 🔄 我想理解数据流

→ 阅读 [RSC_FLOW.md](RSC_FLOW.md) - 详细的工作流程

### 🌐 我想调用 API

→ 查看 [API_GUIDE.md](API_GUIDE.md) - REST API 使用指南

### 🧪 我想测试 API

→ 访问 http://localhost:3000/api-demo - 交互式演示

---

## 核心概念速览

### 什么是 RSC？

RSC (React Server Components) 是 Next.js 15 的核心特性，允许你在服务器端直接运行 React 组件。

**关键优势：**

- ✅ 首屏加载快
- ✅ 减少 JavaScript 体积
- ✅ 直接访问数据库
- ✅ 更好的 SEO

### 两种组件类型

#### Server Component（默认）

```typescript
// 直接在服务器上执行
async function getPosts() {
  const data = await db.posts.findMany()
  return data
}


export default async function Home() {
  const posts = await getPosts()
  return <div>{posts.map(...)}</div>
}
```

#### Client Component

```typescript
// 在浏览器上执行
"use client"

export default function Home() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    // 需要通过 API 获取数据
    fetchPosts()
  }, [])

  return <div>{posts.map(...)}</div>
}
```

### 四种数据获取方式

| 方式             | 执行位置 | 何时执行  | 适用场景   |
| ---------------- | -------- | --------- | ---------- |
| Server Component | 服务器   | 页面加载  | 初始数据   |
| Client Component | 浏览器   | 组件挂载  | 交互式 UI  |
| Server Action    | 服务器   | 用户交互  | 表单提交   |
| API 路由         | 服务器   | HTTP 请求 | 第三方调用 |

---

## 你的问题的答案

### Q1: 如果用 RSC，我的组件都不用调接口了吗？

**A:** 不完全对。

- **Server Component**：不需要调接口（直接查询数据库）
- **Client Component**：需要调接口（通过 HTTP 请求）

**你的项目中：**

- 首页、文章详情：使用 Server Component，不需要调接口
- 评论区、分类管理：使用 Client Component，需要调接口

### Q2: 接口请求是怎么触发的？

**A:** 有四种触发方式：

1. **Server Component**：自动在服务器上执行

   ```typescript
   async function getPosts() {
     const data = await db.posts.findMany();
     return data;
   }
   ```

2. **Client Component**：在 useEffect 中触发

   ```typescript
   useEffect(() => {
     fetchPosts();
   }, []);
   ```

3. **Server Action**：在用户交互时触发

   ```typescript
   const handleSubmit = async () => {
     await createPost(title, content);
   };
   ```

4. **API 路由**：在 HTTP 请求时触发
   ```typescript
   GET / api / posts;
   ```

### Q3: 何时使用哪种方式？

**A:** 使用决策树：

```
需要获取数据？
├─ 是
│  ├─ 初始加载时获取？→ Server Component
│  ├─ 用户交互时获取？→ Client Component + useEffect
│  └─ 第三方调用？→ API 路由
└─ 否
   ├─ 需要 hooks？→ Client Component
   └─ 需要交互？→ Client Component
```

---

## 你的项目中的应用

### ✅ 首页 (app/page.tsx)

- **类型：** Server Component
- **数据获取：** 直接查询数据库
- **优势：** 首屏快，SEO 友好
- **流程：** 用户请求 → 服务器查询 → 返回完整 HTML

### ✅ 文章详情 (app/blog/[slug]/page.tsx)

- **类型：** Server Component
- **数据获取：** 直接查询数据库
- **优势：** 首屏快，SEO 友好
- **流程：** 用户请求 → 服务器查询 → 返回完整 HTML

### ✅ 评论区 (components/comments-section.tsx)

- **类型：** Client Component
- **数据获取：** useEffect + Supabase 客户端
- **原因：** 需要实时交互
- **流程：** 组件挂载 → useEffect 触发 → HTTP 请求 → 更新状态

### ✅ 分类管理 (app/categories/manage/page.tsx)

- **类型：** Client Component
- **数据获取：** useEffect + Supabase 客户端
- **原因：** 需要表单交互
- **流程：** 用户交互 → 调用 Supabase → 更新状态

### ✅ API 路由 (app/api/categories/route.ts)

- **类型：** REST API
- **用途：** 第三方应用调用
- **返回格式：** JSON
- **流程：** HTTP 请求 → 服务器查询 → 返回 JSON

---

## 创建的文件清单

### 📄 文档

| 文件                               | 内容           | 适合人群        |
| ---------------------------------- | -------------- | --------------- |
| [RSC_GUIDE.md](RSC_GUIDE.md)       | 核心概念讲解   | 想深入学习的人  |
| [RSC_EXAMPLES.md](RSC_EXAMPLES.md) | 代码对比示例   | 想看代码的人    |
| [RSC_FLOW.md](RSC_FLOW.md)         | 数据流工作原理 | 想理解流程的人  |
| [RSC_FAQ.md](RSC_FAQ.md)           | 常见问题解答   | 有具体问题的人  |
| [RSC_VISUAL.md](RSC_VISUAL.md)     | 可视化流程图   | 想快速了解的人  |
| [API_GUIDE.md](API_GUIDE.md)       | REST API 使用  | 想调用 API 的人 |

### 💻 代码

| 文件                                                                 | 功能           |
| -------------------------------------------------------------------- | -------------- |
| [app/api/categories/route.ts](app/api/categories/route.ts)           | 分类列表 API   |
| [app/api/categories/[id]/route.ts](app/api/categories/[id]/route.ts) | 分类详情 API   |
| [lib/api/categories.ts](lib/api/categories.ts)                       | API 客户端工具 |
| [app/api-demo/page.tsx](app/api-demo/page.tsx)                       | API 演示页面   |

---

## 学习路径

### 初级（1-2 小时）

1. 阅读 [RSC_VISUAL.md](RSC_VISUAL.md) 的前两部分
2. 查看 [RSC_FAQ.md](RSC_FAQ.md) 的 Q1-Q3
3. 访问 http://localhost:3000/api-demo 测试 API

### 中级（2-4 小时）

1. 完整阅读 [RSC_GUIDE.md](RSC_GUIDE.md)
2. 学习 [RSC_EXAMPLES.md](RSC_EXAMPLES.md) 的代码对比
3. 理解 [RSC_FLOW.md](RSC_FLOW.md) 的数据流

### 高级（4+ 小时）

1. 深入学习 [RSC_VISUAL.md](RSC_VISUAL.md) 的所有内容
2. 研究你的项目中的实际应用
3. 尝试创建新的 Server Component 或 Server Action
4. 为其他资源创建 API 路由

---

## 常见问题速答

### Q: Server Component 和 Client Component 的区别？

**A:** 执行位置不同。Server 在服务器上执行，Client 在浏览器上执行。

### Q: 为什么首页很快？

**A:** 因为首页是 Server Component，数据在服务器上获取，返回完整 HTML。

### Q: 为什么评论区需要加载？

**A:** 因为评论区是 Client Component，需要在浏览器上通过 HTTP 请求获取数据。

### Q: 什么时候需要创建 API 路由？

**A:** 当第三方应用、移动应用或需要 CORS 支持时。

### Q: Server Action 是什么？

**A:** 一种在服务器上执行的函数，可以从客户端直接调用，不需要创建 API 路由。

### Q: 如何选择使用哪种方式？

**A:** 使用决策树：初始数据 → Server Component，用户交互 → Client Component，表单提交 → Server Action，第三方调用 → API 路由。

---

## 性能对比

### 首屏加载时间

```
Server Component    ████████████████████ 最快
Server Action       ████████████████████ 最快
Client Component    ████████████░░░░░░░░ 中等
API 路由            ████████████░░░░░░░░ 中等
传统前后端分离      ████░░░░░░░░░░░░░░░░ 较慢
```

### 网络请求数

```
Server Component    █ 1 次
Server Action       █ 1 次
Client Component    ██ 2 次
API 路由            █ 1 次
传统前后端分离      ███ 3+ 次
```

---

## 下一步建议

### 立即可做的事

1. ✅ 访问 http://localhost:3000/api-demo 测试 API
2. ✅ 阅读 [RSC_FAQ.md](RSC_FAQ.md) 解答疑问
3. ✅ 查看 [RSC_VISUAL.md](RSC_VISUAL.md) 理解流程

### 短期目标（1-2 周）

1. 完整阅读所有文档
2. 理解你的项目中的 RSC 应用
3. 尝试创建新的 Server Component

### 长期目标（1-2 月）

1. 为其他资源创建 API 路由（文章、评论等）
2. 创建 Server Action 处理表单提交
3. 优化项目的性能

---

## 获取帮助

### 文档查询

- **概念问题** → [RSC_GUIDE.md](RSC_GUIDE.md)
- **代码问题** → [RSC_EXAMPLES.md](RSC_EXAMPLES.md)
- **流程问题** → [RSC_FLOW.md](RSC_FLOW.md)
- **具体问题** → [RSC_FAQ.md](RSC_FAQ.md)
- **可视化** → [RSC_VISUAL.md](RSC_VISUAL.md)
- **API 问题** → [API_GUIDE.md](API_GUIDE.md)

### 实践操作

- **测试 API** → http://localhost:3000/api-demo
- **查看代码** → app/api/categories/route.ts
- **查看工具** → lib/api/categories.ts

---

## 总结

| 问题           | 答案        | 文档                             |
| -------------- | ----------- | -------------------------------- |
| 都不用调接口？ | 不完全对    | [RSC_FAQ.md](RSC_FAQ.md#q1)      |
| 接口怎么触发？ | 四种方式    | [RSC_FAQ.md](RSC_FAQ.md#q2)      |
| 何时用哪种？   | 使用决策树  | [RSC_FAQ.md](RSC_FAQ.md#q5)      |
| 性能如何？     | Server 最快 | [RSC_VISUAL.md](RSC_VISUAL.md#4) |
| 我的项目？     | 已优化      | [RSC_VISUAL.md](RSC_VISUAL.md#8) |

---

**祝你学习愉快！** 🚀

如有任何问题，请参考相应的文档或访问 http://localhost:3000/api-demo 进行实践。
