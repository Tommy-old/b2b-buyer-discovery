# Trade Hunting Skill

> AI 驱动的 B2B 客户发现工具 — 自动搜索、评估、提取联系方式，帮你从全球市场找到真实采购线索。内置示例以矿业设备行业为参考，关键词、市场、评分规则均可按需自定义。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 功能特性

| 模块 | 功能 |
|------|------|
| 智能搜索 | 通过 Google Custom Search API（推荐，100次/天免费）或 SerpAPI（备选）在 Google 上执行多关键词 × 多市场组合搜索，关键词和目标市场均可自定义（内置示例以矿业设备采购为参考） |
| 内容抓取 | 自动抓取搜索结果页面文本，过滤掉社交媒体、电商平台和供应商推广页面 |
| 双层评分 | **规则引擎**快速预筛（11 条规则过滤供应商/制造商） + **OpenAI / DeepSeek AI** 深度评分（0-10 分），精准识别真实买家 |
| 联系提取 | 自动提取邮箱、电话、WhatsApp、WeChat 等联系方式 |
| 二次补全 | 通过搜索 API 按公司名搜索，补全遗漏的邮箱和电话 |
| 本地存储 | JSON 数据库自动去重，记录每条线索的历史出现次数 |
| CSV 导出 | 12 分制中文格式导出，含 WhatsApp 直链、LinkedIn 搜索链接、Google OSINT 链接 |
| 开发信生成 | 西英双语自动生成开发信草稿（墨西哥/秘鲁/智利等拉美市场自动用西班牙语，其他市场用英语） |
| 邮件发送 | 通过 SMTP 批量发送开发信（默认 dry-run 模式，安全可控） |

## 技术栈

