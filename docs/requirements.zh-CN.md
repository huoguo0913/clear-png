# ClearPNG 产品需求文档

版本：1.1  
日期：2026-09-05  
项目：ClearPNG  
阶段：已上线 MVP（含登录、额度与支付）

## 1. 项目概述

ClearPNG 是一个在线图片背景移除工具，聚焦 `image background remover` 的核心需求，并优先覆盖更明确的长尾场景：Logo、签名、白底图转透明 PNG、商品图背景移除。

当前版本采用轻量架构，整体部署在 Cloudflare：

- 前端使用 Next.js（App Router）+ React + TypeScript + Tailwind CSS，以 `output: "export"` 静态导出到 `out/`，由 Cloudflare Pages 托管。
- 后端使用 Cloudflare Pages Functions（`functions/` 目录），作为安全 API 代理调用 remove.bg API 完成背景移除。
- 用户图片不落盘、不存储，处理完成后透明 PNG 直接流式返回浏览器下载。
- 使用 Cloudflare D1 数据库（绑定名 `CLEARPNG_DB`）保存用户、会话、图片额度、订单与支付 Webhook 记录。
- 支持 Google 账号登录；登录用户每月获得免费额度，超出后可通过 PayPal 或 Creem 购买付费额度。

## 2. 产品定位

### 2.1 产品名称

ClearPNG

### 2.2 一句话定位

Free image background remover and transparent PNG maker for logos, signatures, and product photos.

### 2.3 核心价值

- 用户无需安装 Photoshop，即可移除图片背景并导出透明 PNG。
- 针对 Logo、签名、商品图、白底图等高频场景提供直接的上传、预览和下载体验。
- 不保存用户图片，降低隐私顾虑。
- 登录后每月有免费额度，付费额度通过 PayPal / Creem 购买，控制 API 成本。
- 页面围绕 SEO 长尾词设计，用真实工具承接自然搜索流量。

## 3. 目标

### 3.1 业务目标

- 提供一个可用、已部署在 Cloudflare 的在线背景移除工具。
- 验证 `image background remover` 及相关长尾词能否带来自然搜索流量。
- 验证用户是否愿意完成上传、处理、预览、下载的完整闭环。
- 通过“免费额度 + 付费套餐”验证付费意愿并覆盖 remove.bg API 成本。

### 3.2 用户目标

- 用户登录后即可使用每月免费额度处理图片。
- 用户可以直接下载透明 PNG。
- 用户可以通过棋盘格 / 白 / 黑三种预览背景判断处理效果是否适合 Logo、签名、商品图等场景。
- 免费额度用完后，用户可在定价页通过 PayPal 或 Creem 购买更多额度。

### 3.3 非目标

当前版本暂不包含：

- 图片历史记录。
- 用户上传图片的云端存储。
- 批量处理。
- 在线高级编辑器。
- 自研 AI 模型。
- 多语言站点。
- 除 Google 之外的其他登录方式。

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

### 5.3 页面规划

| 页面 | URL | 目标关键词 |
| --- | --- | --- |
| 首页/主工具页 | `/` | image background remover, transparent PNG maker |
| Logo 场景页 | `/remove-white-background-from-logo` | remove white background from logo |
| 签名场景页 | `/signature-background-remover` | remove background from signature |
| 商品图场景页 | `/product-photo-background-remover` | product photo background remover |
| 白底图场景页 | `/remove-white-background` | remove white background from image |
| 定价页 | `/pricing` | ClearPNG pricing, background remover plans |
| 隐私政策 | `/privacy` | — |
| 服务条款 | `/terms` | — |

所有工具页都内嵌同一个真实可用的上传组件，不是文章页或营销页。`robots.txt` 与 `sitemap.xml` 由代码自动生成。

## 6. 核心用户流程

### 6.1 上传处理流程

1. 用户进入页面。
2. 用户点击上传区或拖拽图片。
3. 前端校验文件格式（JPG/JPEG/PNG/WebP）和大小（≤5MB）。
4. 前端使用 `URL.createObjectURL()` 展示原图预览。
5. 用户点击 `Remove Background`。
6. 前端将图片以 `multipart/form-data` 发送到 `/api/remove-bg`。
7. 后端校验登录态与剩余额度，代理调用 remove.bg API。
8. 后端扣减 1 个额度并返回透明 PNG（`image/png`）。
9. 前端展示处理结果（棋盘格/白/黑背景可切换）。
10. 用户通过 Blob URL 下载 `clearpng-result.png`。

