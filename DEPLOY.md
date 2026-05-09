# 泵房检修派单系统 - 部署指南

## 快速部署到 Vercel（外网可访问）

### 方案一：通过 GitHub 部署（推荐）

1. **创建 GitHub 仓库**
   ```bash
   cd pump-repair-dispatch
   # 如果还没有初始化git，在项目根目录执行:
   git remote add origin https://github.com/你的用户名/pump-repair-dispatch.git
   git push -u origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择刚创建的仓库
   - Framework Preset 选择 "Next.js"
   - 点击 "Deploy"

3. **等待部署完成**
   - Vercel 会自动构建和部署
   - 部署完成后你会获得一个 `.vercel.app` 域名
   - 外网即可访问！

### 方案二：本地安装 Vercel CLI 部署

```bash
npm install -g vercel
cd pump-repair-dispatch
vercel login
vercel
```

---

## 七个分派中心

| 中心ID | 中心名称 | 颜色标识 |
|--------|----------|----------|
| nanxing | 南星中心 | 蓝色 |
| qianjiang | 钱江新城中心 | 绿色 |
| hubin | 湖滨中心 | 橙色 |
| huajiachi | 华家池中心 | 红色 |
| dinglan | 丁兰中心 | 紫色 |
| jianqiao | 笕桥中心 | 粉色 |
| chengdongxincheng | 城东新城中心 | 青色 |

---

## 功能说明

- **派单列表**：查看所有派单，支持按状态和中心筛选
- **新建派单**：填写泵房信息、报警信息，选择分派中心
- **状态管理**：已分派 → 处理中 → 已完成
- **数据说明**：当前使用内存存储，重启后会重置。Vercel部署后每次请求也在内存中，适合演示和小规模使用。

---

## 本地开发

```bash
cd pump-repair-dispatch
npm install
npm run dev
# 访问 http://localhost:3000
```

---

## 如需持久化存储

后续可升级为以下方案之一：
1. **Vercel Postgres** - Vercel自家数据库
2. **Supabase** - 免费PostgreSQL数据库
3. **MongoDB Atlas** - 免费MongoDB
4. **Redis** - 键值存储

如需升级存储方案，请告诉我。
