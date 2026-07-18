# MPT Platform v0.1 AI 架构

## 原则

```text
AI 可用
→ AI 提取 + 人工确认 + 规则评分

AI 不可用
→ 规则提取 + 人工确认 + 规则评分
```

AI 不得自由决定最终分数、硬性条件和推荐等级。

## AI 任务

- Resume Parser：结构化简历、字段证据和缺失信息；
- Evidence Extractor：定位评分证据；
- Report Writer：润色摘要、风险、追问和下一步。

Report Writer 不得修改总分、硬性条件和最终等级。

## Gateway

```ts
interface AIGateway {
  parseResume(input: ParseResumeInput): Promise<ParseResumeOutput>;
  generateReport(input: GenerateReportInput): Promise<GenerateReportOutput>;
}
```

Provider 可包括当前实际模型、兼容 Provider 和 Mock Provider。

## 输出校验

AI 输出必须经过：

1. Schema 或类型校验；
2. 字段清洗；
3. 枚举转换；
4. 长度限制；
5. 失败 fallback。

## 模式

```text
ai
rule_fallback
manual_corrected
```

## 隐私

发送模型前尽量去除电话、邮箱、身份证号和详细地址；日志不保存完整输入。
