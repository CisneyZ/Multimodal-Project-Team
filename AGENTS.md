# Codex 接力开发规则

## 项目定位

本项目是 **MPT平台**，面向公司内部使用，Web 与飞书是两个入口。

平台目标是支持：

- 多个可配置 Agent
- 文本、文档、图片、音频、视频输入
- Agent Registry
- Workflow Engine
- Model Gateway / Model Provider
- Tool Registry
- Knowledge Base
- Task Runtime 与节点日志
- 人工审核
- 结构化输出
- 飞书免登、机器人、卡片、通知和多维表格同步

当前第一个示例 Agent 是「高阶影视人才智能评测与项目匹配 Agent」。平台核心代码不得与单一影视业务强耦合；具体业务规则应通过 Agent 配置、工作流、知识库、输入输出 Schema、工具绑定和模型绑定接入。

## 当前技术栈

- 前端：React 19、Vite 7、TypeScript、Tailwind CSS。
- 后端：NestJS 10、TypeScript、Node.js。
- 包管理：npm + `package-lock.json`。
- 当前持久化：本地 JSON 运行时数据。
- 生产规划：PostgreSQL、Redis/BullMQ、对象存储、Docker Compose。

## 每次开始开发

1. 执行：

```bash
git status
git branch --show-current
git log -5 --oneline
```

2. 优先读取：

```text
AGENTS.md
PROJECT_MEMORY.md
docs/STATUS.md
```

3. 只有涉及对应主题时再读取：

- 产品范围：`docs/PRODUCT_PLAN.md`
- 架构调整：`docs/ARCHITECTURE.md`
- 路线规划：`docs/ROADMAP.md`
- 飞书接入：`docs/FEISHU_INTEGRATION.md`
- 验收：`docs/MVP_ACCEPTANCE.md`
- 历史决定：`docs/DECISIONS.md`
- 安装、运行、构建和部署：`README.md`

不要默认扫描整个仓库，不读取 `node_modules`、构建产物、大型日志、媒体文件、运行时数据和真实隐私资料。

## 当前唯一优先任务

完成 **Task Runtime + Model Gateway 最小闭环**，并只迁移“候选人简历结构化分析”。具体实施见：

```text
prompts/CODEX_PHASE_1.md
```

该阶段完成前，不主动扩展完整飞书联动、拖拽工作流、新 Agent 大量页面、PostgreSQL、Redis、微服务或大范围重构。

## 架构边界

- `core/`：通用平台能力，不含具体影视业务规则。
- Agent/业务模块：具体 Agent 逻辑。
- `integrations/`：飞书、搜索、对象存储等外部系统适配。
- 业务代码不得直接调用具体模型 SDK，必须通过 Model Gateway。
- 业务代码不得散落调用飞书 API，必须通过 Feishu Integration 或 Tool。
- 运行时持久化必须通过 Repository 接口，方便未来从 JSON 替换为数据库。
- 不把业务规则写进前端页面组件或平台核心执行器。

## 安全要求

禁止读取、提交或输出：

- `.env` 中的完整密钥
- API Key、Token、App Secret、数据库密码
- 真实候选人简历和客户资料
- 本地上传媒体和运行时数据库

日志默认不保存完整简历原文和模型原始敏感输入。`.env` 只保存在每台电脑本地，不上传 GitHub。

## Git 规则

- 修改前检查远程状态。
- 有未提交修改时，不擅自 pull、reset、checkout 或覆盖。
- 禁止 `push --force`、`reset --hard`、`clean -fd`。
- 大功能使用独立分支，避免两台电脑同时直接修改 main。
- 未经明确要求，不自动 commit 或 push。

## 开发规则

- 修改前确认功能是否已经存在。
- 不重复实现，不删除无关功能。
- 只读取当前任务相关文件。
- 先做最小范围、可验证修改。
- 小任务只运行相关测试和类型检查。
- 只有涉及全局架构、依赖、构建或发布时才运行完整构建。
- 发生历史错误时，明确说明不是本次引入。

## 任务结束

必须输出：

1. 本次完成
2. 修改文件
3. 验证结果
4. Git 状态
5. 遗留问题
6. 下一步最多 3 项
7. 建议 commit message

同时精简更新 `docs/STATUS.md`，不写聊天流水账，不粘贴长日志或完整代码。
