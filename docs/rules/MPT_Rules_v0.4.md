# MPT v0.4 人才画像匹配规则说明

## 1. 系统输出

每份简历输出：

1. 人才等级；
2. 院校与专业判断；
3. 结构化人才画像；
4. 三个项目独立匹配结果；
5. 项目排序；
6. 匹配证据；
7. 不匹配原因；
8. 风险与证据可信度；
9. 缺失信息；
10. 人工追问；
11. 分析模式与规则版本。

## 2. 匹配结论

```text
HIGH_MATCH：高度匹配
MEDIUM_MATCH：中度匹配
LOW_MATCH：低度匹配
INSUFFICIENT_INFORMATION：信息不足，需人工复核
NOT_QUALIFIED：不符合人才准入标准
```

## 3. 分数建议

项目硬性条件全部通过且信息充分时：

```text
85-100 → HIGH_MATCH
70-84  → MEDIUM_MATCH
0-69   → LOW_MATCH
```

覆盖逻辑：

- 全局人才等级为 REJECT → NOT_QUALIFIED；
- 关键项目条件为 FAIL → NOT_QUALIFIED 或 LOW_MATCH，并明确阻断；
- 无FAIL但关键条件为MISSING/MANUAL_REVIEW → INSUFFICIENT_INFORMATION；
- 硬性条件通过后才按分数确定匹配等级。

## 4. AI边界

AI可以：

- 提取学校、专业、作品、经历；
- 抽取证据；
- 生成人才摘要；
- 生成追问和报告文字。

AI不能：

- 自由决定人才等级；
- 自由决定项目分数；
- 改写硬性条件状态；
- 将缺失信息推断为事实。
