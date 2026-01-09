# 环境变量完全指南

## 🤔 为什么要使用 .env.local？

### 核心原因

1. **安全性** - 敏感信息（API密钥、数据库密码）不能提交到 Git
2. **灵活性** - 不同环境（开发、测试、生产）使用不同的配置
3. **团队协作** - 每个开发者可以有自己的本地配置
4. **最佳实践** - 业界标准做法，所有现代框架都支持

---

## 📁 Next.js 环境变量文件类型

Next.js 会按照**优先级顺序**加载环境变量文件：

| 文件名 | 用途 | 是否提交到 Git | 优先级 |
|--------|------|----------------|--------|
| `.env` | 所有环境的默认值 | ✅ 可以提交 | 最低 |
| `.env.local` | 本地开发环境（覆盖 .env） | ❌ **不提交** | 高 |
| `.env.development` | 开发环境专用 | ✅ 可以提交 | 中 |
| `.env.development.local` | 本地开发环境（覆盖 .env.development） | ❌ **不提交** | 高 |
| `.env.production` | 生产环境专用 | ✅ 可以提交 | 中 |
| `.env.production.local` | 本地生产环境测试 | ❌ **不提交** | 高 |
| `.env.test` | 测试环境专用 | ✅ 可以提交 | 中 |
| `.env.test.local` | 本地测试环境 | ❌ **不提交** | 高 |

### 优先级规则

```
.env.$(NODE_ENV).local > .env.local > .env.$(NODE_ENV) > .env
```

例如在开发环境（`NODE_ENV=development`）：
```
.env.development.local > .env.local > .env.development > .env
```

---

## 🔍 在哪里指定的？

### 1. Next.js 内置支持

Next.js 框架**自动**支持环境变量，无需额外配置。这是在 Next.js 源码中实现的。

查看 Next.js 文档：https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

### 2. .gitignore 配置

查看你的项目 [.gitignore](.gitignore:19-20)：

```gitignore
# env files
# (这里应该有 .env*.local 的配置)
```

**⚠️ 重要发现**：你的 `.gitignore` 中 `# env files` 下面是空的！

**需要添加**：
```gitignore
# env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 3. 在代码中使用

Next.js 会自动将环境变量注入到 `process.env` 中：

```typescript
// 服务端和客户端都可以访问（需要 NEXT_PUBLIC_ 前缀）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// 只能在服务端访问（没有 NEXT_PUBLIC_ 前缀）
const secretKey = process.env.SECRET_KEY
```

---

## 🌐 客户端 vs 服务端环境变量

### NEXT_PUBLIC_ 前缀的作用

| 前缀 | 访问位置 | 安全性 | 示例 |
|------|----------|--------|------|
| `NEXT_PUBLIC_` | 客户端 + 服务端 | ⚠️ 会暴露给浏览器 | `NEXT_PUBLIC_SUPABASE_URL` |
| 无前缀 | 仅服务端 | ✅ 安全，不会暴露 | `DATABASE_PASSWORD` |

### 示例

```env
# ✅ 可以在浏览器中访问（公开的）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# ❌ 只能在服务端访问（敏感的）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_PASSWORD=super_secret_password
```

### 在代码中的使用

```typescript
// ✅ 客户端组件可以访问
'use client'
export default function ClientComponent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL // ✅ 可以访问
  const secret = process.env.DATABASE_PASSWORD      // ❌ undefined
}

// ✅ 服务端组件可以访问所有
export default async function ServerComponent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL // ✅ 可以访问
  const secret = process.env.DATABASE_PASSWORD      // ✅ 可以访问
}
```

---

## 🚀 如何在不同环境切换？

### 方式一：使用不同的环境变量文件（推荐）

#### 项目结构
```
blog-fe/
├── .env                      # 默认值（可提交）
├── .env.local               # 本地开发（不提交）
├── .env.development         # 开发环境（可提交）
├── .env.production          # 生产环境（可提交）
└── .gitignore
```

#### .env（默认值，提交到 Git）
```env
# 公共配置，所有环境共享
NEXT_PUBLIC_APP_NAME=My Blog
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### .env.local（本地开发，不提交）
```env
# 你的本地 Supabase 项目
NEXT_PUBLIC_SUPABASE_URL=https://your-local-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
```

#### .env.development（开发环境，可提交）
```env
# 团队共享的开发环境
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
NEXT_PUBLIC_API_URL=https://dev-api.example.com
```

#### .env.production（生产环境，可提交）
```env
# 生产环境配置
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
NEXT_PUBLIC_API_URL=https://api.example.com
```

#### 自动切换

Next.js 会根据运行命令自动选择：

```bash
# 开发环境 - 使用 .env.development
npm run dev
# 加载顺序: .env.development.local > .env.local > .env.development > .env

# 生产构建 - 使用 .env.production
npm run build
# 加载顺序: .env.production.local > .env.local > .env.production > .env

# 生产运行
npm start
# 使用构建时的环境变量
```

### 方式二：使用部署平台的环境变量（生产环境推荐）

#### Vercel 部署

