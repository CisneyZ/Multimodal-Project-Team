# MVP 验收标准

## 阶段 1：Task Runtime + Model Gateway

必须全部通过：

1. Mock Provider 可以正常执行候选人结构化分析。
2. 至少一个真实 Provider 可以成功返回合法结构。
3. 非法 JSON 或不符合 Schema 的输出不会被当作成功结果。
4. API Key 无效时返回明确错误，不无限加载。
5. 请求超时时能够重试或切换备用 Provider。
6. Task 状态正确经历 `queued → running → completed/failed`。
7. 规则 fallback 启用时明确记录使用模式。
8. 调用日志包含 Provider、Model、延迟、重试、fallback 和错误码。
9. 日志不包含 API Key。
10. 默认日志不保存完整简历原文。
11. 原 Talent Agent 页面和未迁移流程仍可使用。
12. 类型检查通过，相关单元测试通过。

## 候选人结构化输出

至少包含：

```json
{
  "education": "",
  "school": "",
  "major": "",
  "workYears": null,
  "skills": [],
  "projectExperience": [],
  "missingInformation": [],
  "riskFlags": [],
  "evidence": [],
  "parseMode": "model | rule_fallback | mock"
}
```

## 阶段 3：飞书最小闭环

1. 飞书内可免登打开平台。
2. 机器人收到一条支持的指令后能够创建 Task。
3. 机器人快速返回“已创建”卡片，不阻塞等待模型。
4. 任务完成后卡片或消息能更新。
5. 失败时显示可理解错误，不暴露密钥和内部堆栈。
6. 待审核任务能够通知正确审核人。
7. 重复事件不会创建重复任务。