未登录用户点击处理时会收到 401，前端引导跳转 Google 登录；额度不足时收到 402，引导前往 `/pricing`。

### 6.2 支付流程

PayPal：

1. 登录用户在 `/pricing` 选择套餐并点击 `Pay with PayPal`。
2. 前端调用 `POST /api/paypal/create-order`，后端创建 PayPal 订单并返回 `approvalUrl`。
3. 用户跳转 PayPal 批准付款后，PayPal 回跳 `/api/paypal/capture-order`。
4. 后端捕获订单（capture）、更新订单状态、发放额度，再重定向回 `/?checkout=success#tool`。
5. PayPal Webhook（`/api/paypal/webhook`）作为兜底，经验签后处理 `CHECKOUT.ORDER.APPROVED` 与 `PAYMENT.CAPTURE.*` 事件。

Creem：

1. 登录用户点击 `Pay with Creem`。
2. 前端调用 `POST /api/creem/create-checkout`，后端创建 Creem checkout 并返回 `checkoutUrl`。
3. 用户付款后回跳 `/api/creem/success`，后端校验重定向签名后发放额度。
4. Creem Webhook（`/api/creem/webhook`）使用 `creem-signature` HMAC 验签，处理 `checkout.completed` 事件兜底发额。

### 6.3 错误流程

- 图片格式不支持：提示上传 JPG、PNG、WebP。
- 图片过大：提示上传 5MB 以内图片。
- 未登录（401）：引导使用 Google 登录。
- 额度不足（402）：引导到定价页升级。
- remove.bg 额度不足/限流（402/429）：提示服务繁忙，稍后再试。
- remove.bg 处理失败：提示换图或重试。
- 支付未配置 / 校验失败：提示结账失败或服务未配置。
- 网络失败：提示检查连接并重试。

## 7. 功能需求

### 7.1 上传组件

必须支持：

- 点击上传与拖拽上传。
- 支持 JPG、JPEG、PNG、WebP。
- 前后端双重限制文件大小为 5MB。
- 上传后显示原图预览，支持重新选择图片。
- 处理中 loading 状态与清晰错误提示。

暂不支持：

- 多图上传。
- 从 URL 或第三方网盘导入。

### 7.2 背景移除

- 接口：`POST /api/remove-bg`，`multipart/form-data`，图片字段名 `image_file`。
- 必须登录且至少有 1 个可用额度。
- 后端向 remove.bg 发送 `image_file` 与 `size=auto`，使用 `X-Api-Key` 头携带密钥。
- 成功响应 `Content-Type: image/png`、`Cache-Control: no-store`。
- remove.bg 成功返回后才扣减额度并记录 `usage_events`。

### 7.3 结果预览

- 并排展示原图与处理后透明 PNG。
- 使用棋盘格背景识别透明区域。
- 支持三种预览背景：checkerboard（Grid）、white、black。
- 下载文件名固定为 `clearpng-result.png`，使用浏览器 Blob URL，不依赖云端存储。

### 7.4 账号与登录

- 仅支持 Google OAuth 登录（scope：`openid email profile`）。
- 登录入口：`GET /api/auth/google/start`，回调：`GET /api/auth/google/callback`。
- 使用 HttpOnly、SameSite=Lax 的会话 Cookie（`clearpng_session`），HTTPS 下带 Secure。
- 会话令牌仅存 SHA-256 哈希，有效期 30 天；支持登出（`POST /api/auth/logout`）吊销会话。
- `GET /api/auth/me` 返回当前用户信息与剩余额度，供顶栏头像与额度展示。

### 7.5 额度体系

- 免费额度：每个登录用户每月 3 张，按月自动发放（自然月 UTC，月末过期）。
- 付费套餐：

| 套餐 | 价格 | 额度 | 有效期 |
| --- | --- | --- | --- |
| Free | $0 | 3 张/月 | 当月 |
| Starter | $6.99 | 20 张 | 购买后 30 天 |
| Pro | $19.99 | 100 张 | 购买后 30 天 |

- 额度扣减优先消耗最早过期的 grant。
- 每次成功处理写入 `usage_events`（含 User-Agent、CF-Connecting-IP）。
- 付费发额按订单号/checkout ID 幂等，Webhook 重试不会重复发放。

### 7.6 支付

