# 基于 RAG 的多模态电商智能导购 AI Agent

项目采用 React Web 前端 + Node.js 后端 + RAG + 多模态 AI Agent 的技术路线，实现面向电商场景的智能导购系统。

## 技术栈

- **前端**：React + TypeScript + Vite + Ant Design + React Router + Zustand + Axios + SSE
- **后端**：Node.js + TypeScript + Fastify + Prisma + PostgreSQL + Qdrant
- **AI**：LLM + Embedding + Vision + ASR + TTS

## 项目结构

```
ecommerce-ai-agent/
├── apps/
│   ├── web/          # React 前端
│   └── server/       # Node.js 后端
├── packages/
│   ├── types/        # 共享类型
│   └── utils/        # 共享工具
├── prisma/
│   └── schema.prisma # 数据库模型
├── scripts/          # 数据导入、向量构建脚本
├── docker-compose.yml
└── .env.example
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动基础设施

```bash
docker-compose up -d
```

### 3. 初始化数据库

```bash
cp .env.example .env
pnpm db:migrate
pnpm db:seed
```

### 4. 构建向量索引

```bash
pnpm vector:build
```

### 5. 启动前后端

```bash
pnpm dev
```

- 前端：http://localhost:5173
- 后端：http://localhost:3001
