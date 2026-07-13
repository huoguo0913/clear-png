# ClearPNG MVP 产品需求文档

版本：1.0  
日期：2026-07-13  
项目：ClearPNG  
阶段：MVP

## 1. 项目概述

ClearPNG 是一个在线图片背景移除工具。MVP 首版聚焦 `image background remover` 的核心需求，并优先覆盖更明确的长尾场景：Logo、签名、白底图转透明 PNG、商品图背景移除。

首版采用轻量架构：Cloudflare Pages 承载前端，Cloudflare Worker 或 Pages Functions 作为 API 代理，调用 remove.bg API 完成背景移除。用户图片不落盘、不存储，处理完成后直接返回透明 PNG 给浏览器下载。

## 2. 产品定位

### 2.1 产品名称

ClearPNG

### 2.2 一句话定位

Free image background remover and transparent PNG maker for logos, signatures, and product photos.

### 2.3 核心价值

- 用户无需安装 Photoshop，即可移除图片背景并导出透明 PNG。
- 针对 Logo、签名、商品图、白底图等高频场景提供更直接的上传、预览和下载体验。
- 不保存用户图片，降低隐私顾虑。
- 页面围绕 SEO 长尾词设计，用真实工具承接自然搜索流量。

## 3. MVP 目标

### 3.1 业务目标

- 上线一个可用的在线背景移除工具。
- 验证 `image background remover` 及相关长尾词是否能带来自然搜索流量。
- 验证用户是否愿意完成上传、处理、预览、下载的完整闭环。
- 为后续付费功能、批量处理、API 服务预留产品空间。

### 3.2 用户目标

- 用户可以在 30 秒内完成一次图片背景移除。
- 用户可以直接下载透明 PNG。
- 用户可以通过预览判断处理效果是否适合 Logo、签名、商品图等场景。

### 3.3 非目标

MVP 暂不包含：

- 用户注册登录。
- 图片历史记录。
- 云端图片存储。
- 批量处理。
- 在线高级编辑器。
- 支付订阅。
- 自研 AI 模型。
- 多语言站点。

## 4. 目标用户与场景

### 4.1 目标用户

- 小商家、电商运营：需要商品图白底或透明背景。
- 设计新手、内容创作者：需要快速处理 Logo、贴纸、封面素材。
- 办公用户：需要把签名、印章、Logo 放进 Word、PDF、PPT。
- 独立站站长：需要透明 Logo 或网站素材。

### 4.2 典型使用场景

- 去除 Logo 白底，导出透明 PNG。
- 把手写签名照片变成透明 PNG。
- 移除商品图片背景，用于电商页面。
- 把头像或物体从背景中抠出来。
- 移除白色、浅色或纯色背景。

## 5. 搜索词与页面策略

### 5.1 主关键词

- image background remover
- background remover
- remove background from image
- transparent PNG maker

### 5.2 优先长尾关键词

- remove white background from logo
- make logo background transparent
- remove background from signature
- make signature transparent PNG
- remove white background from image
- product photo background remover
- remove background from PNG
- remove background from JPG

### 5.3 MVP 页面规划

| 页面 | URL | 目标关键词 |
| --- | --- | --- |
| 首页/主工具页 | `/` | image background remover, transparent PNG maker |
| Logo 场景页 | `/remove-white-background-from-logo` | remove white background from logo |
| 签名场景页 | `/signature-background-remover` | remove background from signature |
| 商品图场景页 | `/product-photo-background-remover` | product photo background remover |
| 白底图场景页 | `/remove-white-background` | remove white background from image |

所有页面都必须提供真实可用的上传工具，不能只是文章页或营销页。

## 6. 核心用户流程

### 6.1 上传处理流程

1. 用户进入页面。
2. 用户点击上传区或拖拽图片。
3. 前端校验文件格式和大小。
4. 前端展示原图预览。
5. 用户点击 `Remove Background`。
6. 前端将图片发送到 Cloudflare Worker 或 Pages Function。
7. 后端代理调用 remove.bg API。
8. 后端返回透明 PNG。
9. 前端展示处理结果。
10. 用户下载 PNG。

