# MPT Platform v0.1 运行与部署手册

## 本地启动前

```bash
node -v
npm -v
git status
```

建议 Node 22.x LTS。

## 安装

```bash
npm install
```

## 环境变量建议

```text
DATABASE_URL=
UPLOAD_DIR=./runtime/uploads
MAX_UPLOAD_SIZE_MB=15
AI_PROVIDER=
AI_MODEL=
AI_BASE_URL=
AI_API_KEY=
AI_TIMEOUT_MS=45000
```

AI 配置允许为空，系统进入规则 fallback。

## 启动

先查看 `package.json`，再运行仓库已有命令，例如：

```bash
npm run dev
```

## 发布前

```bash
npm run type:check
git diff --check
```

存在测试或构建命令时继续运行。

## 生产建议

- HTTPS；
- 环境变量注入；
- 数据库和上传目录备份；
- 进程守护；
- 日志脱敏；
- 记录 commit SHA 与数据库迁移版本。
