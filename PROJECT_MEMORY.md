# Star.X 项目长期记忆

版本：2026-07-17

本文件是项目的**长期唯一事实来源**。当聊天记录、Codex 账号历史或个人记忆不一致时，以仓库代码、Git 历史和本文件为准。

## 一、项目名称与定位

中文名：**Star.X 多模态智能体工作台**  
英文名：**Star.X Multimodal Agent Workbench**

这是公司内部使用的可扩展多模态 Agent 平台。影视人才评测只是第一个示例 Agent，不允许平台核心与该单一业务强耦合。

产品由两个入口组成：

```text
Web 管理后台 + 飞书办公入口
```

飞书承担员工触达、身份、消息、卡片、审批和轻量协作；平台自身承担 Agent、任务、模型、工具、知识库、审核记录和主数据。

**飞书不是平台核心，也不是主数据库。**

## 二、用户与核心价值

主要用户：

- 普通使用者：提交任务、查看结果。
- 项目负责人：配置项目资料、查看任务和人才结果。
- 审核人员：处理人工复核、通过或驳回结果。
- 平台管理员：管理 Agent、模型、工具、权限和飞书连接。

核心价值：

1. 将不同业务 Agent 放到统一工作台运行。
2. 统一模型 API 调用、切换、重试、回退和成本追踪。
3. 统一网页与飞书发起的任务。
4. 对每一步执行保留状态、证据和错误原因。
5. 支持规则校验与人工审核，不让模型输出直接成为最终结论。

## 三、当前代码基础

现有仓库：`CisneyZ/Multimodal-Project-Team`

当前技术栈：

- 前端：React 19、Vite 7、TypeScript、Tailwind CSS。
- 后端：NestJS 10、TypeScript、Node.js。
- 当前数据：本地 JSON 运行时持久化。
- 当前业务模块：`server/modules/talent/`。
- 旧流程：`server/modules/v11/`。
- 当前示例 Agent：高阶影视人才智能评测与项目匹配 Agent。

当前代码可以继续演进，不新建 Next.js，不推倒重做。

## 四、六个核心平台对象

### 1. Agent

Agent 是可配置业务应用，至少包含：

- 基础信息和版本
- 输入 Schema
- 输出 Schema
- Workflow
- Knowledge
- Tools
- Model Profile
- 权限与发布状态

### 2. Workflow

Workflow 描述 Agent 的执行步骤和状态流转。第一版采用代码注册或配置定义，不做拖拽编辑器。

基础节点类型：

- INPUT
- PARSE
- KNOWLEDGE
- LLM
- TOOL
- CONDITION
- VALIDATE
- HUMAN_REVIEW
- OUTPUT

### 3. Task

任何来自 Web、飞书或 API 的运行都创建 Task。

基础状态：

```text
queued
running
waiting_review
completed
failed
cancelled
```

Task 至少记录：发起人、来源、Agent、输入、当前步骤、输出、错误、耗时和是否需要人工审核。

### 4. Knowledge

知识分三级：

- 平台知识库
- Agent 知识库
- 项目知识库

飞书文档、多维表格和上传文件是知识来源；解析后的平台知识才是 Agent 实际使用的数据。

### 5. Tool

所有外部能力统一包装为 Tool，通过 Tool Registry 注册。Agent 不直接调用飞书、搜索、图片、视频或文件 API。

### 6. Model Profile

Agent 绑定模型档案，而不是在业务代码中直接绑定某个模型名。

模型档案至少包括：Provider、Model、能力、Base URL、超时、重试、备用模型、结构化输出策略和费用规则。

## 五、最关键的 API 设计原则

所有模型请求必须经过 Model Gateway：

```text
业务 Agent
↓
Model Gateway
↓
Model Router
↓
Provider Adapter
↓
OpenAI-compatible / DeepSeek / Gemini / Claude / Mock
```

Model Gateway 必须支持：

- 统一调用接口
- 超时
- 重试
- Provider 错误分类
- 备用模型回退
- JSON Schema 或 Zod 校验
- 非法结构修复或明确失败
- 延迟、Token、费用和错误日志
- 禁止记录 API Key
- 默认不记录含简历隐私的完整原始内容

## 六、第一阶段的唯一目标

第一阶段只建设：

1. Task Runtime
2. Model Gateway
3. 模型连接测试
4. 将“候选人简历结构化分析”接入新底座

现有 Talent Agent 其他环节暂时保持原样。

验收重点：真实 API 可调用、返回结构可验证、失败可定位、备用方案可工作、原功能不被破坏。

## 七、飞书长期设计

飞书接入包含：

1. 企业自建应用与免登
2. 机器人接收文本和文件并创建 Task
3. 任务状态卡片
4. 人工审核卡片
5. 完成、失败、待审核通知
6. 多维表格作为协作视图
7. 飞书文档和多维表格同步至知识库

生产环境采用 HTTPS Webhook + 异步任务；本地可使用长连接开发。回调内不能直接等待大模型任务完成。

主数据关系：

```text
平台数据库 → 同步服务 → 飞书多维表格
```

## 八、上线架构

第一版采用模块化单体，不做微服务：

```text
Nginx
├── React 静态前端
└── NestJS API
    ├── PostgreSQL（生产化阶段）
    ├── Redis + BullMQ（异步任务阶段）
    └── S3 兼容对象存储
```

开发早期继续使用本地 JSON；通过 Repository 接口保证后续可替换。

## 九、明确不做

第一版不做：

- 公开 SaaS
- 多租户计费
- 可视化拖拽工作流
- 自研向量数据库
- 复杂多 Agent 自主讨论
- 大型媒体资产管理
- 微服务拆分
- 飞书全量复杂双向同步
- 自研基础模型

## 十、Agent 建设顺序

1. Talent Agent：保留并迁移到平台底座。
2. Prompt 质检 Agent：用于验证平台可扩展性。
3. 视频质检 Agent。
4. 素材检索 Agent。
5. 音视频理解和生成类 Agent。

## 十一、文档与协作规则

- 两个 Codex 账号不共享历史，仓库文档是接力依据。
- `AGENTS.md` 保存开发行为规则。
- `PROJECT_MEMORY.md` 保存长期稳定结论。
- `docs/STATUS.md` 只保存当前有效进度。
- `docs/DECISIONS.md` 记录重大决定与原因。
- 不自动 commit、push、merge，除非用户明确要求。
- 不上传 `.env`、真实密钥、简历、客户资料和运行数据。
