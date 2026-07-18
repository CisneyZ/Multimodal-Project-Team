# Codex Phase 1 最终指令：MPT 高阶影视人才画像与三项目匹配

你负责实现 MPT Platform v0.1 的 Phase 1。当前任务只做核心数据、人才画像、人才等级、三项目规则、分析结果结构和测试，不做前端大改。

## 一、开始前

在项目根目录执行：

```bash
git status
git branch --show-current
git log -5 --oneline
node -v
npm -v
```

当前分支必须为：

```text
feature/talent-screening-v01
```

如果不存在：

```bash
git switch -c feature/talent-screening-v01
git push -u origin feature/talent-screening-v01
```

不要在 main 或 feature/task-model-gateway 上继续开发本功能。

## 二、必须读取

按顺序读取：

1. AGENTS.md
2. PROJECT_MEMORY.md
3. docs/MPT_v0.1_README_FIRST.md
4. docs/product/01_Product_Design.md
5. docs/product/02_Scope_and_Acceptance.md
6. docs/architecture/07_System_Architecture.md
7. docs/architecture/08_Data_Model.md
8. docs/architecture/09_API_Design.md
9. docs/rules/README_RULES_v0.4.md
10. docs/rules/MPT_Rules_v0.4.md
11. docs/rules/MPT_高阶影视人才筛选规则库_v0.4.xlsx

Excel 是本阶段规则的最终来源。重点读取：

```text
01_全局人才准入
02_院校标签库
02A_院校别名库
03_项目专业库
04_项目硬性条件
05_项目评分矩阵
06_证据与置信度
07_规则测试矩阵
08_数据枚举与输出字段
09_分析报告结构
10_Codex开发验收
```

再读取现有：

- server/modules/talent
- Talent相关路由、服务、类型和测试
- 当前数据库或持久化实现
- shared 中相关类型
- package.json

不要扫描 node_modules、构建产物、日志、媒体文件和无关模块。

先用不超过15行说明：

- 当前Talent模块可复用能力；
- 当前持久化方式；
- 实施计划；
- 风险点。

然后直接开发，不等待确认。

## 三、v0.1最终业务范围

只实现：

```text
简历结构化数据
→ 人才等级
→ 人才画像
→ 三项目匹配
→ 分析报告数据
```

不实现：

- 试标题/试标；
- 培训；
- L3/L4场地；
- 入项审批；
- 最终录用；
- 飞书；
- Workflow；
- 动态试题；
- 视频分析；
- 大规模前端重构；
- 微服务、Redis、BullMQ。

## 四、三个项目

替换旧的两个项目，必须支持：

```text
SFT_MULTIMODAL
CAPTION_DIFF
FILM_CREATIVE_INTENT
```

中文名：

```text
SFT 多模态
Caption-Diff Caption
影视剧创作意图
```

同一候选人必须同时获得三个独立项目结果。

## 五、人才等级

实现：

```text
SENIOR
INTERMEDIATE
REJECT
MANUAL_REVIEW
```

规则：

- 中级或高级任意一档进入项目匹配；
- REJECT 不进入正式项目评分；
- MANUAL_REVIEW 暂缓结论并生成缺失信息；
- 人才等级必须与项目匹配分数分开存储。

中级：

- 专业影视艺术类院校，或985/211大学；
- 具体专业针对目标项目精准匹配；
- 不得仅凭学校层级通过。

高级：

- 图示高级候选院校或符合高级规则的顶级影视/综合院校；
- 项目专业精准匹配；
- 至少1部独立完成或主创参与的叙事类商业作品；
- 作品、本人岗位和职责可以确认。

院校别名和旧称必须标准化后判断。

## 六、项目专业判断

实现：

```text
EXACT
CONDITIONAL
EXCLUDED
UNKNOWN
```

专业结论必须按项目独立判断。

例如：

- 数字媒体艺术在SFT可以条件/精准匹配；
- 在Caption与影视剧创作意图中可被明确排除；
- 不能建立一个全局“数字媒体永远通过/永远失败”的规则。

## 七、硬性条件

实现：

```text
PASS
FAIL
MISSING
MANUAL_REVIEW
NOT_APPLICABLE
```

关键原则：

- 未提到不等于FAIL；
- MISSING必须生成追问；
- FAIL可以阻断项目结论；
- 项目条件按Excel `04_项目硬性条件`实现；
- 不实现试题、培训和场地条件。

## 八、人才画像

