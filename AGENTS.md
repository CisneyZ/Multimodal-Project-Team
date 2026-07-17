# Codex 接力开发规则

## 项目定位

本项目是一个可扩展的多模态 Agent 平台骨架。平台需要支持多个可配置 Agent、文本/文档/图片/音频/视频输入、Agent 工作流、模型 Provider、工具注册、知识库、任务运行记录、节点日志、人工审核与结构化输出。

当前第一个示例 Agent 是「高阶影视人才智能评测与项目匹配 Agent」。平台核心代码不得与单一影视业务强耦合；具体业务规则应通过 Agent 配置、工作流配置、知识库、输入 Schema、输出 Schema、工具绑定和模型绑定接入，不得硬编码到页面组件或平台核心执行器中。

## 当前技术栈

- 前端：React 19、Vite 7、TypeScript、Tailwind CSS、lucide-react。
- 后端：NestJS 10、TypeScript、Node.js。
- 数据：当前 MVP 使用本地 JSON 运行时数据；V1.1 旧流程预留 Feishu Bitable/LLM 配置。
- 包管理：npm + `package-lock.json`。

## 每次开始开发

1. 先执行 `git status` 和 `git branch --show-current`。
2. 只优先读取 `AGENTS.md` 与 `docs/STATUS.md`。
3. 根据 `docs/STATUS.md` 判断当前任务和下一步。
4. 只检查与当前任务直接相关的目录和代码。
5. 不要默认读取 `README.md`、`docs/PLANS.md`、大型日志、媒体文件、构建产物、依赖目录或运行时数据。
6. 涉及架构规划、新大型模块时再读 `docs/PLANS.md`。
7. 涉及安装、启动、构建、部署或环境故障时再读 `README.md`。

## 开发约束

1. 不要重复实现已经存在的功能。
2. 不得擅自删除已有业务功能或大范围重构。
3. 业务规则不得散落在前端页面中。
4. 数据库结构变更必须保留 migration；本地运行数据不通过 Git 同步。
5. 不得提交 API Key、Token、密码、真实简历、隐私文件或本地上传媒体。
6. 不得在代码中硬编码密钥。
7. 小修改只运行类型检查和相关测试。
8. 只有涉及全局架构、依赖、构建或发布时才运行完整构建。
9. 出现错误时，说明是历史问题还是本次修改引入的问题。

## Codex 任务结束时必须

1. 简短总结修改内容。
2. 更新 `docs/STATUS.md`，只保留当前有效状态。
3. 记录下一步最多 5 项任务和仍存在的阻塞。
4. 执行 `git status`。
5. 给出建议的 Git commit message。
6. 不自动 commit 或 push，除非用户明确要求。

## 常用接力指令模板

普通接力开发：先读取根目录 `AGENTS.md` 和 `docs/STATUS.md`，执行 `git status` 与 `git branch --show-current`。根据 STATUS 继续当前未完成任务，只检查与本次任务直接相关的代码；除非涉及架构规划，否则不读 `docs/PLANS.md`；除非涉及安装、启动、构建或部署，否则不读 `README.md`。完成后运行相关检查，更新 `docs/STATUS.md`，并给出建议 commit message。

新功能开发：先读取 `AGENTS.md`、`docs/STATUS.md`，必要时读取 `docs/PLANS.md`。给出不超过 8 行的实施计划后直接开发，确保新功能通过平台现有接口扩展，不把具体业务规则写入平台核心。

故障排查：先读取 `AGENTS.md` 和 `docs/STATUS.md`，根据报错定位相关文件，不默认扫描整个项目。优先复现问题，记录最小报错信息，修复后运行最小范围验证，且不输出完整密钥、Token、连接串或个人数据。
