# MPT Platform v0.1 文档包

- 中文名称：MPT平台
- 英文名称：MPT Platform
- 英文全称：Multimodal Project Team Platform
- 当前业务模块：高阶影视人才筛选系统
- 文档版本：v0.1
- 更新时间：2026-07-18

## 核心闭环

```text
登录
→ 简历录入
→ 简历解析
→ 人才画像确认
→ 项目匹配
→ 硬性条件筛选
→ 评估报告
→ 保存人才库
```

## 文档目录

```text
docs/
├── product/
│   ├── 01_Product_Design.md
│   ├── 02_Scope_and_Acceptance.md
│   ├── 03_Information_Architecture.md
│   ├── 04_User_Flow.md
│   ├── 05_Page_Wireframes.md
│   └── 06_UI_Specification.md
├── architecture/
│   ├── 07_System_Architecture.md
│   ├── 08_Data_Model.md
│   ├── 09_API_Design.md
│   ├── 10_AI_Architecture.md
│   └── 11_Security_and_Privacy.md
├── development/
│   ├── 12_Development_Plan.md
│   ├── 13_Test_Plan.md
│   ├── 14_Deployment_Runbook.md
│   ├── 15_Version_Roadmap.md
│   ├── 16_Decision_Log.md
│   └── 17_Demo_Data_and_Acceptance.md
└── prompts/
    ├── CODEX_PHASE_1_CORE.md
    ├── CODEX_PHASE_2_UI.md
    ├── CODEX_PHASE_3_INTEGRATION.md
    └── CODEX_FINAL_REVIEW.md
```

## Codex 开工前读取顺序

1. `README_FIRST.md`
2. `docs/product/01_Product_Design.md`
3. `docs/product/02_Scope_and_Acceptance.md`
4. `docs/architecture/08_Data_Model.md`
5. `docs/architecture/09_API_Design.md`
6. 当前阶段对应 Prompt

冲突优先级：

```text
02_Scope_and_Acceptance.md
> 16_Decision_Log.md
> 01_Product_Design.md
> 其他文档
```
