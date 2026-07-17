# 从这里开始

## 1. 不要创建一个与原仓库断开的空项目

建议把现有仓库 clone 到新的项目文件夹，再把本记忆包中的文档复制到仓库根目录。

```bash
git clone https://github.com/CisneyZ/Multimodal-Project-Team.git StarX-Multimodal-Agent-Platform
cd StarX-Multimodal-Agent-Platform
```

如果本机已经有完整代码，也可以复制整个项目目录，但应保留 `.git/`，避免丢失历史。

## 2. 环境文件

GitHub ZIP 和 Git clone 默认不会包含被 `.gitignore` 排除的真实 `.env`。

```bash
cp .env.example .env
```

然后只在本机填写真实配置。不要上传 `.env`，不要把真实密钥粘贴进项目文档。

## 3. 把本记忆包放入仓库

建议复制：

```text
AGENTS.md
PROJECT_MEMORY.md
docs/
prompts/
```

旧的 `docs/PLANS.md` 可以保留为历史，也可以把其中有效内容迁移到本包文档后删除；不要同时维护两套互相冲突的规划。

## 4. Codex 每次开始只读

```text
AGENTS.md
PROJECT_MEMORY.md
docs/STATUS.md
```

只有涉及架构、飞书或验收时，再读取对应专题文档。

## 5. 当前开发顺序

```text
Task Runtime
↓
Model Gateway
↓
候选人简历结构化分析迁移
↓
真实 API 稳定性验证
↓
Agent Registry + Workflow Definition
↓
飞书免登、机器人与任务卡片
↓
Prompt 质检 Agent
↓
图片、音频、视频能力
```

## 6. 新电脑接力

```bash
git status
git branch --show-current
git pull --rebase
npm install
cp .env.example .env
```

真实 `.env` 需从安全位置单独配置，不能通过 GitHub 同步。
