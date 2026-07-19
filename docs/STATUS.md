# 当前开发状态

更新时间：2026-07-18
当前分支：feature/talent-screening-v01
当前阶段：MPT v0.1 Phase 1 人才规则引擎开发中；旧 Talent MVP 保持兼容。

## 当前产品定位

项目正式定位为 **MPT平台**：

- Web 管理后台 + 飞书办公入口
- 面向公司内部使用
- 影视人才评测是第一个示例 Agent
- 后续扩展 Prompt 质检、视频质检、素材检索等 Agent

## 当前代码状态

- 已有 React + Vite + NestJS 项目。
- 已有 Talent Agent MVP 前后端闭环。
- 后端 `server/modules/talent/` 使用本地 JSON 持久化。
- 前端已有项目、候选人、测评、报告和人才库工作台。
- 已建立 GitHub 仓库与基础 Codex 接力文档。
- `.env` 被 `.gitignore` 排除，GitHub ZIP/clone 不包含真实配置。
- 当前技术栈使用 npm 和 `package-lock.json`。

## 当前唯一目标

完成 **Task Runtime + Model Gateway 最小闭环**，并只将“候选人简历结构化分析”接入新底座。

本阶段需要验证：

- Mock Provider 可运行
- 真实模型 Provider 可连接
- 结构化输出可校验
- 模型失败可重试或回退
- Task 状态可追踪
- 调用日志不泄露密钥和简历隐私
- 原 Talent Agent 功能不被破坏

## 当前禁止扩展

第一阶段完成前暂不做：

- 完整飞书接入
- 拖拽工作流编辑器
- PostgreSQL、Redis、BullMQ
- 微服务拆分
- 大量新 Agent 页面
- 大范围重构现有 Talent Agent

## 正在进行

- 已新增服务端确定性人才规则引擎（规则版本 `MPT_RULES_v0.4`）。
- 三项目、项目独立专业结论、人才等级、硬性条件、证据和分析历史接口正在接入验证。

## 下一步

1. 在新文件夹完成 clone、文档安装和本地环境配置。
2. 创建 `feature/task-model-gateway` 分支。
3. 让 Codex 读取 `AGENTS.md`、`PROJECT_MEMORY.md`、`docs/STATUS.md` 并执行 `prompts/CODEX_PHASE_1.md`。

## 已知阻塞

- 新电脑尚未配置真实 `.env`。
- 真实 Provider、Base URL、模型名称和 API Key 尚未完成连通性验证。
- 当前项目脚本偏 Windows PowerShell；在 macOS 上启动可能需要补充跨平台脚本或直接运行 Nest/Vite 命令。

## 关键决定

- 不推倒现有项目。
- 第一阶段先解决 Task Runtime 与 Model Gateway。
- 飞书是协作入口，不是平台核心或主数据库。
- 后续主数据使用 PostgreSQL，飞书多维表格作为协作视图。
- 所有模型调用统一经过 Model Gateway。
- 所有飞书调用统一经过 Integration/Tool。
- 两个 Codex 账号通过 Git、项目文档和 `docs/STATUS.md` 接力，不依赖聊天历史。

## 推荐的下一条 Codex 指令

读取 `AGENTS.md`、`PROJECT_MEMORY.md`、`docs/STATUS.md`，检查 Git 状态后执行 `prompts/CODEX_PHASE_1.md`。不要自动提交或推送。

## 建议分支名

```text
feature/task-model-gateway
```

## 建议 commit message

```text
docs: install MPT platform project memory and platform plan
```
