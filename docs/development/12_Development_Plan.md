# MPT Platform v0.1 开发计划

## Phase 0：仓库与文档

- 确认安装、类型检查和启动；
- 保存品牌改名；
- 放入文档；
- 识别可复用 Talent 模块。

## Phase 1：核心数据与规则

- 候选人、画像、项目、筛选、证据、报告数据结构；
- 两个内置项目；
- 规则引擎；
- 硬性条件；
- 三条演示数据；
- 核心单元测试。

## Phase 2：候选人与简历

- 候选人 CRUD；
- 文本录入；
- 文件上传与提取；
- AI/规则解析；
- 画像编辑与字段来源；
- fallback。

## Phase 3：四步 UI

- 简历录入；
- 画像确认；
- 双项目匹配；
- 报告；
- 返回修改并重算；
- 三个案例入口；
- loading、empty、error。

## Phase 4：人才库与报告管理

- 搜索筛选；
- 候选人详情；
- 历史筛选与报告；
- 招聘状态；
- Dashboard；
- 操作日志。

## Phase 5：联调与部署

```bash
npm run type:check
git diff --check
```

运行项目已有测试和构建。

推荐分支：

```text
feature/talent-screening-v01
```

推荐提交：

```text
docs: add MPT v0.1 product and architecture specifications
feat(talent): add screening rules and persistent data model
feat(talent): add resume parsing and editable candidate profile
feat(talent): add four-step screening workflow
feat(talent): add talent pool and report management
fix(talent): stabilize screening workflow and fallback
```
