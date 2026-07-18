# MPT Platform MVP

本仓库是一个 React + Vite + NestJS 的轻量化 Agent 平台项目。MPT平台（Multimodal Project Team Platform）当前可运行示例为「高阶影视人才智能评测与项目匹配 Agent」，入口集成在后台中控内，用于演示项目资料导入、简历结构化、项目匹配、动态测评、人工复核、报告生成与人才库闭环。

## 当前技术栈

- 前端：React 19、Vite 7、TypeScript、Tailwind CSS、lucide-react。
- 后端：NestJS 10、TypeScript、Node.js。
- 数据：当前 Talent MVP 使用 `.runtime/talent-mvp-data.json` 本地 JSON 持久化；V1.1 旧流程保留 Feishu Bitable/LLM 可选集成。
- 包管理：npm，依赖锁定文件为 `package-lock.json`。

## 目录结构

```text
client/                 前端应用
client/src/pages/       页面与后台工作台
client/src/api/         前端 API 封装
server/                 NestJS 后端
server/modules/talent/  Talent Agent MVP 后端模块
server/modules/v11/     旧 V1.1 测评流程
shared/                 前后端共享类型
deployment/             Windows 启动/构建脚本
scripts/                项目辅助脚本
docs/                   接力状态与规划文档
```

## 环境要求

- Node.js 22+
- npm 10+
- Windows PowerShell（当前启动脚本为 Windows 版本）

## 安装依赖

```powershell
npm install
```

## 环境变量配置

1. 复制示例配置：

```powershell
Copy-Item .env.example .env
```

2. 本地演示可保持大多数变量为空。没有真实 LLM Key 时，Talent MVP 使用 Mock AI。
3. 不要提交 `.env`，不要把真实 API Key、Token、连接串复制到文档中。

## 数据初始化与演示数据

- Talent MVP 首次访问会自动创建本地运行时数据：

```text
.runtime/talent-mvp-data.json
```

- 后台「人才 Agent」页面可点击「重置演示数据」恢复示例项目与候选人。
- `.runtime/` 是本地运行数据，不通过 Git 在两台电脑之间同步。

## 本地启动

生产构建后启动：

```powershell
npm run build:prod
npm start
```

开发模式：

```powershell
npm run dev
```

访问地址：

- 前台测评：`http://localhost:3000/app/`
- 后台中控：`http://localhost:3000/app/admin`
- Talent Agent：`http://localhost:3000/app/admin?tab=talent-agent`

后台演示账号：

```text
admin / admin123
```

## 检查命令

类型检查：

```powershell
npx.cmd tsc --noEmit --project tsconfig.app.json
npx.cmd tsc --noEmit --project tsconfig.node.json
```

测试：

```powershell
npm test
```

构建：

```powershell
npm run build:prod
```

## 两台电脑同步开发流程

首次在电脑 A 推送：

```powershell
git status
git add .
git commit -m "chore: prepare lightweight handoff workflow"
git remote add origin <your-private-repo-url>
git push -u origin main
```

电脑 B 首次接力：

```powershell
git clone <your-private-repo-url>
cd mpt-platform-dev
npm install
Copy-Item .env.example .env
npm run build:prod
npm start
```

每次开始工作：

```powershell
git status
git branch --show-current
git pull --rebase
```

每次结束工作：

```powershell
npx.cmd tsc --noEmit --project tsconfig.app.json
npx.cmd tsc --noEmit --project tsconfig.node.json
git status
git add .
git commit -m "<清晰描述本次修改>"
git push
```

如果两台电脑可能同时开发，不要同时直接改 `main`。建议为每个功能创建独立分支：

```powershell
git switch -c feature/workflow-engine
git pull --rebase origin main
```

合并前先拉取远程最新代码；发生冲突时手动理解双方修改后再合并，不要强制 push 覆盖另一台电脑。

## Codex 接力开发流程

Codex 日常只需要先读：

```text
AGENTS.md
docs/STATUS.md
```

只有在以下情况再读：

- 架构设计、新大型模块、中长期规划：`docs/PLANS.md`
- 安装、启动、构建、部署、环境故障：`README.md`

不要默认扫描整个仓库，不要读取 `node_modules/`、`dist/`、`.runtime/`、`logs/`、上传目录、大型媒体或构建产物。

## 常见问题

### 端口 3000 被占用

```powershell
Get-NetTCPConnection -State Listen -LocalPort 3000 |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

然后重新运行：

```powershell
npm start
```

### 新电脑没有演示数据

这是正常现象。运行项目后会自动创建 `.runtime/` 数据；也可以在 Talent Agent 页面点击「重置演示数据」。

### 为什么不提交 `.runtime/` 和 `.env`

`.runtime/` 是每台电脑的本地运行数据；`.env` 可能包含真实密钥。两者都不应通过 Git 同步。
