# 电商智能导购 AI Agent — 接口文档

- 基础地址：`http://localhost:3001`
- 接口前缀：`/api`
- 数据格式：请求与响应均为 `application/json`（聊天接口为 SSE 事件流）
- 说明：当前版本未接入登录鉴权，所有接口默认使用内置测试用户（`mock-user`）

## 目录

- [健康检查](#健康检查)
- [商品模块](#商品模块)
- [购物车模块](#购物车模块)
- [订单模块](#订单模块)
- [会话模块](#会话模块)
- [AI 聊天模块](#ai-聊天模块)

---

## 健康检查

### GET /health

检查服务是否正常运行。

**响应示例**

```json
{ "status": "ok" }
```

---

## 商品模块

### GET /api/products

分页查询商品列表，支持按分类、价格区间、关键词组合筛选。

**Query 参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 20 | 每页数量 |
| category | string | 否 | - | 分类名称（如"耳机""跑鞋"） |
| minPrice | number | 否 | - | 最低价格 |
| maxPrice | number | 否 | - | 最高价格 |
| keyword | string | 否 | - | 关键词，模糊匹配商品名称和描述 |

**响应示例**

```json
{
  "items": [
    {
      "id": "827bdcb5-cc71-4aeb-b6bc-8bbadc506186",
      "name": "兰蔻 护肤I1",
      "categoryId": "bdd77517-1c32-47a4-9f51-3a888948498c",
      "category": "护肤",
      "brand": "兰蔻",
      "price": 330,
      "imageUrl": null,
      "description": "深层补水，改善干燥起皮",
      "stock": 101,
      "rating": 4.4,
      "features": ["维生素C", "神经酰胺"],
      "specs": [{ "id": "...", "productId": "...", "specName": "容量", "specValue": "30ml" }],
      "createdAt": "2026-09-15T03:57:12.285Z",
      "updatedAt": "2026-10-02T10:00:15.144Z"
    }
  ],
  "total": 90,
  "page": 1,
  "pageSize": 20
}
```

### GET /api/products/categories

获取所有商品分类（用于前端筛选栏展示），附带每个分类下的商品数量。

**响应示例**

```json
[
  {
    "id": "37d4083b-0e94-4c53-a19b-51abd871d470",
    "name": "手机",
    "createdAt": "2026-09-15T03:57:09.698Z",
    "_count": { "products": 9 }
  }
]
```

### GET /api/products/:id

根据商品 ID 查询单个商品详情，包含分类信息和规格参数列表。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 商品 ID |

**响应**：商品对象（结构同商品列表中的 item）；商品不存在时返回 `404`。

### POST /api/products/search

智能搜索商品（供 AI 导购调用），根据关键词/分类/价格/场景检索商品。当前走数据库条件查询，后续可替换为向量检索（RAG）。

**请求体**（所有字段均为可选）

```json
{
  "keyword": "降噪",
  "category": "耳机",
  "minPrice": 100,
  "maxPrice": 2000,
  "scene": "通勤"
}
```

**响应**：匹配的商品数组。

---

## 购物车模块

### GET /api/cart

查询当前用户的购物车列表，每项包含商品详情（名称、价格、图片等），按加入时间倒序。

**响应示例**

```json
[
  {
    "id": "48b955b9-2fc9-4a6e-b853-39f2ccaff307",
    "userId": "mock-user",
    "productId": "827bdcb5-cc71-4aeb-b6bc-8bbadc506186",
    "quantity": 2,
    "product": { "id": "...", "name": "兰蔻 护肤I1", "price": 330 },
    "createdAt": "2026-10-02T10:03:33.874Z",
    "updatedAt": "2026-10-02T10:03:33.874Z"
  }
]
```

### POST /api/cart/items

向购物车添加商品；如果该商品已在购物车中，则自动累加数量。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| productId | string (UUID) | 是 | 商品 ID |
| quantity | number | 否 | 数量，默认 1，最小为 1 |

**响应**：新增或更新后的购物车条目（含商品信息）。

### PATCH /api/cart/items/:id

修改购物车中某个条目的商品数量。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 购物车条目 ID |

**请求体**

```json
{ "quantity": 3 }
```

**响应**：更新后的购物车条目。

### DELETE /api/cart/items/:id

从购物车中删除指定条目。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 购物车条目 ID |

**响应**

```json
{ "ok": true }
```

---

## 订单模块

### GET /api/orders

查询当前用户的订单列表，按创建时间倒序排列，每条订单包含订单明细项。

**响应示例**

```json
[
  {
    "id": "f2a64dbf-4b28-4bb6-affa-4fa2d326135e",
    "userId": "mock-user",
    "totalAmount": 660,
    "status": "pending",
    "items": [
      {
        "id": "...",
        "orderId": "...",
        "productId": "...",
        "productName": "兰蔻 护肤I1",
        "price": 330,
        "quantity": 2
      }
    ],
    "createdAt": "2026-10-02T10:03:40.000Z",
    "updatedAt": "2026-10-02T10:03:40.000Z"
  }
]
```

**订单状态（status）取值**：`pending`（待支付）、`paid`（已支付）、`shipped`（已发货）、`completed`（已完成）、`cancelled`（已取消）。

### GET /api/orders/:id

根据订单 ID 查询订单详情（含明细项）。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 订单 ID |

**响应**：订单对象（结构同订单列表中的 item）；订单不存在时返回 `404`。

### POST /api/orders/preview

订单预览：根据当前购物车内容计算订单明细和总金额，**不创建订单**。

**请求体**：无（传空对象 `{}` 即可）。

**响应示例**

```json
{
  "items": [
    { "productId": "...", "productName": "兰蔻 护肤I1", "price": 330, "quantity": 2 }
  ],
  "totalAmount": 660
}
```

### POST /api/orders

创建订单：将当前购物车中的商品生成正式订单（状态为 `pending`），创建成功后**自动清空购物车**。

**请求体**：无（传空对象 `{}` 即可）。

**响应**：新创建的订单对象（含明细项）。

---

## 会话模块

### GET /api/conversations

查询当前用户的会话列表，按最近更新时间倒序。

**响应示例**

```json
[
  {
    "id": "c1e8xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "userId": "mock-user",
    "title": "新对话",
    "createdAt": "2026-10-02T10:00:00.000Z",
    "updatedAt": "2026-10-02T10:05:00.000Z"
  }
]
```

### POST /api/conversations

创建一个新会话（标题默认为"新对话"）。

**请求体**：无。

**响应**：新创建的会话对象。

### GET /api/conversations/:id/messages

查询指定会话下的全部聊天消息，按时间正序排列。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 会话 ID |

**响应示例**

```json
[
  {
    "id": "m1xxxxxx",
    "role": "user",
    "content": "推荐一款降噪耳机",
    "type": "text",
    "metadata": {},
    "createdAt": "2026-10-02T10:01:00.000Z"
  }
]
```

**消息角色（role）**：`user`（用户）、`assistant`（AI 助手）、`system`（系统）。

**消息类型（type）**：`text`（文本）、`product`（商品卡片）、`compare`（对比）、`cart`（购物车）、`error`（错误）、`thinking`（思考中）。

### DELETE /api/conversations/:id

删除指定会话及其下的所有消息。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 会话 ID |

**响应**

```json
{ "ok": true }
```

### POST /api/conversations/:id/title

根据会话中的对话内容，调用 LLM 智能生成一个简短的会话标题并保存（用于侧边栏展示）。仅在标题仍为默认值（"新对话"）时生效，不会覆盖已有标题。

> 说明：聊天接口（`GET /api/chat`）在首轮对话结束后会自动调用此逻辑生成标题，一般无需手动调用。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 会话 ID |

**响应**：更新后的会话对象；会话不存在时返回 `404`。

```json
{
  "id": "8485374e-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "userId": "mock-user",
  "title": "购买智能手表",
  "createdAt": "2026-10-03T04:46:09.401Z",
  "updatedAt": "2026-10-03T04:47:02.214Z"
}
```

### PATCH /api/conversations/:id/title

手动修改会话标题。

**路径参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| id | string (UUID) | 会话 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | string | 是 | 新标题，1-50 个字符 |

**响应**：更新后的会话对象。

---

## AI 聊天模块

### GET /api/chat

AI 导购聊天接口，以 **SSE（Server-Sent Events）** 流式返回回复。

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| payload | string (JSON) | 是 | JSON 字符串，格式为 `{"conversationId": "会话UUID（可选）", "message": "用户消息"}` |

**调用示例**

```
GET /api/chat?payload={"message":"推荐一款2000元以内的降噪耳机"}
```

**处理流程**

1. 保存用户消息到数据库（无 conversationId 时自动创建新会话）
2. 调用 LLM 识别购物意图（分类、价格、品牌、场景等）
3. 根据意图从数据库检索商品
4. 生成推荐理由并流式返回
5. 将 AI 回复存入数据库

**响应**：`text/event-stream` 事件流，每行一个事件：

```
data: {"type":"thinking","content":"正在理解你的需求..."}

data: {"type":"text","content":"为你找到 3 款相关商品："}

data: {"type":"product","content":"索尼 WH-1000XM5","metadata":{"productId":"..."}}

data: [DONE]
```

**事件类型**

| type | 说明 |
|---|---|
| thinking | AI 思考过程提示 |
| text | 文本回复 |
| product | 商品推荐卡片（metadata 中含 productId） |
| error | 错误信息 |
| [DONE] | 流结束标记 |

---

## 通用说明

**错误响应格式**

参数校验失败或服务端异常时，统一返回：

```json
{
  "error": true,
  "message": "错误描述",
  "code": "错误码"
}
```

**快速验证**

```bash
# 启动数据库
docker compose up -d postgres

# 导入种子数据（90 个商品、10 个分类）
pnpm db:seed

# 启动后端服务
pnpm --filter @eaa/server dev

# 测试商品列表接口
curl "http://localhost:3001/api/products?page=1&pageSize=5"
```