### 6.2 错误流程

- 图片格式不支持：提示用户上传 JPG、PNG、WebP。
- 图片过大：提示用户压缩图片或上传更小图片。
- API 额度不足：提示服务繁忙，稍后再试。
- remove.bg 处理失败：提示用户换一张图片或重试。
- 网络失败：提示用户检查连接并重试。

## 7. 功能需求

### 7.1 上传组件

必须支持：

- 点击上传。
- 拖拽上传。
- 支持 JPG、JPEG、PNG、WebP。
- 前端限制文件大小，MVP 限制为 5MB。
- 上传后显示原图预览。
- 支持重新选择图片。

MVP 不支持：

- 多图上传。
- 从 URL 导入图片。
- 从 Google Drive、Dropbox 等第三方网盘导入。

### 7.2 背景移除

必须支持：

- 用户点击按钮后开始处理。
- 处理时显示 loading 状态。
- 成功后返回透明 PNG。
- 失败时显示清晰错误提示。

接口要求：

- 前端请求：`POST /api/remove-bg`
- 请求格式：`multipart/form-data`
- 图片字段名：`image_file`
- 成功响应格式：`image/png`

### 7.3 结果预览

必须支持：

- 展示原图。
- 展示处理后的透明 PNG。
- 使用棋盘格背景帮助用户识别透明区域。
- 提供至少 3 种预览背景：透明棋盘格、白色、黑色。

可选支持：

- Before/after 对比滑块。
- 自动裁剪透明边距。

### 7.4 下载

必须支持：

- 下载透明 PNG。
- 默认下载文件名为 `clearpng-result.png`。
- 下载不依赖云端存储。

MVP 不支持：

- JPG 下载。
- WebP 下载。
- 自定义尺寸下载。
- 批量打包下载。

### 7.5 场景模式

页面可展示以下模式入口：

- General Image
- Logo
- Signature
- Product Photo

MVP 阶段这些模式复用同一套 remove.bg API 处理逻辑。差异主要体现在页面文案、示例图、FAQ、默认预览背景和用户期望管理。

## 8. 页面需求

### 8.1 首页

页面目标：

- 承接主词 `image background remover`。
- 让用户第一眼看到上传区域。
- 快速完成上传、处理、下载。

首屏内容：

- 品牌名：ClearPNG
- H1：Free Image Background Remover
- 副标题：Remove backgrounds from JPG, PNG, and WebP images. Download a transparent PNG in seconds.
- 上传区域。
- 支持格式和大小提示。

页面模块：

- 上传工具。
- 结果预览。
- 场景入口：Logo、Signature、Product Photo、White Background。
- 简短功能说明。
- FAQ。

### 8.2 Logo 页

页面目标：

- 承接 `remove white background from logo`。
- 强调透明 PNG、网站、PPT、社交头像等用途。

建议 H1：

```text
Remove White Background from Logo
```

重点文案：

- Make your logo background transparent.
- Export a clean PNG for websites, slides, stores, and social media.
- Preview your logo on white, black, and transparent backgrounds.

### 8.3 签名页

页面目标：

- 承接 `remove background from signature` 和 `make signature transparent PNG`。
- 强调扫描签名、拍照签名、PDF、Word、合同使用。

建议 H1：

```text
Signature Background Remover
```

重点文案：

- Turn a scanned or photographed signature into a transparent PNG.
- Use it in Word, PDF, invoices, forms, and contracts.
- No image storage. Your file is processed and returned immediately.

### 8.4 商品图页

页面目标：

- 承接 `product photo background remover`。
- 强调电商图、主图、白底图、透明图。

建议 H1：

```text
Product Photo Background Remover
```

重点文案：

- Remove product photo backgrounds for online stores.
- Create clean product cutouts for Shopify, Amazon, Etsy, and social media.

## 9. API 需求

### 9.1 接口

```text
POST /api/remove-bg
```

### 9.2 请求

Content-Type：

```text
multipart/form-data
```

字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `image_file` | File | 是 | 用户上传的图片 |

