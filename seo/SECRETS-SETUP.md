# ClearPNG SEO 自动化：Secrets 配置指南

整套自动化跑在 GitHub Actions 上（每周一早上自动执行），push 到 main 后
Cloudflare Pages 自动构建部署，无需任何手工部署动作。

配置入口：仓库页 → `Settings` → `Secrets and variables` → `Actions`。

## 当前状态

| 模块 | 依赖 | 状态 |
|---|---|---|
| 每周文章生成（生成→构建验证→提交→等部署→IndexNow） | `LLM_API_KEY` + Variables | ✅ 已配置并验证 |
| GSC 每周关键词报表 | `GSC_OAUTH_CLIENT_ID` `GSC_OAUTH_CLIENT_SECRET` `GSC_OAUTH_REFRESH_TOKEN` | ✅ 已配置（OAuth 凭据与 pdf-markdown 共用同一套） |
| IndexNow 推送 | `INDEXNOW_KEY` | ✅ 已配置，验证文件 public/cf1981ef735b4d09b5a508a8a755e87e.txt |

## Secret 清单

| 名称 | 值 | 说明 |
|---|---|---|
| `LLM_API_KEY` | DeepSeek API Key | 文章生成 |
| `GSC_OAUTH_CLIENT_ID` | 与 pdf-markdown 共用 | Google OAuth 桌面客户端（只读 Search Console） |
| `GSC_OAUTH_CLIENT_SECRET` | 与 pdf-markdown 共用 | 同上 |
| `GSC_OAUTH_REFRESH_TOKEN` | 与 pdf-markdown 共用 | 同上（作用域覆盖账号下全部已验证站点） |
| `INDEXNOW_KEY` | cf1981ef735b4d09b5a508a8a755e87e | 验证文件已随站点发布 |

Variables（非敏感）：
- `LLM_API_BASE` = `https://api.deepseek.com/v1`
- `LLM_MODEL` = `deepseek-flash`

## 工作流说明

- `SEO weekly`：每周日 23:00 UTC（周一早 7 点北京）自动执行：
  取词 → DeepSeek 生成 900-1300 词英文文章 → 质量门槛（词数/内链/禁外链/
  模板字符串安全检查）→ `npm run build` 验证 → 提交 push → Cloudflare 自动构建
  → 轮询新文上线（10 分钟超时）→ IndexNow 推送 → GSC 周报提交。
  任一环节失败对应任务红叉，不影响其他任务。

## 补充关键词

词库用完后向 `seo/keywords.json` 的 `keywords` 数组添加新条目
（keyword / slug / angle 三个字段，angle 是给 LLM 的写作角度提示）。