至少支持：

- 姓名、学历、学校、学院、专业、工作年限、当前岗位；
- 影视创作经历；
- 剪辑和影视制作；
- 阅片、拉片与影视分析；
- 构图、影调、风格、视听语言；
- 编剧、导演、摄影、影视美术；
- 视频文字描述标注；
- 视频质检和复核；
- 文字表达；
- 项目和作品；
- 每个作品中的本人岗位、职责、周期和结果；
- 全职状态、支持月份、到岗信息；
- 缺失字段；
- 字段来源；
- 是否人工修正。

## 九、证据模型

实现证据等级：

```text
A / B / C / D
```

实现事实类型：

```text
FACT
INFERENCE
MISSING
MANUAL
```

每个评分维度必须输出：

- score
- maxScore
- evidenceText
- evidenceGrade
- evidenceType
- reason
- sourceRef

禁止只返回一个分数和空泛评价。

## 十、匹配结果

实现：

```text
HIGH_MATCH
MEDIUM_MATCH
LOW_MATCH
INSUFFICIENT_INFORMATION
NOT_QUALIFIED
```

建议基础分：

```text
85-100 → HIGH_MATCH
70-84  → MEDIUM_MATCH
0-69   → LOW_MATCH
```

覆盖规则：

1. talentLevel == REJECT  
   → NOT_QUALIFIED

2. 关键项目条件存在 FAIL  
   → NOT_QUALIFIED 或 LOW_MATCH，必须保存阻断原因

3. 无FAIL但关键条件存在 MISSING/MANUAL_REVIEW  
   → INSUFFICIENT_INFORMATION

4. 所有关键条件PASS  
   → 根据分数确定匹配等级

保存：

- totalScore
- baseMatchLevel
- finalMatchLevel
- requirementStatus
- blockingReasons
- missingItems
- riskItems
- projectRank

## 十一、分析记录

每次重新分析创建新记录，不覆盖历史结果。

分析模式：

```text
AI_ASSISTED
RULE_FALLBACK
MANUAL_CORRECTED
```

相同结构化输入必须得到相同分数、排序和条件状态。

## 十二、报告数据结构

按Excel `09_分析报告结构`定义报告对象，至少包含：

- candidateSummary
- talentLevel
- talentLevelReasons
- candidateProfile
- rankedProjectMatches
- matchEvidence
- mismatchReasons
- risks
- missingInformation
- followUpQuestions
- nextAction
- ruleVersion
- analysisMode
- generatedAt

本阶段只需实现报告数据和模板生成，不做复杂报告UI。

不得生成：

- 试题；
- 已录用；
- 已入项；
- 培训结论。

## 十三、演示和测试

严格实现Excel `07_规则测试矩阵`。

至少覆盖：

- SFT高级高匹配；
- SFT数字媒体边界；
- 985非影视专业不准入；
- Caption两条路径同时满足；
- Caption数字媒体排除；
- 摄影/后期但文字能力缺失；
- 影视剧创作意图高级人才；
- 短视频运营不符合；
- 普通综合大学广编边界；
- 未说明全职为MISSING；
- 高级院校但商业作品职责不明；
- 同一专业跨项目不同结果；
- 相同输入确定性；
- 人工修正创建新分析记录。

同时验证：

- 单维度分数不低于0且不超过maxScore；
- 项目总分0-100；
- 三个项目满分配置分别等于100；
- REJECT不进入正式项目排序；
- 相同输入两次结果一致。

## 十四、实现约束

- 优先复用现有Talent模块；
- 规则放在独立业务模块；
- 不在React页面计算；
- 不让LLM自由打分；
- 不重写整个项目；
- 不切换数据库，除非现有方案完全无法持久化；
- 不读取或提交.env；
- 不提交真实简历、日志、上传文件；
- 不自动合并main；
- 不force push。

## 十五、验证

完成后执行：

```bash
npm run type:check
git diff --check
```

检查package.json后运行与本阶段相关的测试。

最多三轮：

```text
实现 → 检查 → 修复
```

Phase 1完成后停止，不继续做Phase 2。

## 十六、最终汇报

输出：

1. 当前分支；
2. 实际完成内容；
3. 修改文件；
4. 数据模型；
5. 三项目规则实现位置；
6. 人才等级与院校专业判断；
7. 测试结果；
8. 所有演示案例结果；
9. 已知限制；
10. 建议commit message。

未经额外授权不要自动提交和推送。
