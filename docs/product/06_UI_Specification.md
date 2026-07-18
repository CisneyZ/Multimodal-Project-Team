# MPT Platform v0.1 UI 规范

## 设计方向

```text
Dify 的信息架构与工具感
+
Apple 的留白、层级、材质和克制
```

关键词：简洁、可靠、轻量、清晰、高信息密度但不拥挤。

## 浅色主题

```css
--bg-page: #F5F5F7;
--bg-sidebar: rgba(255,255,255,0.82);
--bg-card: #FFFFFF;
--bg-subtle: #F2F2F7;
--text-primary: #1D1D1F;
--text-secondary: #6E6E73;
--border: rgba(0,0,0,0.08);
--primary: #007AFF;
--success: #34C759;
--warning: #FF9F0A;
--danger: #FF3B30;
```

## 字体

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Display",
  "SF Pro Text",
  "Inter",
  "PingFang SC",
  "Microsoft YaHei",
  sans-serif;
```

## 组件

- 大卡片圆角 18px；
- 普通卡片 14px；
- 按钮与输入框 10–12px；
- 页面最多一个主要蓝色按钮；
- 危险操作二次确认；
- 通过、缺失、不通过同时使用文字与颜色；
- 评分优先使用数字、进度条、表格与证据列表，不使用夸张仪表盘。

## 交互

- 保存成功使用轻量 Toast；
- 解析中显示具体步骤；
- 解析失败显示原因和继续路径；
- AI fallback 明确提示；
- 重新计算不得覆盖未保存修改。
