# 平台架构

## 总体结构

```text
Web / Feishu / API
        ↓
API Gateway + Identity + Permission
        ↓
Task Runtime
        ↓
Agent Registry + Workflow Runtime
        ↓
Model Gateway / Tool Registry / Knowledge
        ↓
Provider 与外部系统
        ↓
Structured Output + Human Review
```

## 建议后端目录

```text
server/
├── core/
│   ├── task/
│   ├── model/
│   ├── agent/
│   ├── workflow/
│   ├── tool/
│   ├── knowledge/
│   └── execution/
├── agents/
│   ├── talent-agent/
│   └── prompt-review-agent/
├── integrations/
│   ├── feishu/
│   ├── storage/
│   └── search/
└── modules/
    ├── user/
    ├── project/
    └── review/
```

迁移应渐进进行。现有 `server/modules/talent/` 不要求立即移动，先通过通用接口接入底座。

## Task Runtime

职责：

- 创建和更新任务
- 状态机
- 当前步骤
- 输入输出引用
- 错误分类
- 发起来源
- 任务关联调用日志

第一版使用 JSON Repository；未来替换为 PostgreSQL Repository。

## Model Gateway

职责：

- Provider 统一接口
- 模型路由
- 超时与重试
- Fallback
- 结构化输出验证
- 错误分类
- 调用日志和成本估算

禁止在具体 Agent 服务中直接使用 Provider SDK。

## Workflow

第一版使用代码定义的有向步骤，不做可视化拖拽。每个节点接收统一上下文并输出部分状态。

建议上下文：

```ts
interface WorkflowContext {
  taskId: string;
  agentId: string;
  input: unknown;
  state: Record<string, unknown>;
  evidence: Evidence[];
  errors: WorkflowError[];
}
```

## Structured Output

所有关键结果需要 Schema：

- 服务端校验
- 失败明确标记
- 修复不能静默改变业务含义
- 保存 validated output 与必要证据
- raw output 仅在安全策略允许时短期保存

## 数据演进

### 当前

- 本地 JSON
- 本地上传文件

### 生产化阶段

- PostgreSQL：主数据、任务和审核
- Redis + BullMQ：异步任务
- S3 兼容对象存储：文件
- 可选向量检索服务：知识库

## 部署

第一版模块化单体：

```text
Docker Compose
├── Nginx
├── Web/API
├── Worker（引入队列后）
├── PostgreSQL
├── Redis
└── Object Storage
```
