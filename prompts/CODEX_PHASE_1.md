# Codex 第一阶段开发指令

请开始本项目的平台化改造第一阶段：**Task Runtime 与 Model Gateway 最小闭环**。

## 开始前

1. 执行：

```bash
git status
git branch --show-current
git log -5 --oneline
```

2. 读取：

```text
AGENTS.md
PROJECT_MEMORY.md
docs/STATUS.md
docs/ARCHITECTURE.md
docs/MVP_ACCEPTANCE.md
```

3. 检查与任务直接相关的现有文件，重点包括：

```text
server/modules/talent/
server/modules/v11/
server/app.module.ts
.env.example
package.json
```

4. 不扫描 `node_modules`、构建产物、媒体文件、运行时数据和无关前端组件。
5. 不删除、不重写现有 Talent Agent 功能。

## 本阶段目标

建立通用 Task Runtime 和统一 Model Gateway，并只将“候选人简历结构化分析”这一条流程接入新底座，以验证：

- 真实模型 API
- Mock Provider
- 超时、重试和 fallback
- 结构化输出
- 调用日志
- 可追踪 Task 状态

## 一、Task Runtime

建议建立：

```text
server/core/task/
├── task.types.ts
├── task.repository.ts
├── json-task.repository.ts
├── task.service.ts
└── task.module.ts
```

Task 至少包含：

- id
- agentId
- source：web | feishu | api | internal
- status：queued | running | waiting_review | completed | failed | cancelled
- currentStep
- inputRef 或安全输入摘要
- output
- errorCode
- errorMessage
- createdBy
- createdAt
- startedAt
- completedAt

当前阶段继续使用 `.runtime/` 下的本地 JSON，不引入 PostgreSQL、Redis 或队列，但必须通过 Repository 接口隔离。

## 二、Model Gateway

建议建立：

```text
server/core/model/
├── model.types.ts
├── model-provider.interface.ts
├── model-gateway.service.ts
├── model-router.service.ts
├── structured-output.service.ts
├── model-call-log.repository.ts
├── json-model-call-log.repository.ts
├── model.module.ts
└── providers/
    ├── mock.provider.ts
    ├── openai-compatible.provider.ts
    └── deepseek.provider.ts
```

所有 Provider 实现统一接口。

Model Gateway 至少支持：

- provider、model、baseUrl
- timeout
- retry
- fallback provider
- temperature
- Zod 结构化输出校验
- 错误分类
- 调用日志

调用日志至少记录：

- taskId
- agentId
- provider
- model
- status
- latencyMs
- retryCount
- fallbackUsed
- errorCode
- errorMessage
- createdAt

禁止记录完整 API Key。默认不要记录完整简历原文和完整敏感 Prompt。

## 三、模型连接测试接口

增加接口，例如：

```text
POST /api/model/test-connection
```

响应：

- success
- provider
- model
- latencyMs
- structuredOutputValid
- fallbackUsed
- errorCode
- errorMessage

不得返回 API Key。

## 四、接入 Talent 候选人分析

只改造候选人简历结构化分析流程，不迁移项目匹配、题目生成、评分和报告。

流程：

```text
创建 Task
↓
running
↓
Model Gateway
↓
Zod 校验 CandidateProfile
↓
保存结果
↓
completed
```

模型失败时可以使用现有规则分析作为 fallback，并明确记录：

```text
parseMode: model | rule_fallback | mock
```

所有方式均失败时，Task 进入 `failed`。

建议输出字段：

- education
- school
- major
- workYears
- skills
- projectExperience
- missingInformation
- riskFlags
- evidence
- parseMode

## 五、环境变量

更新 `.env.example`，不得写真实密钥：

```text
MODEL_DEFAULT_PROVIDER=
MODEL_DEFAULT_MODEL=
MODEL_FALLBACK_PROVIDER=
MODEL_TIMEOUT_MS=
MODEL_MAX_RETRIES=
OPENAI_COMPATIBLE_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=
```

尽量兼容现有变量，不破坏当前启动方式。

## 六、禁止事项

本阶段不得：

- 接入完整飞书
- 引入 PostgreSQL、Redis、BullMQ 或 LangGraph
- 创建可视化 Workflow 编辑器
- 大范围重构 Talent Service
- 增加大量新页面
- 将具体人才规则放入 `core/model` 或 `core/task`

## 七、验证

至少运行现有 TypeScript 类型检查，并补充可行的测试：

- Mock Provider 返回合法结构
- 非法模型输出被 Schema 拒绝
- Provider 失败触发 fallback
- Task 成功进入 completed
- 全部失败进入 failed
- 日志不包含 API Key

完成后：

1. 更新 `docs/STATUS.md`。
2. 列出修改文件。
3. 给出验证结果。
4. 说明遗留事项。
5. 给出建议 commit message。
6. 不自动 commit 或 push。
