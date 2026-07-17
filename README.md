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

SvelteKit 默认使用 `@sveltejs/adapter-auto`。当您在各大主流云平台进行构建时，它会自动检测环境并安装适配器生成对应的服务。

### 方案 A：主流云平台（Vercel / Netlify / Cloudflare Pages）- 推荐 ⭐️
这些平台对 SvelteKit 提供了零配置的原生支持：

#### 1. Vercel
1. 将项目代码推送至您的 GitHub / GitLab 仓库。
2. 登录 [Vercel 官网](https://vercel.com/)，点击 **Add New -> Project**。
3. 导入您的导航站仓库。
4. 框架预设选择 **SvelteKit**（系统通常会自动检测到）。
5. 点击 **Deploy** 即可，Vercel 会自动完成构建并为您生成免费域名。

#### 2. Netlify
1. 登录 [Netlify 官网](https://www.netlify.com/)，选择 **Add new site -> Import an existing project**。
2. 关联您的 GitHub 账号并选择仓库。
3. 构建命令设为 `npm run build`，发布目录选择 `.svelte-kit/output`（默认即可）。
4. 点击 **Deploy site**。

#### 3. Cloudflare Pages
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，进入 **Workers & Pages -> Create Application**。
2. 选择 **Pages -> Connect to Git** 并关联您的 GitHub 仓库。
3. 框架预设（Framework preset）选择 **SvelteKit**。
4. 在环境变量（Environment variables）中，确保 `NODE_VERSION` 设置为 `18` 或以上版本。
5. 点击 **Save and Deploy**。

---

### 方案 B：纯静态托管（GitHub Pages / 腾讯云 COS / 阿里云 OSS）
如果您需要将导航站打包为**纯静态 HTML/CSS 页面**（无 Node.js 服务运行，完全由浏览器端加载），请执行以下步骤转换为 SSG（静态站点生成）：

#### 1. 更换为静态适配器
在项目根目录下安装静态导出适配器：
```sh
npm install -D @sveltejs/adapter-static
```

#### 2. 修改打包配置
打开根目录下的 [vite.config.js](file:///c:/Users/bbylw/Desktop/net/vite.config.js)，将引入的 `adapter-auto` 替换为 `adapter-static`：

```diff
-import adapter from '@sveltejs/adapter-auto';
+import adapter from '@sveltejs/adapter-static';
 import { sveltekit } from '@sveltejs/kit/vite';
 import { defineConfig } from 'vite';
```

#### 3. 开启预渲染
新建一个路由布局配置文件，命名为 `src/routes/+layout.js`（如果尚未创建），在其中加入开启全站预渲染的配置：
```javascript
export const prerender = true;
```

#### 4. 打包与部署
执行构建：
```sh
npm run build
```
执行后，项目根目录下会生成一个 **`build/`** 文件夹。该文件夹内包含了所有编译好的静态 HTML、CSS、JS 文件：
- **GitHub Pages**：将 `build/` 目录下的内容推送到您的 GitHub Pages 仓库分支，或者配置 GitHub Actions 自动部署。
- **对象存储 (COS/OSS)**：直接将 `build/` 目录中的所有文件上传到您的对象存储桶，并开启“静态网站托管”功能即可。