- 同一套餐同时提供 PayPal 与 Creem 两种结账方式。
- PayPal：Orders v2，`intent=CAPTURE`，支持 sandbox / live（`PAYPAL_ENV`）。
- Creem：Checkout API，支持 test / live（`CREEM_ENV`），Starter/Pro 分别配置产品 ID。
- 支付成功后写入 `paypal_orders` / `creem_orders`，并通过 `credit_grants`（source 为 `paypal` / `creem`）发放额度。
- Webhook 事件原始 payload 落库（`paypal_webhook_events` / `creem_webhook_events`），按事件 ID 去重。

### 7.7 场景模式

页面提供 General Image、Logo、Signature、Product Photo 等模式，复用同一套 remove.bg 处理逻辑；差异体现在页面文案、示例、FAQ、预览提示与用户期望管理。

## 8. 页面需求

### 8.1 首页

- H1：Free Image Background Remover。
- 首屏直接展示上传工具（`#tool`），不被营销内容遮挡。
- 模块：上传工具、结果预览、场景入口（Logo / Signature / Product Photo / White Background）、特性说明、三步流程、FAQ。

### 8.2 Logo 页（`/remove-white-background-from-logo`）

- H1：Remove White Background from Logo。
- 强调透明 PNG 用于网站、幻灯片、店铺、社交头像。

### 8.3 签名页（`/signature-background-remover`）

- H1：Signature Background Remover。
- 强调扫描/拍照签名用于 Word、PDF、发票、表单、合同。

### 8.4 商品图页（`/product-photo-background-remover`）

- H1：Product Photo Background Remover。
- 强调 Shopify、Amazon、Etsy 与社媒商品图。

### 8.5 白底图页（`/remove-white-background`）

- H1：Remove White Background from Image。
- 面向白色/浅色/纯色底转透明。

### 8.6 定价页（`/pricing`）

- 展示 Free / Starter / Pro 三个套餐卡片。
- 付费卡片提供 `Pay with Creem` 与 `Pay with PayPal` 两个按钮；未登录点击会先跳转 Google 登录。
- 支付结果通过 `?checkout=success|cancelled|failed` 展示提示条。
- 包含定价 FAQ、Product 结构化数据、服务条款与隐私政策入口。

## 9. API 需求

### 9.1 接口清单

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/remove-bg` | POST | 代理 remove.bg，返回 `image/png` |
| `/api/auth/google/start` | GET | 发起 Google OAuth |
| `/api/auth/google/callback` | GET | OAuth 回调，建立会话 |
| `/api/auth/me` | GET | 当前用户与剩余额度 |
| `/api/auth/logout` | POST | 吊销会话 |
| `/api/paypal/create-order` | POST | 创建 PayPal 订单 |
| `/api/paypal/capture-order` | GET | PayPal 回跳，捕获并发额 |
| `/api/paypal/webhook` | POST | PayPal Webhook（验签） |
| `/api/creem/create-checkout` | POST | 创建 Creem checkout |
| `/api/creem/success` | GET | Creem 回跳（验签并发额） |
| `/api/creem/webhook` | POST | Creem Webhook（HMAC 验签） |

### 9.2 抠图接口请求与响应

请求：`multipart/form-data`，字段 `image_file`（File，必填）。

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

### 9.3 remove.bg 代理处理逻辑

1. 校验请求方法为 POST。
2. 检查 `REMOVE_BG_API_KEY` 与 D1 绑定是否存在。
3. 基于会话 Cookie 解析当前用户，未登录返回 401。
4. 汇总有效额度，剩余 < 1 返回 402。
5. 解析 `multipart/form-data`，校验 `image_file` 存在、大小 ≤5MB、类型为 JPEG/PNG/WebP。
6. 构造新的 `FormData`（`image_file` + `size=auto`）调用 `https://api.remove.bg/v1.0/removebg`。
7. 使用 `X-Api-Key` 头携带密钥；402/429 转成“服务繁忙”，其他失败返回 502。
8. 成功后扣减额度、写入使用事件。
9. 设置 `Cache-Control: no-store`，将图片流直接返回前端。

### 9.4 环境变量

```text
REMOVE_BG_API_KEY=remove.bg API key
GOOGLE_CLIENT_ID=Google OAuth Client ID
GOOGLE_CLIENT_SECRET=Google OAuth Client Secret
PAYPAL_CLIENT_ID=PayPal Client ID
PAYPAL_CLIENT_SECRET=PayPal Client Secret
PAYPAL_ENV=sandbox|live
PAYPAL_WEBHOOK_ID=PayPal Webhook ID
CREEM_API_KEY=Creem API key
CREEM_ENV=test|live
CREEM_STARTER_PRODUCT_ID=Creem Starter 产品 ID
CREEM_PRO_PRODUCT_ID=Creem Pro 产品 ID
CREEM_WEBHOOK_SECRET=Creem Webhook 密钥
APP_ORIGIN=站点规范源（用于 OAuth 与支付回跳）
```

