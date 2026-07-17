# 项目规划

## 当前 MVP 目标

跑通一个可演示的 Agent 闭环：项目资料导入 → 规则解析确认 → 简历结构化 → 项目匹配 → 动态测评 → AI 初评/人工复核 → 评估报告 → 人才库。当前示例 Agent 为「高阶影视人才智能评测与项目匹配 Agent」。

## 核心模块

- Agent Registry：登记多个 Agent 的基础信息、输入输出 Schema 与启用状态。
- Workflow Engine：编排 Agent 节点、任务流转、人工审核与结构化输出。
- Model Provider：统一封装 Mock AI、OpenAI-compatible、DeepSeek 等 Provider。
- Tool Registry：登记可由 Agent 调用的内部工具和外部 API。
- Knowledge Base：保存项目规则、资料解析结果与可检索知识。
- Multimodal Input：逐步支持文本、文档、图片、音频、视频输入。
- Task Runner：记录任务执行状态、输入、输出和失败原因。
- Node Run Log：记录每个节点的运行证据与调试信息。
- Human Review：支持人工评分、复核、驳回与报告确认。
- Structured Output：统一输出报告、匹配结果、评分结果和人才标签。

## 近期任务

- 已完成：Talent Agent MVP 的前后端闭环与本地 JSON 持久化。
- 已完成：后台中控中的白色极简 Talent Agent 工作台 UI。
- 已完成：轻量化 Git/Codex 接力文档与忽略规则。
- 进行中：将单一 Talent MVP 逐步抽象为可配置多 Agent 平台骨架。
- 未开始：把项目规则、题目生成和报告模板进一步配置化。

## 中期任务

- 可视化工作流编辑器。
- 多租户与权限系统。
- 向量数据库或轻量检索索引。
- 更多模型 Provider。
- 多 Agent 协作。
- 音视频深度解析能力。
- 生产级任务队列与审计日志。

## 暂不开发

- 不做公开 SaaS 多租户商业化。
- 不做真实支付、合同、薪酬结算流程。
- 不做大规模媒体资产管理系统。
- 不在当前阶段引入复杂微服务拆分。
- 不把真实候选人简历或客户项目资料提交到仓库。

## 技术债务

- 当前 Talent Agent 仍有部分演示规则由后端 Mock 逻辑生成，需要后续抽象为 Agent 配置。
- 旧 V1.1 测评流程与新 Talent Agent 共存，后续需要整理公共评分/报告能力。
- 构建产物较大，后续可按路由或模块拆分前端 chunk。
- 当前运行时数据是本地 JSON，后续生产化需要替换为数据库和 migration。

## 架构决定

- 先保留 React + Vite + NestJS 栈，不新建 Next.js 项目。
- 当前 MVP 使用 Mock AI 保证无密钥也可完整演示。
- 本地运行数据、上传文件、报告导出和向量索引不通过 Git 同步。
- 平台核心保持通用，影视人才 Agent 只作为第一个业务示例。