1. **在 Vercel 控制台配置**
   - 进入项目 Settings → Environment Variables
   - 添加环境变量：
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://prod.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = prod_key
     ```
   - 选择环境：Production / Preview / Development

2. **优先级**
   ```
   Vercel 环境变量 > .env.production > .env
   ```

3. **本地开发**
   ```bash
   # 拉取 Vercel 环境变量到本地
   vercel env pull .env.local
   ```

#### 其他平台

- **Netlify**: Site settings → Environment variables
- **Railway**: Project → Variables
- **Render**: Environment → Environment Variables
- **AWS Amplify**: App settings → Environment variables

### 方式三：使用 .env 文件切换（不推荐）

```bash
# 手动切换（不推荐，容易出错）
cp .env.development .env.local  # 切换到开发环境
cp .env.production .env.local   # 切换到生产环境
```

---

## 🛡️ 安全最佳实践

### 1. 正确配置 .gitignore

```gitignore
# 环境变量文件
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# 敏感文件
.env.secret
```

### 2. 使用 .env.example 作为模板

创建 [.env.example](.env.example) 文件（提交到 Git）：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 可选：其他配置
# NEXT_PUBLIC_API_URL=
# NEXT_PUBLIC_GA_ID=
```

**作用**：
- 告诉团队成员需要哪些环境变量
- 新成员可以复制并填入自己的值
- 不包含真实的敏感信息

### 3. 区分公开和私密变量

```env
# ✅ 公开的（可以暴露给浏览器）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # anon key 是公开的
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ❌ 私密的（只能在服务端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # service role key 是私密的
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
```

### 4. 检查是否泄露

```bash
# 检查 Git 历史中是否有敏感信息
git log --all --full-history -- .env.local

# 如果不小心提交了，需要从历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 📝 你的项目当前状态

### 当前文件

1. **[.env.example](.env.example)** ✅
   - 包含示例配置
   - 已提交到 Git（正确）

2. **[.env.local](.env.local)** ✅
   - 包含你的本地配置
   - 应该**不提交**到 Git

### 需要修复的问题

#### 问题 1: .gitignore 不完整

当前 [.gitignore](.gitignore:19-20) 中 `# env files` 下面是空的。

**需要添加**：
```gitignore
# env files
.env*.local
.env.local
```

#### 问题 2: 环境变量命名不一致

你的 [.env.local](.env.local) 使用：
```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

但代码中可能使用：
```typescript
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**需要统一**：
```env
NEXT_PUBLIC_SUPABASE_URL=https://ecytncserwxgvawkwtlx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_fwBqS_RbkLRbhkfCjQzeTg_BCyVosjQ
```

---

## 🔧 实际操作指南

### 本地开发

1. **复制示例文件**
   ```bash
   cp .env.example .env.local
   ```

2. **填入你的配置**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 部署到 Vercel

1. **推送代码到 Git**
   ```bash
   git add .
   git commit -m "Update config"
   git push
   ```

2. **在 Vercel 配置环境变量**
   - 进入项目设置
   - 添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 选择 Production 环境

3. **重新部署**
   - Vercel 会自动使用新的环境变量

### 团队协作

1. **新成员加入**
   ```bash
   git clone <repo>
   cp .env.example .env.local
   # 填入自己的 Supabase 项目配置
   npm install
   npm run dev
   ```

2. **添加新的环境变量**
   - 更新 `.env.example`（提交）
   - 更新自己的 `.env.local`（不提交）
   - 通知团队成员更新

---

## 🎯 推荐的项目配置

### 文件结构
```
blog-fe/
├── .env.example              # ✅ 提交（模板）
├── .env.local               # ❌ 不提交（本地配置）
├── .env.development         # ✅ 提交（开发环境）
├── .env.production          # ✅ 提交（生产环境）
└── .gitignore               # ✅ 提交（忽略规则）
```

### .env.example（模板）
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 应用配置
NEXT_PUBLIC_APP_NAME=My Blog
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### .env.local（本地开发）
```env
# 你的本地 Supabase 项目
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### .env.production（生产环境）
```env
# 生产环境 Supabase 项目
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### .gitignore
```gitignore
# 环境变量
.env*.local
.env.local
```

---

## 💡 常见问题

### Q1: 为什么我的环境变量不生效？

**A**: 可能的原因：
1. 忘记添加 `NEXT_PUBLIC_` 前缀（客户端组件）
2. 修改后没有重启开发服务器
3. 文件名拼写错误（`.env.local` 不是 `.env.locals`）
4. 环境变量中有空格（应该是 `KEY=value` 不是 `KEY = value`）

### Q2: 如何查看当前加载的环境变量？

**A**: 在代码中打印：
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Q3: 生产环境如何切换？

**A**:
- **方式一**：在部署平台（Vercel/Netlify）配置环境变量
- **方式二**：使用 `.env.production` 文件（提交到 Git）
- **推荐**：方式一，更安全

### Q4: 可以在 .env 文件中使用其他变量吗？

**A**: Next.js 不支持变量引用，但可以用 `dotenv-expand`：
```env
# ❌ Next.js 不支持
BASE_URL=https://api.example.com
API_URL=$BASE_URL/v1

# ✅ 需要安装 dotenv-expand
```

---

## 📚 参考资源

- [Next.js 环境变量文档](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel 环境变量指南](https://vercel.com/docs/concepts/projects/environment-variables)
- [dotenv 文档](https://github.com/motdotla/dotenv)

---

希望这份指南能帮你理解环境变量的机制！🚀
