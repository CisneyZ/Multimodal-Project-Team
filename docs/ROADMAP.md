# 路线图

## 阶段 0：文档与接力机制

状态：已完成基础版本，需要用本记忆包更新。

交付：

- 项目长期记忆
- Codex 接力规则
- 当前状态
- 决策记录

## 阶段 1：平台底座验证

目标：证明一个任务可以通过统一模型层稳定执行。

交付：

- Task Runtime
- Model Gateway
- Mock、OpenAI-compatible、DeepSeek Provider
- 模型连接测试接口
- 结构化输出校验
- 模型调用日志
- Talent 简历结构化分析迁移

完成条件见 `MVP_ACCEPTANCE.md`。

## 阶段 2：Agent Registry 与 Workflow Definition

交付：

- Agent 注册信息
- Agent 版本与启停
- 输入/输出 Schema
- Workflow 定义
- 节点执行记录
- Talent Agent 逐步迁移

不做拖拽编辑器。

## 阶段 3：飞书最小闭环

交付：

- 企业自建应用
- 飞书免登
- 机器人创建 Task
- 状态卡片
- 完成与失败通知
- 待审核卡片

## 阶段 4：Prompt 质检 Agent

交付：

- 规则知识库
- 任务类型判断
- 风险标签
- 修改建议
- 人工复核
- 结构化报告

目标：验证新 Agent 不需要复制整套平台代码。

## 阶段 5：生产化

交付：

- PostgreSQL + migration
- Redis + BullMQ
- 对象存储
- 权限和审计
- Docker Compose
- HTTPS 和监控

## 阶段 6：多模态能力

按需求逐步加入：

- 图片理解
- OCR（必要时）
- 音频转写
- 视频抽帧
- 镜头分析
- 素材检索
- 视频质检

## 开发原则

每一阶段必须形成可演示闭环后再进入下一阶段。不要同时铺开五个模块，否则会得到一座“看起来像机场、但没有飞机能起飞”的系统。
