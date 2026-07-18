# MPT Platform v0.1 系统架构

## 推荐架构

```text
Web Client
→ HTTP API
→ Auth / Candidate / Project / Screening / Report / File 模块
→ Repository
→ Database

Candidate / Report
→ AI Gateway
→ Provider

Screening
→ Rules Engine
```

## 模块边界

- Auth：登录、当前用户、角色；
- Candidate：候选人、画像、招聘状态；
- Resume/File：上传、校验、文本提取；
- Project：项目、规则、规则版本；
- Screening：评分、硬性条件、证据、结果；
- Report：生成、保存、列表、打印；
- AI Gateway：统一调用、超时、校验和 fallback。

## 技术取舍

- v0.1 使用模块化单体；
- 优先复用当前数据库；
- 开发可 SQLite，正式建议 PostgreSQL；
- 文件先可使用受控本地目录；
- 不为了“平台感”引入微服务。

## 依赖原则

```text
Route → Service → Repository → Database
Screening Service → Rules Engine
Candidate/Report Service → AI Gateway
```

禁止：

- React 页面计算最终业务分；
- 业务服务直接调用特定模型厂商；
- 通用 core 写死人才项目规则。
