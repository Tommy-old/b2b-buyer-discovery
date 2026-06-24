# Trade Hunting Skill

> AI 驱动的矿机设备买家发现工具 — 自动搜索、评估、提取联系方式，帮你在拉美、东南亚、非洲找到真实采购线索。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 功能特性

| 模块 | 功能 |
|------|------|
| 智能搜索 | 通过 SerpAPI 在 Google 上搜索 18 组矿机采购关键词，覆盖拉美/东南亚/非洲多个市场 |
| 内容抓取 | 自动抓取搜索结果页面文本，过滤掉社交媒体、电商平台和供应商推广页面 |
| 双层评分 | **规则引擎**快速预筛 + **DeepSeek AI** 深度评分（0-10 分），精准识别真实买家 |
| 联系提取 | 自动提取邮箱、电话、WhatsApp、WeChat 等联系方式 |
| 二次补全 | 通过 SerpAPI 按公司名搜索，补全遗漏的邮箱和电话 |
| 本地存储 | JSON 数据库自动去重，记录每条线索的历史出现次数 |
| CSV 导出 | 12 分制中文格式导出，含 WhatsApp 直链、LinkedIn 搜索链接、Google OSINT 链接 |
| 开发信生成 | 西英双语自动生成开发信草稿，意向分 ≥7 的线索自动匹配 |
| 邮件发送 | 通过 SMTP 批量发送开发信（默认 dry-run 模式，安全可控） |

## 技术栈

- **语言**: TypeScript 5.4
- **运行时**: Node.js 18+
- **搜索 API**: [SerpAPI](https://serpapi.com/) (Google Search)
- **AI 评分**: [DeepSeek API](https://platform.deepseek.com/)
- **浏览器自动化**: Playwright (可选，用于复杂页面抓取)
- **邮件**: Nodemailer + Gmail SMTP
- **日志**: Winston
- **数据存储**: Lowdb (JSON 文件数据库)
- **CSV 处理**: csv-stringify

## 安装步骤

### 前置要求

- Node.js 18+
- npm 9+

### 1. 克隆仓库

```bash
git clone <your-repo-url>
cd trade-hunting-skill
```

### 2. 安装依赖

```bash
npm install
```

### 3. 安装 Playwright 浏览器（可选）

如果使用 Playwright 模式的页面抓取：

```bash
npx playwright install chromium
```

## 配置说明

### 环境变量

复制示例配置文件并填入你的 API 密钥：

```bash
cp .env.example .env
```

编辑 `.env`，填写以下必填项：

| 变量 | 必填 | 说明 |
|------|:---:|------|
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API Key，用于 AI 评分 |
| `SERPAPI_KEY` | 是 | SerpAPI Key，用于 Google 搜索 |
| `TARGET_MARKETS` | 否 | 目标市场，逗号分隔（默认：Peru,Indonesia,Ghana） |
| `MAX_RESULTS_PER_KEYWORD` | 否 | 每个关键词最大搜索结果数（默认：20） |
| `MIN_SCORE` | 否 | 最低意向分阈值（默认：5） |
| `SEARCH_DELAY_MS` | 否 | 搜索间隔毫秒数（默认：3000） |

**邮件配置（可选）**：

| 变量 | 说明 |
|------|------|
| `SMTP_HOST` | SMTP 服务器地址 |
| `SMTP_PORT` | SMTP 端口 |
| `SMTP_USER` | 发件邮箱 |
| `SMTP_PASS` | 邮箱密码/应用专用密码 |
| `MAIL_WHATSAPP` | 邮件签名中的 WhatsApp |
| `MAIL_WEBSITE` | 邮件签名中的网站 |
| `MAIL_MIN_SCORE` | 发邮件的最低意向分（默认：7） |
| `MAIL_DELAY_MS` | 邮件发送间隔（默认：3000） |

> **安全提醒**：`.env` 文件已在 `.gitignore` 中排除，不会被上传到 Git。请不要将真实 API Key 提交到公开仓库。

## 使用方法

### 基础用法

```bash
# 使用默认配置运行（Peru + Indonesia + Ghana，最低 5 分）
npm run hunt
```

### 自定义市场

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

运行后会在终端输出评分最高的前 5 条线索：

```
#1 [AI:9/10 Rule:7] MINERA DEL SUR S.A.C.
   mining | jaw crusher PE-600x900 | Peru
   Send used crusher stock list with CIF price
   Email: purchasing@mineradelsur.com.pe
   WA: +51987654321
```

### CSV 导出

CSV 文件默认导出到 `~/Desktop/矿机客户线索/`，包含以下列：

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

### 重新格式化脚本

如果已有旧版 CSV 导出文件，可用 Python 脚本重新格式化为 12 分制中文版：

```bash
python scripts/reformat_leads.py
```

该脚本会自动找到最新的 CSV 文件，添加「开发信预览」列，并输出到同目录。

## 项目结构

```
trade-hunting-skill/
├── src/
│   ├── index.ts                  # 入口文件，CLI 参数解析
│   ├── types.ts                  # 类型定义
│   ├── core/
│   │   ├── browser.ts            # Playwright 浏览器管理
│   │   └── logger.ts             # Winston 日志
│   └── skills/
│       ├── search/
│       │   └── google.ts         # SerpAPI 搜索 + 公司联系方式搜索
│       ├── ai/
│       │   ├── scorer.ts         # DeepSeek AI 评分
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
│   └── reformat_leads.py         # CSV 重新格式化工具
├── data/                         # 本地数据库（gitignore）
├── exports/                      # CSV 导出目录（gitignore）
├── logs/                         # 运行日志（gitignore）
├── .env.example                  # 环境变量模板
├── package.json
├── tsconfig.json
└── README.md
```

## 工作流程

```
1. Google 搜索
   ├── 多关键词 × 多市场组合搜索
   ├── 自动排除社交媒体/电商平台域名
   └── 去重
        │
2. 内容抓取
   ├── 抓取搜索结果页面文本
   └── 提取邮箱、电话、WhatsApp、WeChat
        │
3. 双层评分
   ├── 规则引擎：过滤供应商/制造商页面
   └── DeepSeek AI：0-10 分深度评分
        │
4. 联系补全
   └── SerpAPI 按公司名二次搜索，补全遗漏联系方式
        │
5. 存储导出
   ├── 存入本地 JSON 数据库
   └── 导出 12 分制中文 CSV
```

## 扩展开发

### 添加新市场

在 `src/skills/search/google.ts` 的 `TARGET_MARKETS` 数组中添加：

```typescript
export const TARGET_MARKETS = [
  'Peru', 'Chile', 'Colombia', 'Mexico',
  'Indonesia', 'Ghana', 'Nigeria',
  'Brazil',   // 新增市场
];
```

同时在 `src/skills/extractors/contact.ts` 的 `countryMap` 中添加对应的国家/城市映射。

### 添加新关键词

在 `src/skills/search/google.ts` 的 `MINING_KEYWORDS` 数组中添加搜索词组。

### 评分规则调优

- **规则引擎**：编辑 `src/skills/ai/rules.ts`，修改 `skipPatterns` 来调整过滤逻辑
- **AI 评分**：编辑 `src/skills/ai/scorer.ts` 中 `scoreLead()` 的 prompt 来优化评分策略

## 贡献指南

欢迎提交 Issue 和 Pull Request！

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
