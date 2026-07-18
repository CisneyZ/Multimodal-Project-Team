# MPT Platform v0.1 信息架构

## 左侧导航

```text
首页
项目管理
人才库
人才筛选
评估报告
系统设置
```

## 页面树

```text
登录
└── 首页
    ├── 项目管理
    │   ├── 项目列表
    │   └── 项目详情
    ├── 人才库
    │   ├── 候选人列表
    │   ├── 新增候选人
    │   └── 候选人详情
    │       ├── 概览
    │       ├── 人才画像
    │       ├── 项目匹配
    │       ├── 评估报告
    │       └── 操作记录
    ├── 人才筛选
    │   ├── Step 1 简历录入
    │   ├── Step 2 画像确认
    │   ├── Step 3 项目匹配
    │   └── Step 4 评估报告
    ├── 评估报告
    │   ├── 报告列表
    │   └── 报告详情
    └── 系统设置
        ├── 账号设置
        ├── AI配置
        └── 规则版本
```

## URL 建议

```text
/login
/dashboard
/projects
/projects/:projectId
/candidates
/candidates/new
/candidates/:candidateId
/screening/new
/screening/:candidateId/profile
/screening/:candidateId/results
/screening/:candidateId/report
/reports
/reports/:reportId
/settings
```

## 页面状态

所有数据页必须支持：

- loading
- empty
- error
- permission denied
- success
