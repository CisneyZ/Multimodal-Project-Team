# Star.X 源码开发迁移包说明

这个包用于把当前项目迁移到另一台电脑继续开发，同时保留当前可运行的 `dist` 构建产物。

## 目标电脑要求

- Windows 10/11
- Node.js 22 LTS 或更高
- npm 10 或更高

## 推荐解压位置

```powershell
D:\starx-dev
```

## 首次检查

```powershell
cd "D:\starx-dev"
node -v
npm.cmd -v
```

Node 需要是 `v22.x` 或更高。

## 如果迁移包里已经带了 node_modules

可以先直接构建或启动。如果启动时报依赖异常，再执行：

```powershell
npm.cmd ci
```

## Windows 构建

```powershell
cd "D:\starx-dev"
Set-ExecutionPolicy -Scope Process Bypass
.\deployment\build-windows.ps1
```

## 生产方式启动

```powershell
cd "D:\starx-dev"
Set-ExecutionPolicy -Scope Process Bypass
.\deployment\start-prod-windows.ps1
```

访问：

```text
http://localhost:3000/app/
http://localhost:3000/app/admin
```

后台账号：

```text
admin
admin123
```

## 开发方式启动

开两个 PowerShell。

第一个窗口启动后端：

```powershell
cd "D:\starx-dev"
Set-ExecutionPolicy -Scope Process Bypass
.\deployment\start-dev-server.ps1
```

第二个窗口启动前端：

```powershell
cd "D:\starx-dev"
Set-ExecutionPolicy -Scope Process Bypass
.\deployment\start-dev-client.ps1
```

开发访问：

```text
http://localhost:5173/app/
```

后端 API：

```text
http://localhost:3000/api
```

## 重要文件

- `.env`：环境变量和数据源配置，已随包迁移。
- `.runtime/feishu-v11-config.json`：后台数据源配置，已随包迁移。
- `client/`：前端源码。
- `server/`：后端源码。
- `shared/`：共享类型。
- `dist/`：当前已构建产物。
- `package-lock.json`：依赖锁定文件。

## 局域网访问

如果要让同一局域网其他电脑访问，生产启动脚本默认绑定 `0.0.0.0:3000`。

访问地址格式：

```text
http://目标电脑IP:3000/app/
```

如果访问不了，检查 Windows 防火墙是否放行 Node.js 或 3000 端口。
