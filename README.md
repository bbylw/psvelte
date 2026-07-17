# WebNav Hub (SvelteKit 版导航站)

这是一个经过现代化重构的高性能单页书签导航站（WebNav Hub），技术栈已升级为 **Svelte 5** 和 **SvelteKit 2**，同时保留了原始网站精致的暗黑橙色（Orange Accent）视觉风格，并内置了高颜值的实时搜索过滤功能。

---

## 📂 内容配置指南（如何增减网址与分类）

所有的分类与网址数据都统一保存在 [src/lib/navData.js](file:///c:/Users/bbylw/Desktop/net/src/lib/navData.js) 中，您无需修改任何 HTML 或 Svelte 页面代码，只需编辑该文件即可管理站点内容。

数据结构为：
```javascript
export const categories = [
  {
    id: "分类唯一ID (英文/拼音)",
    title: "显示在页面上的分类名称",
    links: [
      {
        url: "跳转的目标网址",
        icon: "图标类名 (FontAwesome 7 规范)",
        title: "网站名称"
      }
    ]
  }
];
```

### 1. 增加一个网址（Link）
找到您要放置的分类对象，在其 `links` 数组中添加一个新对象。例如，在 `ai-search` 分类下增加“DeepSeek”：

```diff
       {
         "url": "https://www.qianwen.com/",
         "icon": "fa-solid fa-magnifying-glass",
         "title": "千问国内版"
       },
+      {
+        "url": "https://www.deepseek.com/",
+        "icon": "fa-brands fa-rocketchat",
+        "title": "DeepSeek"
+      }
```
> 💡 **关于图标 (icon)**：本项目采用 **FontAwesome 7** 图标。您可以在其官网搜索对应的图标类名（如 `fa-solid fa-envelope`、`fa-brands fa-github`），并直接填入 `icon` 字段。

### 2. 删除一个网址
直接在对应分类的 `links` 列表中移除该网址对象即可。

### 3. 增加一个新分类（Category）
在导出的 `categories` 数组中增加一个新的对象实体，例如新增“开发社区”分类：

```javascript
  {
    id: "dev-community",
    title: "开发社区",
    links: [
      {
        url: "https://github.com/",
        icon: "fa-brands fa-github",
        title: "GitHub"
      },
      {
        url: "https://stackoverflow.com/",
        icon: "fa-brands fa-stack-overflow",
        title: "Stack Overflow"
      }
    ]
  }
```
*新分类添加后，顶部的导航菜单栏以及主页的卡片网格会自动渲染并同步该分类。*

### 4. 删除一个分类
在 `categories` 数组中直接删除该类目的整个对象（包括其下的 `links`），导航菜单和主页面会自动同步移除。

---

## 🌐 云端托管部署教程

本项目已预先配置为 **纯静态站点生成 (SSG)** 模式（使用 `@sveltejs/adapter-static`），这能让您的导航站在所有平台上享受到最快速的加载速度与零服务器运行费用。

在打包构建时，项目会自动在根目录生成 **`build/`** 文件夹，里面包含了所有编译压缩好的静态 HTML、CSS、JS 文件。

### 1. Cloudflare Pages (推荐 ⭐️)
本项目已在根目录内置了 `.node-version` 与 `.nvmrc`，Cloudflare Pages 会自动采用 Node.js 22。
1. 登录 Cloudflare 控制台，进入 **Workers & Pages -> Create Application**。
2. 选择 **Pages -> Connect to Git** 并关联您的 GitHub 仓库 `bbylw/psvelte`。
3. 框架预设（Framework preset）选择 **SvelteKit**。
4. **【关键步骤】** 找到 **Build output directory（构建输出目录）**，将默认的 `.svelte-kit/cloudflare` 修改为 **`build`**。
5. 点击 **Save and Deploy** 进行第一次构建。
6. 构建成功后，在 Pages 详情页的 **Custom domains（自定义域）** 绑定您的域名 `psvelte.ndjp.net`。

### 2. GitHub Pages (自动化 Actions 部署 ⭐️)
本项目已在 `.github/workflows/deploy.yml` 内置了 GitHub Actions 工作流与 `static/CNAME` 域名映射。
1. 打开您的 GitHub 仓库设置：`https://github.com/bbylw/psvelte/settings/pages`。
2. 将 **Build and deployment -> Source** 从 `Deploy from a branch` 切换为 **`GitHub Actions`**。
3. 每次您推送代码到 `main` 分支时，GitHub 就会自动运行构建并将 `build/` 部署至您的自定义域名 `psvelte.ndjp.net`。

### 3. Vercel
1. 将代码推送至 GitHub 仓库。
2. 登录 [Vercel 官网](https://vercel.com/)，点击 **Add New -> Project**，导入您的 `psvelte` 仓库。
3. **【构建参数配置】** 展开 **Build & Development Settings** 配置项：
   - **Framework Preset（框架预设）**：选择 **SvelteKit**（Vercel 会自动识别静态适配器并将生成的静态网页部署为 Edge CDN 静态资源）。
   - **Build Command（构建命令）**：保持默认的 `npm run build`。
   - **Output Directory（输出目录）**：保持默认（系统会自动识别 `@sveltejs/adapter-static` 的配置）。*注：如果框架预设选择了 **Other**，则需要将该输出目录手动设置为 **`build`**。*
4. 点击 **Deploy** 进行自动化部署。
5. **【绑定自定义域名】**：
   - 部署成功后，进入该项目的后台，点击 **Settings -> Domains**。
   - 在输入框中输入您的自定义域名 `psvelte.ndjp.net` 并点击 **Add**。
   - 按照 Vercel 页面上的提示，前往您的 DNS 解析商（如 Cloudflare 等）处为您的域名添加一条 `CNAME` 解析记录：
     - **记录类型**：`CNAME`
     - **主机记录**：`psvelte`
     - **记录值**：`cname.vercel-dns.com`

### 4. Netlify
1. 登录 Netlify，关联 GitHub 并选择项目。
2. 构建命令设置为 `npm run build`。
3. **【关键步骤】** 将发布目录（Publish directory）设置为 **`build`**。
4. 点击 **Deploy site** 即可。

### 5. 传统对象存储 (腾讯云 COS / 阿里云 OSS / 七牛云)
如果您使用传统的静态存储桶：
1. 本地运行 `npm run build` 进行打包。
2. 将生成的 `build/` 目录中的所有文件直接上传到您配置好的对象存储桶根目录下。
3. 在存储桶后台开启“静态网站托管”功能，并绑定自定义域名即可。