- **语言**: TypeScript 5.4
- **运行时**: Node.js 18+
- **搜索 API**: [Google Custom Search API](https://developers.google.com/custom-search)（推荐，100次/天免费）/ [SerpAPI](https://serpapi.com/)（备选，200次/月免费）
- **AI 评分**: [OpenAI API](https://platform.openai.com/)（推荐）/ [DeepSeek API](https://platform.deepseek.com/)（备选，国内用户无法开通 OpenAI 时选用）
- **浏览器自动化**: Playwright (可选，默认流程使用 axios 抓取页面，不需要 Playwright)
- **邮件**: Nodemailer + Gmail SMTP
- **日志**: Winston
- **数据存储**: Lowdb (JSON 文件数据库)
- **CSV 处理**: csv-stringify
- **辅助脚本**: Python 3.x (仅 `scripts/reformat_leads.py`)

## 安装步骤

### 前置要求

| 工具 | 最低版本 | 检查命令 |
|------|:------:|------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Python | 3.x | `python --version` (仅运行 `reformat_leads.py` 时需要) |

> **Node.js 下载**：如果还未安装，请前往 [nodejs.org](https://nodejs.org/) 下载 LTS 版本（Windows/macOS 直接运行安装包，Linux 推荐使用 nvm）。

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd b2b-buyer-discovery
```

### 2. 安装依赖

```bash
npm install
```

> **国内用户加速**：如果安装很慢，可使用淘宝镜像：
> ```bash
> npm install --registry=https://registry.npmmirror.com
> ```

### 3. 安装 Playwright 浏览器（绝大多数情况不需要）

**默认流程使用 axios 直接抓取页面，不需要 Playwright。** 只有当你修改源码、主动启用 `src/core/browser.ts` 的 `getPageText()` 来抓取 JavaScript 渲染的页面时，才需要安装：

```bash
npx playwright install chromium
```

> 如果你不确定是否需要，答案就是「不需要」。跳过这一步直接往下走即可。

## 配置说明

### 环境变量

复制示例配置文件并填入你的 API 密钥：

**Windows (PowerShell)：**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux：**
```bash
cp .env.example .env
```

编辑 `.env`，填写以下配置：

#### 搜索 API（二选一）

| 变量 | 优先级 | 说明 | 获取方式 |
|------|:---:|------|------|
| `GOOGLE_CSE_API_KEY` | **推荐** | Google Custom Search API Key，100次/天免费 | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → 创建 API Key，并启用 Custom Search API |
| `GOOGLE_CSE_CX` | **推荐** | 搜索引擎 ID（与 `GOOGLE_CSE_API_KEY` 配对使用） | [Programmable Search Engine](https://programmablesearchengine.google.com/) → 创建搜索引擎 → 获取 CX |
| `SERPAPI_KEY` | 备选 | SerpAPI Key，200次/月免费 | 注册 [serpapi.com](https://serpapi.com/) → Dashboard → API Key |

> **Google CSE 与 SerpAPI 的区别**：Google CSE 直接对接 Google 官方服务，每天 100 次免费搜索，数据最准确但需要 Google Cloud 账号和绑定信用卡。SerpAPI 是第三方封装，每月 200 次免费，无需信用卡即可注册。不想折腾 Google Cloud 的用户可用 SerpAPI 作为备选。

#### AI API（二选一）

| 变量 | 优先级 | 说明 | 获取方式 |
|------|:---:|------|------|
| `OPENAI_API_KEY` | **推荐** | OpenAI API Key，按 token 计费 | 注册 [platform.openai.com](https://platform.openai.com/) → API Keys → 创建 Key |
| `DEEPSEEK_API_KEY` | 备选 | DeepSeek API Key，价格低廉（约 ¥1/百万 token） | 注册 [platform.deepseek.com](https://platform.deepseek.com/) → API Keys → 创建 Key |

> **OpenAI 与 DeepSeek 的区别**：OpenAI 综合评分质量最高，但国内用户可能无法直接注册（需要海外手机号验证）。DeepSeek 国内可直接注册使用且价格更低，适合国内用户作为备选。

#### 搜索配置

| 变量 | 必填 | 默认值 | 说明 |
|------|:---:|------|------|
| `TARGET_MARKETS` | 否 | Peru,Indonesia,Ghana,Mexico,Chile,Nigeria | 目标市场，逗号分隔 |
| `MAX_RESULTS_PER_KEYWORD` | 否 | 20 | 每个关键词最大搜索结果数 |
| `MIN_SCORE` | 否 | 5 | 最低意向分阈值（0-10），低于此分的线索不输出 |
| `SEARCH_DELAY_MS` | 否 | 3000 | 搜索间隔（毫秒）。调太低会被 Google/SerpAPI 限流，建议不低于 2000 |

#### 邮件配置（可选，仅在使用邮件发送功能时需要）

| 变量 | 说明 |
|------|------|
| `SMTP_HOST` | SMTP 服务器地址（Gmail 填 `smtp.gmail.com`） |
| `SMTP_PORT` | SMTP 端口（Gmail 填 `587`） |
| `SMTP_SECURE` | 是否使用 TLS（Gmail 填 `false`，端口 587 用 STARTTLS） |
| `SMTP_USER` | 发件邮箱地址 |
| `SMTP_PASS` | **Gmail 应用专用密码**（非登录密码！获取方式见下方） |
| `MAIL_FROM_NAME` | 发件人显示名称（如 `Linda - MINA SC`） |
| `MAIL_FROM_ADDR` | 发件人邮箱地址（通常与 SMTP_USER 相同） |
| `MAIL_WHATSAPP` | 邮件签名中的 WhatsApp 号码 |
| `MAIL_WEBSITE` | 邮件签名中的网站 URL |
| `MAIL_MIN_SCORE` | 发邮件的最低意向分（默认 7，只给高分线索发邮件） |
| `MAIL_DELAY_MS` | 邮件发送间隔（默认 3000ms，避免触发 Gmail 限速） |

> **Gmail 应用专用密码获取步骤**：
> 1. 确保 Gmail 账号已开启[两步验证](https://myaccount.google.com/security)
> 2. 前往 [App Passwords](https://myaccount.google.com/apppasswords) 页面
> 3. 选择「Mail」和「Other」，输入名称（如 `Trade Hunting`），点击「Generate」
> 4. 复制生成的 16 位密码，填入 `SMTP_PASS`
>
> ⚠️ Gmail 从 2025 年起已禁用普通密码登录 SMTP，**必须**使用应用专用密码。

#### CSV 导出配置

| 变量 | 必填 | 默认值 | 说明 |
|------|:---:|------|------|
| `EXPORT_DIR` | 否 | `~/Desktop/矿机客户线索/` | CSV 文件导出目录 |

> **安全提醒**：`.env` 文件已在 `.gitignore` 中排除，不会被上传到 Git。请不要将真实 API Key 提交到公开仓库。

## 使用方法

### 快速开始

编辑 `.env` 中的 `TARGET_MARKETS` 和 `MIN_SCORE`，然后运行：

```bash
npm run hunt
```

> 默认配置（6 个市场）完整运行约需要 **3-5 分钟**。
> 运行过程中你会看到每条搜索和评分的进度日志，这是正常现象，不是错误。

### 自定义市场

`--` 是 npm 的参数透传分隔符——`--` 前面的参数给 npm，`--` 后面的参数传给程序本身：

```bash
# 指定市场（逗号分隔）
npm run hunt -- --market Peru,Chile,Colombia
```

### 自定义关键词

```bash
# 搜索特定产品
npm run hunt -- --keyword "cone crusher" --market Indonesia

# 配合自定义分数阈值
npm run hunt -- --keyword "jaw crusher" --market Ghana --score 7
```

### 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--keyword` | 指定搜索关键词 | `--keyword "ball mill"` |
| `--market` | 指定目标市场（逗号分隔） | `--market Peru,Chile` |
| `--score` | 最低意向分阈值 (0-10) | `--score 7` |

### 输出示例

> 以下以矿业设备行业为例。运行后会在终端输出评分最高的前 5 条线索：

```
#1 [AI:9/10 Rule:7] MINERA DEL SUR S.A.C.
   mining | jaw crusher PE-600x900 | Peru
   Send used crusher stock list with CIF price
   Email: purchasing@mineradelsur.com.pe
   WA: +51987654321
```

如果搜索无结果（关键词太偏门或市场太小），程序会正常结束并显示 `Done. 0 qualified leads found.`——这不是 bug，可以考虑换一批关键词再试。

### CSV 导出

CSV 文件默认导出到 `~/Desktop/矿机客户线索/`（可在 `.env` 中通过 `EXPORT_DIR` 自定义），包含以下列：

| 列名 | 说明 |
|------|------|
| 意向分 | 12 分制综合评分 |
| 意向等级 | 极高 / 高 / 中 / 低 |
| 特殊标记 | 价格询盘 / 经销商 / 招标 / 有邮箱 / 有WA |
| 公司名 | AI 识别的公司名称 |
| 邮箱 / 电话 / WhatsApp链接 | 联系方式 |
| LinkedIn搜索链接 | 一键跳转 LinkedIn 搜索 |
| Google OSINT | 一键跳转 Google 精准搜索 |
| 跟进优先级 | 经销商 / 极优先 / 优先 / 跟进 / 普通 |
| 开发建议 | AI 生成的跟进策略 |

### 重新格式化脚本（仅旧版升级用户）

> ⚠️ 如果你是新用户，跳过此节。这个脚本仅用于将旧版英文 CSV 转换为新版 12 分制中文格式。

```bash
python scripts/reformat_leads.py
```

脚本会自动找到最新的 CSV 文件，添加「开发信预览」列，输出到同目录。

## 项目结构

```
b2b-buyer-discovery/
├── src/
│   ├── index.ts                  # 入口文件，CLI 参数解析
│   ├── types.ts                  # 类型定义
│   ├── core/
│   │   ├── browser.ts            # Playwright 浏览器管理（默认流程不使用）
│   │   └── logger.ts             # Winston 日志
│   └── skills/
│       ├── search/
│       │   └── google.ts         # Google CSE / SerpAPI 搜索 + 公司联系方式搜索
│       ├── ai/
│       │   ├── scorer.ts         # OpenAI / DeepSeek AI 评分
│       │   └── rules.ts          # 规则引擎预筛
│       ├── extractors/
│       │   └── contact.ts        # 邮箱/电话/WhatsApp/公司名/国家提取
│       ├── db/
│       │   └── leads-db.ts       # JSON 数据库读写
│       ├── export/
│       │   └── csv.ts            # CSV 导出（12分制中文格式）
│       ├── email/
│       │   ├── composer.ts       # 西英双语开发信生成
│       │   └── sender.ts         # SMTP 邮件发送（支持 dry-run）
│       └── workflows/
│           └── hunting.ts        # 主工作流编排
├── scripts/
│   └── reformat_leads.py         # CSV 重新格式化工具（Python）
├── data/                         # 本地数据库（gitignore）
├── exports/                      # CSV 导出目录（gitignore）
├── logs/                         # 运行日志（gitignore）
├── .claude/                      # Claude 项目配置
├── .env.example                  # 环境变量模板
├── .gitignore
├── LICENSE                       # MIT 许可证
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

> **关于编译**：本项目通过 `ts-node` 直接运行 TypeScript 源码，**不需要编译**到 `dist/`。`npm run hunt` 直接运行 `src/index.ts`，无需 `npm run build`。

## 工作流程

```
1. Google 搜索
   ├── 多关键词 × 多市场组合搜索
   ├── 自动排除社交媒体/电商平台域名
   └── 去重
        │
2. 内容抓取
   ├── 抓取搜索结果页面文本（axios）
   └── 提取邮箱、电话、WhatsApp、WeChat
        │
3. 双层评分
   ├── 规则引擎：过滤供应商/制造商页面
   └── OpenAI / DeepSeek AI：0-10 分深度评分
        │
4. 联系补全
   └── 搜索 API 按公司名二次搜索，补全遗漏联系方式
        │
5. 存储导出
   ├── 存入本地 JSON 数据库（自动去重）
   └── 导出 12 分制中文 CSV
```

## 常见问题

| 问题 | 解答 |
|------|------|
| **运行报 `Cannot find module ts-node`** | Node.js 版本太低，需要 18+。运行 `node -v` 检查，如果不是 18+ 请升级。 |
| **`npm install` 特别慢** | 国内网络问题。使用 `npm install --registry=https://registry.npmmirror.com` 加速。 |
| **搜索不返回结果** | 先检查 API 额度：Google CSE 免费 **100 次/天**、SerpAPI 免费 **200 次/月**。额度用完服务会停止返回结果。如果额度充足但无结果，可能是关键词太偏门，换一批关键词再试。 |
| **邮件发送报 `Invalid login`** | Gmail 必须使用**应用专用密码**而非登录密码。参见上方「Gmail 应用专用密码获取步骤」。 |
| **`cp` 命令在 Windows 上报错** | PowerShell 中改用 `Copy-Item .env.example .env`，CMD 中改用 `copy .env.example .env`。 |
| **`python` 命令找不到** | 运行 `reformat_leads.py` 需要 Python 3.x。如果只使用 `npm run hunt`，不需要 Python。 |
| **运行时大量日志刷屏** | 正常现象。每条搜索和评分都会输出进度日志，方便追踪运行状态。 |
| **运行完没有任何输出** | 检查 `MIN_SCORE` 是否设得太高——如果所有线索得分都低于阈值，不会有任何输出。可临时调低到 3-4 试跑验证。 |

## 扩展开发

### 添加新市场

> 以下以矿业设备行业为例。在 `src/skills/search/google.ts` 的 `TARGET_MARKETS` 数组中添加目标市场：

```typescript
export const TARGET_MARKETS = [
  'Peru', 'Chile', 'Colombia', 'Mexico',
  'Indonesia', 'Ghana', 'Nigeria',
  'Brazil',   // 新增市场
];
```

同时在 `src/skills/extractors/contact.ts` 的 `countryMap` 中添加对应的国家/城市映射。

### 添加新关键词

在 `src/skills/search/google.ts` 的 `MINING_KEYWORDS` 数组中添加搜索词组。（变量名 `MINING_KEYWORDS` 为示例命名，你可根据实际行业重命名或替换整个数组。）

### 评分规则调优

- **规则引擎**：编辑 `src/skills/ai/rules.ts`，修改 `skipPatterns` 来调整过滤逻辑
- **AI 评分**：编辑 `src/skills/ai/scorer.ts` 中 `scoreLead()` 的 prompt 来优化评分策略

## 贡献指南

欢迎提交 Issue 和 Pull Request！（仓库推送到 GitHub 后以下流程生效）

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交前检查

- 确保 `.env` 没有被提交（已在 `.gitignore` 中）
- TypeScript 编译无错误：`npx tsc --noEmit`
- 代码风格保持一致

## 许可证

MIT License — 详见 [LICENSE](LICENSE) 文件。

---

**声明**：本项目仅用于合法的商业开发目的。使用者应遵守目标市场的法律法规，包括但不限于数据隐私和反垃圾邮件规定。
