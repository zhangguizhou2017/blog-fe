# REST API 使用指南

## 概述

这个项目现在包含了完整的 REST API 端点，用于分类管理。所有 API 都遵循统一的响应格式。

## API 端点

### 1. 获取所有分类

```bash
GET /api/categories
```

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "id": "uuid-1",
      "name": "技术",
      "slug": "technology",
      "description": "技术相关文章"
    },
    {
      "id": "uuid-2",
      "name": "生活",
      "slug": "life",
      "description": "生活相关文章"
    }
  ],
  "msg": "获取分类列表成功"
}
```

### 2. 获取单个分类

```bash
GET /api/categories/:id
```

**参数：**
- `id` (string, required) - 分类 ID

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "id": "uuid-1",
    "name": "技术",
    "slug": "technology",
    "description": "技术相关文章"
  },
  "msg": "获取分类成功"
}
```

### 3. 创建分类

```bash
POST /api/categories
Content-Type: application/json

{
  "name": "新分类",
  "description": "分类描述（可选）"
}
```

**请求体：**
- `name` (string, required) - 分类名称
- `description` (string, optional) - 分类描述

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "id": "uuid-3",
    "name": "新分类",
    "slug": "new-category",
    "description": "分类描述"
  },
  "msg": "分类创建成功"
}
```

### 4. 更新分类

```bash
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "更新后的名称",
  "description": "更新后的描述"
}
```

**参数：**
- `id` (string, required) - 分类 ID

**请求体：**
- `name` (string, required) - 分类名称
- `description` (string, optional) - 分类描述

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "id": "uuid-1",
    "name": "更新后的名称",
    "slug": "updated-name",
    "description": "更新后的描述"
  },
  "msg": "分类更新成功"
}
```

### 5. 删除分类

```bash
DELETE /api/categories/:id
```

**参数：**
- `id` (string, required) - 分类 ID

**响应示例：**
```json
{
  "code": 200,
  "msg": "分类删除成功"
}
```

## 错误响应

所有错误响应都遵循以下格式：

```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "错误信息描述"
}
```

**常见错误码：**
- `400` - 请求参数验证失败
- `404` - 资源不存在
- `500` - 服务器错误

## 客户端使用示例

### 使用 API 工具函数

项目提供了 `lib/api/categories.ts` 工具函数，简化 API 调用：

```typescript
import { categoryApi } from "@/lib/api/categories"

// 获取所有分类
const response = await categoryApi.getAll()
if (response.code === 200) {
  console.log(response.data)
}

// 创建分类
const createResponse = await categoryApi.create("新分类", "描述")
if (createResponse.code === 201) {
  console.log("创建成功", createResponse.data)
}

// 更新分类
const updateResponse = await categoryApi.update("id", "新名称", "新描述")

// 删除分类
const deleteResponse = await categoryApi.delete("id")
```

### 使用 fetch 直接调用

```typescript
// 获取所有分类
const response = await fetch("/api/categories")
const result = await response.json()

// 创建分类
const createResponse = await fetch("/api/categories", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "新分类",
    description: "描述",
  }),
})
const createResult = await createResponse.json()
```

## 测试 API

### 使用 cURL

```bash
# 获取所有分类
curl http://localhost:3000/api/categories

# 创建分类
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"新分类","description":"描述"}'

# 更新分类
curl -X PUT http://localhost:3000/api/categories/uuid-1 \
  -H "Content-Type: application/json" \
  -d '{"name":"更新名称","description":"新描述"}'

# 删除分类
curl -X DELETE http://localhost:3000/api/categories/uuid-1
```

### 使用 Postman

1. 导入以下请求集合
2. 设置环境变量 `base_url` = `http://localhost:3000`
3. 运行请求

## 演示页面

访问 `http://localhost:3000/api-demo` 查看 API 的实时演示页面。

## 文件结构

```
app/
├── api/
│   └── categories/
│       ├── route.ts          # GET (列表) 和 POST (创建)
│       └── [id]/
│           └── route.ts      # GET (详情)、PUT (更新)、DELETE (删除)
└── api-demo/
    └── page.tsx              # API 演示页面

lib/
└── api/
    └── categories.ts         # API 客户端工具函数
```

## 响应格式说明

所有 API 响应都遵循统一的格式：

```typescript
interface ApiResponse<T> {
  code: number           // HTTP 状态码
  data?: T              // 响应数据（可选）
  msg: string           // 响应消息
  error_code?: string   // 错误代码（仅在错误时）
}
```

## 下一步

你可以：
1. 为其他资源（文章、评论等）创建类似的 API 端点
2. 添加认证和授权检查
3. 添加请求日志和监控
4. 创建 API 文档（使用 Swagger/OpenAPI）