### 9.3 响应

成功：

```text
Content-Type: image/png
Cache-Control: no-store
```

失败：

```json
{
  "error": "Image is too large. Please upload an image under 5MB."
}
```

### 9.4 Worker 处理逻辑

1. 校验请求方法必须是 POST。
2. 解析 `multipart/form-data`。
3. 校验 `image_file` 是否存在。
4. 校验文件大小。
5. 校验文件类型。
6. 构造新的 `FormData` 请求 remove.bg API。
7. 使用 `X-Api-Key` 请求头携带 API key。
8. 接收 remove.bg 返回的图片流。
9. 设置 `Cache-Control: no-store`。
10. 直接返回图片给前端。

### 9.5 环境变量

```text
REMOVE_BG_API_KEY=remove.bg API key
```

密钥只允许保存在 Cloudflare 环境变量中，不能暴露到前端代码、构建产物或日志里。

## 10. 技术方案

### 10.1 前端

推荐技术：

- Vite + React + TypeScript。
- 静态部署到 Cloudflare Pages。
- 使用浏览器本地 `URL.createObjectURL()` 做图片预览。
- 使用 Blob URL 下载处理后的 PNG。

### 10.2 后端

推荐技术：

- Cloudflare Worker 或 Cloudflare Pages Functions。
- 不接数据库。
- 不接对象存储。
- 不保存用户图片。
- 只作为 remove.bg API 的安全代理。

### 10.3 部署

推荐方案：

- 前端：Cloudflare Pages。
- API：Cloudflare Worker 或 Pages Functions。
- 域名：绑定到 Cloudflare。
- HTTPS：Cloudflare 自动提供。

## 11. 安全、限制与隐私

### 11.1 文件限制

MVP 限制：

- 最大文件：5MB。
- 支持格式：JPG、JPEG、PNG、WebP。
- 不支持格式：SVG、GIF、PSD、PDF。

### 11.2 滥用防护

MVP 最低要求：

- 前端文件大小限制。
- 后端文件大小限制。
- 错误响应不暴露 remove.bg API key。
- 响应头设置 `Cache-Control: no-store`。

后续可增加：

- Cloudflare Turnstile。
- IP 级频率限制。
- KV 或 D1 记录每日免费次数。
- 登录后提高额度。

### 11.3 隐私说明

页面必须明确说明：

- ClearPNG 不存储用户图片。
- 图片仅用于本次背景移除处理。
- 处理结果直接返回浏览器。
- 不提供历史记录。

## 12. 数据与分析

MVP 应接入基础事件统计，用于判断项目是否值得继续投入。

### 12.1 关键事件

- `page_view`
- `upload_started`
- `upload_validated`
- `remove_bg_clicked`
- `remove_bg_success`
- `remove_bg_failed`
- `download_clicked`

### 12.2 核心指标

- 页面访问量。
- 上传率：上传人数 / 页面访问人数。
- 成功处理率：处理成功人数 / 上传人数。
- 下载率：下载人数 / 成功处理人数。
- API 成本：remove.bg 消耗次数。
- 来源关键词和落地页表现。

## 13. SEO 需求

### 13.1 基础 SEO

每个页面必须有：

- 唯一 Title。
- 唯一 Meta Description。
- 唯一 H1。
- Canonical URL。
- Open Graph 标题和描述。
- 结构化 FAQ。
- 清晰的工具首屏。

### 13.2 示例 Title

首页：

```text
Free Image Background Remover & Transparent PNG Maker | ClearPNG
```

Logo 页：

```text
Remove White Background from Logo Online | ClearPNG
```

签名页：

```text
Signature Background Remover - Make Signature Transparent | ClearPNG
```

商品图页：

```text
Product Photo Background Remover Online | ClearPNG
```

### 13.3 FAQ 示例

首页 FAQ：

- Is ClearPNG free to use?
- What image formats are supported?
- Will my image be stored?
- Can I download a transparent PNG?
- Can I remove a white background from a logo?

Logo 页 FAQ：

