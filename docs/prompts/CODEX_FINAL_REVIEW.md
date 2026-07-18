# Codex Prompt：MPT v0.1 最终审查

不要新增大功能，只做验证和小范围修复。

读取：

- docs/product/02_Scope_and_Acceptance.md
- docs/development/13_Test_Plan.md
- docs/development/14_Deployment_Runbook.md
- docs/development/17_Demo_Data_and_Acceptance.md

执行：

```bash
git status
git branch --show-current
git diff --stat
git diff --check
npm run type:check
```

检查 package.json 后运行已有测试和构建。

逐项验证：

- 登录；
- 两个项目；
- 候选人 CRUD；
- 简历文本与文件可行路径；
- 画像保存；
- 双项目匹配；
- 硬性条件；
- 报告持久化；
- 人才库搜索；
- 三案例；
- AI fallback；
- 人工修正；
- 刷新后数据；
- 无敏感数据提交。

未经授权不要合并 main，不要 force push。
