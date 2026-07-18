# Codex Prompt：Phase 1 核心数据与规则

先读取：

- README_FIRST.md
- docs/product/01_Product_Design.md
- docs/product/02_Scope_and_Acceptance.md
- docs/architecture/07_System_Architecture.md
- docs/architecture/08_Data_Model.md
- docs/development/17_Demo_Data_and_Acceptance.md

先执行：

```bash
git status
git branch --show-current
git log -5 --oneline
node -v
npm -v
```

本阶段只做：

- 复用现有 Talent 模块；
- 数据模型；
- 两个项目；
- 规则引擎；
- 硬性条件；
- 三条演示数据；
- 核心测试。

不要做 UI 大改、飞书、Workflow、微服务、动态试题或完整平台化。

完成后运行：

```bash
npm run type:check
git diff --check
```

汇报修改文件、三案例结果、测试结果、限制和建议提交信息。