- How do I make my logo background transparent?
- Can I remove a white background from a PNG logo?
- Will the logo edges stay clean?

签名页 FAQ：

- How do I make a signature transparent?
- Can I use the transparent signature in Word or PDF?
- Does ClearPNG store my signature image?

## 14. 设计要求

### 14.1 风格

- 简洁、工具型、可信。
- 首屏直接突出上传操作，避免营销型大图喧宾夺主。
- 不要把主要上传工具藏在页面下方。
- 视觉上突出透明 PNG、棋盘格、前后对比。

### 14.2 关键组件

- 顶部导航：Logo、Tools、FAQ。
- 上传卡片。
- 处理中状态。
- 结果预览区。
- 背景预览切换。
- 下载按钮。
- 错误提示。

### 14.3 移动端

必须保证：

- 手机可以上传图片。
- 上传按钮足够大。
- 处理状态清晰。
- 下载按钮在结果出现后容易找到。

## 15. 验收标准

### 15.1 功能验收

- 用户可以上传 JPG 图片并成功移除背景。
- 用户可以上传 PNG 图片并成功移除背景。
- 用户可以上传 WebP 图片并成功移除背景。
- 超过 5MB 的图片会被拒绝并显示清晰提示。
- 处理成功后可以看到透明 PNG 预览。
- 用户可以下载透明 PNG。
- 刷新页面后不会出现历史图片。
- 前端不暴露 remove.bg API key。

### 15.2 部署验收

- 网站可通过 Cloudflare Pages 访问。
- API 可通过 Cloudflare Worker 或 Pages Functions 访问。
- 生产环境已配置 `REMOVE_BG_API_KEY`。
- HTTPS 正常。
- 主要页面返回 200。
- `robots.txt` 和 `sitemap.xml` 可访问。

### 15.3 SEO 验收

- 首页和核心场景页有唯一 title、description、H1。
- 页面首屏包含真实可用的上传工具。
- 场景页内容不是简单复制，有对应场景文案。
- 已提交 Google Search Console。

## 16. 里程碑

### Milestone 1：MVP 可用版本

目标：完成上传、处理、预览、下载闭环。

包含：

- 首页。
- Worker API 或 Pages Function。
- remove.bg API 接入。
- 透明 PNG 下载。
- 基础错误提示。

### Milestone 2：SEO 场景页

目标：开始承接长尾词。

包含：

- Logo 页。
- 签名页。
- 商品图页。
- 白底图页。
- FAQ 和基础结构化数据。

### Milestone 3：体验优化

目标：提升下载率和复用率。

包含：

- Before/after 对比。
- 白色、黑色、棋盘格预览。
- 自动裁剪透明边距。
- 本地换背景色导出。

### Milestone 4：增长与变现准备

目标：控制成本并测试付费意愿。

包含：

- 频率限制。
- Turnstile。
- 免费额度。
- 批量处理入口。
- Pro 功能等待列表。

## 17. 风险与应对

### 17.1 API 成本风险

风险：remove.bg API 按量消耗，免费流量可能带来成本。

应对：

- MVP 限制文件大小。
- 后续加入每日免费次数。
- 加入 Turnstile 防止滥用。
- 高成本功能放到登录或付费后。

### 17.2 SEO 竞争风险

风险：主词竞争强，大站权重高。

应对：

- 不只做主词页面。
- 优先做 Logo、签名、白底、商品图等场景页。
- 每个页面都提供真实工具，而不是泛内容。

### 17.3 效果不可控风险

风险：Logo、签名细线可能被 remove.bg 误处理。

应对：

- 页面明确提示适合大多数图片。
- 后续为 Logo 和签名增加本地白底透明化算法。
- 提供重试和预览背景切换。

## 18. 后续扩展方向

- 批量背景移除。
- 自定义背景色导出。
- 自动裁剪透明边距。
- Logo 尺寸模板：favicon、社交头像、网站 header。
- 签名增强：加深笔迹、去纸张阴影。
- 商品图模板：白底、方图、社交图。
- 用户账号和历史记录。
- API 服务。
- 付费订阅。