所有密钥只允许保存在 Cloudflare 环境变量中，不能暴露到前端代码、构建产物或日志里。

## 10. 技术方案

### 10.1 前端

- Next.js（App Router）+ React + TypeScript + Tailwind CSS。
- `next.config.mjs` 使用 `output: "export"` 静态导出到 `out/`，部署到 Cloudflare Pages。
- 图片预览使用浏览器本地 `URL.createObjectURL()`，下载使用 Blob URL。
- 图标使用 lucide-react。

### 10.2 后端

- Cloudflare Pages Functions（`functions/` 目录，文件式路由）。
- 共享逻辑位于 `functions/_shared/`：`auth.js`（会话/Cookie/OAuth 工具）、`credits.js`（额度与套餐）、`paypal.js`、`creem.js`。
- 不保存用户图片；仅作为 remove.bg 的安全代理，并负责登录、额度与支付。
- 数据持久化使用 Cloudflare D1（绑定名 `CLEARPNG_DB`），不使用对象存储。

### 10.3 数据库迁移

按顺序执行：

- `migrations/0001_auth.sql`：`users`、`sessions`、`login_events`。
- `migrations/0002_paypal_credits.sql`：`credit_grants`、`usage_events`、`paypal_orders`。
- `migrations/0003_paypal_webhooks.sql`：`paypal_webhook_events` 与 PayPal 发额唯一索引。
- `migrations/0004_creem_checkout.sql`：`creem_orders`、`creem_webhook_events` 与 Creem 发额唯一索引。

### 10.4 部署

- 前端静态导出 + Pages Functions 一同部署到 Cloudflare Pages。
- 在 Pages 项目设置中配置上述环境变量，并绑定 D1 数据库 `CLEARPNG_DB`。
- HTTPS 由 Cloudflare 自动提供。
- PayPal 后台配置 Webhook 指向 `/api/paypal/webhook`；Creem 后台配置 Webhook 指向 `/api/creem/webhook`。

## 11. 安全、限制与隐私

### 11.1 文件限制

- 最大文件：5MB。
- 支持格式：JPG、JPEG、PNG、WebP。
- 不支持格式：SVG、GIF、PSD、PDF。

### 11.2 滥用与成本防护

- 前端与后端双重校验文件大小与类型。
- 抠图接口要求登录，且按账号月度额度限次。
- 错误响应不暴露 remove.bg / PayPal / Creem 的密钥。
- 所有 API 响应设置 `Cache-Control: no-store`。
- 支付 Webhook 强制验签（PayPal verify-webhook-signature；Creem HMAC-SHA256），事件按 ID 去重，发额按订单幂等。
- OAuth 使用 state 参数防 CSRF，回跳地址做同源白名单校验。

后续可增加：Cloudflare Turnstile、IP 级频率限制等。

### 11.3 隐私说明

页面（含 `/privacy`）明确说明：

- ClearPNG 不存储用户上传图片或处理结果，图片仅用于本次背景移除。
- 处理结果直接返回浏览器，不提供图片历史记录。
- 账号数据（Google 邮箱、昵称、头像）与支付记录仅用于登录、额度与订单管理。

## 12. 数据与分析

- 已接入 Google Analytics 4（Measurement ID：`G-BCN2YV00E6`）统计页面访问。
- 前端在上传与处理流程中通过 `clearpng:analytics` 自定义事件派发：`upload_started`、`upload_validated`、`upload_failed_validation`、`remove_bg_clicked`、`remove_bg_success`、`remove_bg_failed`、`download_clicked`。
- 后端通过 `usage_events` 表记录每次成功抠图（用户、grant、User-Agent、IP）。
- 核心指标：页面访问量、上传率、处理成功率、下载率、remove.bg 调用成本、付费转化率、来源关键词与落地页表现。

## 13. SEO 需求

### 13.1 基础 SEO

每个页面具备：唯一 Title、唯一 Meta Description、唯一 H1、Canonical、Open Graph/Twitter 标签、结构化数据，以及首屏可见的真实工具。

