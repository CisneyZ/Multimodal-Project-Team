# MPT Platform v0.1 API 设计

## 通用响应

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Auth

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Dashboard

```text
GET /api/dashboard/summary
```

## Projects

```text
GET   /api/projects
GET   /api/projects/:projectId
PATCH /api/projects/:projectId
GET   /api/projects/:projectId/rules
```

## Candidates

```text
GET    /api/candidates
POST   /api/candidates
GET    /api/candidates/:candidateId
PATCH  /api/candidates/:candidateId
DELETE /api/candidates/:candidateId
PATCH  /api/candidates/:candidateId/status
```

## Resume

```text
POST /api/candidates/:candidateId/resume/upload
POST /api/candidates/:candidateId/resume/text
POST /api/candidates/:candidateId/resume/parse
```

AI 失败返回：

```json
{
  "analysisMode": "rule_fallback",
  "missingFields": ["fullTimeStatus"],
  "warnings": ["AI调用失败，已切换规则模式"]
}
```

## Profile

```text
GET /api/candidates/:candidateId/profile
PUT /api/candidates/:candidateId/profile
```

## Screening

```text
POST /api/candidates/:candidateId/screenings
GET  /api/screenings/:screeningRunId
GET  /api/candidates/:candidateId/screenings
```

## Reports

```text
POST /api/screenings/:screeningRunId/report
GET  /api/reports
GET  /api/reports/:reportId
POST /api/reports/:reportId/regenerate
```

## Demo Cases

```text
GET  /api/demo-cases
POST /api/demo-cases/:caseId/load
```

caseId：

```text
rl-high-match
caption-high-match
hard-fail
```

## 错误代码

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
RESUME_PARSE_FAILED
AI_PROVIDER_UNAVAILABLE
SCREENING_FAILED
REPORT_GENERATION_FAILED
INTERNAL_ERROR
```