已实现的结构化数据：

- 全站 Organization / WebSite（`app/layout.tsx`）。
- 各工具页 FAQPage 与 BreadcrumbList。
- 定价页 Product + Offer。

### 13.2 Title 示例

- 首页：`Free Background Remover & PNG Maker | ClearPNG`
- Logo 页：`Remove White Background from Logo Online | ClearPNG`
- 签名页：`Signature Background Remover - Make Signature Transparent | ClearPNG`
- 商品图页：`Product Photo Background Remover Online | ClearPNG`
- 白底图页：`Remove White Background from Image Online | ClearPNG`
- 定价页：`ClearPNG Pricing - Simple Background Removal Plans`

## 14. 设计要求

- 简洁、工具型、可信；首屏突出上传操作。
- 关键组件：顶部导航（Logo、Logo/Signature/Product Photo/White Background/Pricing 链接、登录态与额度、Upload 按钮）、上传卡片、处理中状态、结果预览区、背景切换、下载按钮、错误与支付结果提示。
- 移动端可上传、按钮足够大、处理状态清晰、下载按钮易于找到。

## 15. 验收标准

### 15.1 功能验收

- 未登录用户处理图片时被引导登录；Google 登录成功后回到原页面。
- 登录用户每月自动获得 3 个免费额度，顶栏显示剩余额度。
- 用户可以上传 JPG/PNG/WebP 并成功移除背景、预览透明 PNG、下载 `clearpng-result.png`。
- 超过 5MB 或不支持的格式被前后端拒绝并给出清晰提示。
- 额度用完返回 402 并引导到定价页。
- PayPal 沙箱与 Creem test 模式下可完成结账，付款后额度到账，刷新/重放 Webhook 不重复发额。
- 刷新页面后不出现历史图片；前端与构建产物不暴露任何 API 密钥。

### 15.2 部署验收

- 网站通过 Cloudflare Pages 可访问，HTTPS 正常。
- `/api/*` 通过 Pages Functions 可访问。
- 已配置全部环境变量并绑定 D1（`CLEARPNG_DB`），四个迁移已执行。
- 主要页面返回 200，`/robots.txt` 与 `/sitemap.xml` 可访问。
- PayPal 与 Creem Webhook 配置正确并验签通过。

### 15.3 SEO 验收

- 首页、场景页、定价页有唯一 title、description、H1。
- 首屏包含真实可用的上传工具。
- 场景页文案针对各自场景，不是简单复制。
- 已提交 Google Search Console。

## 16. 里程碑

- Milestone 1（已完成）：首页 + remove.bg 代理 + 透明 PNG 下载 + 基础错误提示。
- Milestone 2（已完成）：Logo/签名/商品图/白底场景页 + FAQ 与结构化数据。
- Milestone 3（已完成）：Google 登录、D1、免费额度、PayPal 与 Creem 支付、定价页。
- Milestone 4（部分完成）：棋盘格/白/黑预览已完成；Before/after 对比滑块、自动裁剪透明边距、本地换背景色导出待做。
- Milestone 5（规划中）：Turnstile、频率限制、批量处理、一次性加油包、Pro 功能。

## 17. 风险与应对

### 17.1 API 成本风险

remove.bg 按量计费。应对：5MB 文件限制、登录后按月额度限次、免费仅 3 张/月、付费套餐覆盖成本、Webhook 幂等防重复发额，后续可加 Turnstile。

### 17.2 支付与对账风险

应对：PayPal/Creem 双通道均做回跳验签 + Webhook 验签双保险；订单与 Webhook 事件落库；发额按订单号幂等。

### 17.3 SEO 竞争风险

主词竞争强。应对：优先做 Logo、签名、白底、商品图等场景页，每页都提供真实工具。

### 17.4 效果不可控风险

细线 Logo、签名可能被误处理。应对：页面预期管理、提供重试与多背景预览，后续考虑本地白底透明化算法。

## 18. 后续扩展方向

- 批量背景移除。
- Before/after 对比滑块、自动裁剪透明边距、自定义背景色导出。
- 一次性额度加油包（如 $2.99 / 5 张）。
- Logo 尺寸模板（favicon、社交头像、网站 header）。
- 签名增强（加深笔迹、去纸张阴影）。
- 商品图模板（白底、方图、社交图）。
- Cloudflare Turnstile 与更细的频率限制。
- 图片历史记录（需显式开启并明确隐私说明）。
- API 服务与订阅制。
