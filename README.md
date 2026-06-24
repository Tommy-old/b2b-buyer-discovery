# B2B Buyer Discovery — 外贸获客 · 外贸客户开发 · 开发信自动生成工具

> 专为外贸人打造的 AI 外贸获客工具：自动搜索海外潜在买家 → 智能评分筛选高质量客户线索 → 提取邮箱和 WhatsApp → 自动生成多语种外贸开发信。无需编程基础，只需复制几条命令，让 AI 帮你做 B2B 客户开发。无论你是外贸公司团队还是外贸 SOHO 一人公司，这个外贸工具都能大幅提升你的客户线索挖掘效率。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 为什么外贸人需要这个工具？

做外贸客户开发，最头疼的无非这几件事：

- **搜客户像大海捞针**：在 Google 上一页页翻，大部分结果是黄页、同行广告、B2B 平台，真正有价值的潜在客户少之又少
- **判断客户质量靠猜**：好不容易找到一个网站，看着像买家又像供应商，发了几十封 cold email 石沉大海
- **找联系方式太费时间**：Contact Us 页面、网站的犄角旮旯、甚至要手动去 LinkedIn 交叉验证——找到一家公司可能要花半小时
- **写开发信效率低**：每封信都要查国家、查语言、查产品适配，一天下来也写不了几封高质量的外贸开发信

这个外贸获客工具就是为解决这些痛点设计的——把搜索、筛选、评分、联系提取、开发信生成全部自动化。你只需要设置好产品和目标市场，剩下的交给 AI。不管你是做机械设备出口的老外贸，还是刚入行的外贸 SOHO，都能用这个外贸工具把客户线索挖掘的效率提升 10 倍以上。

## 这个工具能帮你做什么？

如果你在做外贸、每天花大量时间在 Google 上手动搜客户、翻黄页、猜邮箱、写开发信——这个工具可以帮你把这些重复劳动自动化。

### 核心能力

| 你手动做的事 | 工具自动完成 |
|-------------|-------------|
| 在 Google 上搜 "mining equipment buyer Peru"，翻几十页结果 | 多关键词 × 多市场**批量搜索**，一次覆盖全球目标国家 |
| 点开每个网站判断是不是真实买家还是同行/黄页 | AI 双层评分：规则引擎快速过滤垃圾 + AI 深度分析购买意向 |
| 满页面找邮箱、电话、WhatsApp | 自动提取联系方式，并二次搜索补全遗漏的 |
| 手动查公司背景决定跟进优先级 | 输出 12 分制**意向评分**，按极高/高/中/低排序 |
| 一份份手动写英文/西语开发信 | **西英双语开发信自动生成**，拉美市场自动用西班牙语 |
| 手工整理 Excel | 一键导出 CSV，含 WhatsApp 直链、LinkedIn 搜索链接 |

### 工作流程（一看就懂）

```
设定目标市场和国家
   ↓
AI 自动搜索 Google（你的产品关键词 × 目标国家）
   ↓
抓取搜索结果，提取公司名、邮箱、电话、WhatsApp
   ↓
双层评分：过滤掉供应商 + 对真实买家打分（0-10 分）
   ↓
输出客户线索表格（CSV）+ 自动生成开发信草稿
```

> **适用场景**：外贸获客、B2B 客户开发、cold email 营销、海外潜在买家挖掘、询盘线索收集、外贸 SOHO 自主开发客户。无论你是做机械设备、化工、建材、电子元器件还是消费品，只要修改关键词即可适配你的行业。

---

## 快速上手（新手只需 5 步）

不需要技术背景。如果你会复制粘贴命令行，5 分钟就能开启你的外贸获客自动化之旅。

### 第 1 步：安装 Node.js

访问 [nodejs.org](https://nodejs.org/)，下载 LTS 版本（左边的绿色按钮），一路"下一步"安装。

安装完成后，按 `Win + R`，输入 `cmd`，回车，输入以下命令验证：

```bash
node -v
```

如果显示 `v18.x.x` 或更高版本号，说明安装成功。

### 第 2 步：下载项目

```bash
git clone https://github.com/Tommy-old/b2b-buyer-discovery.git
cd b2b-buyer-discovery
```

> 如果没有 git，也可以直接在 GitHub 页面点绿色的「Code」→「Download ZIP」，解压后进入文件夹。

### 第 3 步：安装依赖

```bash
npm install
```

> 如果安装很慢（国内网络），用这条命令：
> ```bash
> npm install --registry=https://registry.npmmirror.com
> ```

### 第 4 步：配置 API 密钥

复制配置模板：

**Windows**：在文件夹里找到 `.env.example`，复制粘贴一份，重命名为 `.env`。

**Mac**：打开终端执行 `cp .env.example .env`。

然后编辑 `.env` 文件，你需要申请两个 API（二选一即可）：

**搜索 API——申请一个就行：**

| 选择 | 免费额度 | 难度 | 适合 |
|------|:---:|:---:|------|
| Google Custom Search（推荐） | 100次/天 | ⭐⭐⭐ 需要绑信用卡 | 数据最准，适合长期使用 |
| SerpAPI（备选） | 200次/月 | ⭐ 无需信用卡 | 零门槛，适合先试用 |

**AI 评分 API——申请一个就行：**

| 选择 | 费用 | 难度 | 适合 |
|------|------|:---:|------|
| OpenAI（推荐） | 按量计费，很便宜 | ⭐⭐ 需海外手机号 | 评分最准 |
| DeepSeek（备选） | ¥1/百万 token | ⭐ 国内直接注册 | 国内用户首选 |

把申请到的 Key 填入 `.env` 文件中对应的位置。**只需要填你选择的那一组，另一组保持默认即可。**

### 第 5 步：修改搜索目标，开始运行

打开 `.env`，找到下面两行，改成你的产品和目标市场：

```
TARGET_MARKETS=Peru,Chile,Mexico    ← 改成你的目标国家
MIN_SCORE=5                          ← 只输出 5 分以上的客户
```

保存，然后在项目目录下打开终端，输入：

```bash
npm run hunt
```

等 3-5 分钟，客户线索就出来了。运行过程中看到一堆日志是正常的——那是工具在告诉你搜索进度。

---

## 你能得到什么？

### 1. 终端实时预览

运行结束后，终端会显示评分最高的前 5 条客户线索：

```
#1 [AI:9/10 Rule:7] MINERA DEL SUR S.A.C.
   mining | jaw crusher | Peru
   Email: purchasing@mineradelsur.com.pe
   WA: +51987654321
```

### 2. CSV 客户线索表（核心产出）

自动导出到桌面（路径可在 `.env` 中自定义），用 Excel 打开即可——这就是你做外贸获客的客户线索数据库：

| 列名 | 内容 |
|------|------|
| 意向分 | 12 分制综合评分，越高越值得跟进 |
| 意向等级 | 🔴极高(10-12) / 🟠高(7-9) / 🟡中(4-6) / 🟢低(1-3) |
| 特殊标记 | 🔥价格询盘 / ⭐经销商 / 📧有邮箱 / 💬有 WhatsApp |
| 公司名 / 邮箱 / 电话 | 自动提取的联系方式 |
| WhatsApp 链接 | 一键跳转 WhatsApp 聊天 |
| LinkedIn 搜索链接 | 一键搜索公司决策人 |
| 开发建议 | AI 给出的跟进策略（如何打动这个客户） |
| 开发信预览 | 自动生成的西语/英语外贸开发信草稿（意向分 ≥ 7 的客户） |

### 3. 外贸开发信自动生成

意向分 ≥ 7 的高质量客户，工具会自动生成外贸开发信草稿——这是 B2B 客户开发中最关键的一步：

- **拉美市场**（墨西哥、秘鲁、智利、哥伦比亚等）：自动用**西班牙语**写开发信
- **其他市场**：自动用**英语**写开发信

每封开发信都包含：
- 个性化称呼和公司名
- 根据客户需求定制的产品推荐
- 公司介绍和库存情况
- 专业的 CTA（Call to Action，引导回复）

> **建议**：AI 生成的开发信是草稿，建议你根据实际情况微调后再发送。

---

## 常见问题

### 使用相关

**Q: 我不知道该搜什么关键词怎么办？**

想想你的海外客户会在 Google 上搜什么。以做破碎机出口为例：
- 产品名：`jaw crusher`、`cone crusher`
- 购买意图：`buy mining equipment`、`crusher supplier needed`
- 行业场景：`mining machinery`、`quarry equipment`

建议先跑一次默认配置看看效果，再根据结果调整关键词。关键词越精准，找到的客户质量越高。

**Q: 搜索结果太少（甚至为 0）怎么办？**

1. 检查 API 额度是否用完（Google CSE 100次/天，SerpAPI 200次/月）
2. 尝试放宽关键词——把 `PE600×900 jaw crusher` 换成 `jaw crusher`
3. 增加搜索市场——多选几个目标国家
4. 调低 `MIN_SCORE`（比如从 5 降到 3），先看有多少线索再筛

**Q: 开发信怎么写回复率更高？**

工具生成的开发信已经遵循了一些高回复率原则：
- 拉美市场自动用西班牙语（本地化语言的回复率比英语高 3-5 倍）
- 不泛泛介绍公司，而是针对客户需求推荐具体产品
- 结尾用问句引导回复（"Would you like a detailed quotation?"）

如果你想让回复率更高，建议做两件事：
1. 发送前加上客户的联系人姓名（在 LinkedIn 上查一下）
2. 在信的中间加一句你对他们公司的了解（"I noticed your recent expansion in..."）

**Q: 搜索出来的客户不相关怎么办？**

在 `src/skills/ai/rules.ts` 中有一个 `skipPatterns` 数组，定义了哪些类型的页面会被过滤掉。默认过滤供应商/制造商/黄页——如果你的产品恰好需要卖给经销商，可以去掉对应规则。

**Q: 除了矿业设备，其他行业能不能用？**

完全可以。把 `.env` 中的 `TARGET_MARKETS` 改成你的目标国家，运行时加 `--keyword "你的产品关键词"` 即可。化工、建材、电子元器件、机械设备、消费品都适用——工具的架构是行业无关的。

### 技术相关

**Q: 运行报 `Cannot find module ts-node`**

Node.js 版本太低。运行 `node -v` 检查，如果低于 18，去 [nodejs.org](https://nodejs.org/) 下载最新 LTS 版覆盖安装。

**Q: `npm install` 特别慢**

国内网络问题。用淘宝镜像：`npm install --registry=https://registry.npmmirror.com`

**Q: 邮件发送报 `Invalid login`**

Gmail 从 2025 年起禁用普通密码登录 SMTP，必须使用应用专用密码。获取步骤：Google 账号 → 安全性 → 两步验证 → App Passwords → 生成密码后填入 `SMTP_PASS`。

**Q: 运行时终端疯狂刷日志，是不是出错了？**

不是。每条搜索和评分都会输出进度日志，这是正常现象。如果你想少看日志，可以修改 `src/core/logger.ts` 中的日志级别。

**Q: 运行完什么输出都没有**

检查 `MIN_SCORE` 是否设得太高。如果所有客户得分都低于阈值，就不会输出。建议先设 3-4 试跑一次确认搜索正常，再调回你需要的阈值。

**Q: 默认用哪种搜索 API？**

代码自动检测 `.env` 中填了哪个 API。如果同时填了 Google CSE 和 SerpAPI，优先使用 Google CSE。详细说明见下方「技术参考 > 配置说明」。

---

## 技术参考

> 以下内容面向希望深入了解或二次开发的技术用户。如果你只是想用这个工具做外贸获客，看完上面「快速上手」就可以开始用了。

### 技术栈

| 类别 | 技术 |
|------|------|
| 语言 | TypeScript 5.4 |
| 运行时 | Node.js 18+ |
| 搜索 API | Google Custom Search API（推荐）/ SerpAPI（备选） |
| AI 评分 | OpenAI API（推荐）/ DeepSeek API（备选） |
| 邮件发送 | Nodemailer + Gmail SMTP |
| 浏览器引擎 | Playwright（可选，默认使用 axios 抓取） |
| 数据存储 | Lowdb (JSON 文件数据库) |
| CSV 处理 | csv-stringify |
| 日志 | Winston |

### 项目结构

```
b2b-buyer-discovery/
├── src/
│   ├── index.ts                  # 入口，CLI 参数解析
│   ├── types.ts                  # TypeScript 类型定义
│   ├── core/
│   │   ├── browser.ts            # Playwright 浏览器管理
│   │   └── logger.ts             # Winston 日志配置
│   └── skills/
│       ├── search/
│       │   └── google.ts         # Google CSE / SerpAPI 搜索 + 公司联系补全
│       ├── ai/
│       │   ├── scorer.ts         # OpenAI / DeepSeek AI 评分
│       │   └── rules.ts          # 规则引擎（11 条过滤规则）
│       ├── extractors/
│       │   └── contact.ts        # 邮箱/电话/WhatsApp/公司名提取
│       ├── db/
│       │   └── leads-db.ts       # JSON 数据库（自动去重）
│       ├── export/
│       │   └── csv.ts            # 12 分制中文 CSV 导出
│       ├── email/
│       │   ├── composer.ts       # 西英双语开发信生成
│       │   └── sender.ts         # SMTP 发送（dry-run 模式）
│       └── workflows/
│           └── hunting.ts        # 主工作流编排
├── scripts/
│   └── reformat_leads.py         # 旧版 CSV 升级工具（一般不需要）
├── data/                         # 本地数据库
├── exports/                      # CSV 导出目录
├── logs/                         # 运行日志
├── .env.example                  # 环境变量模板
├── package.json
└── tsconfig.json
```

> 本项目通过 `ts-node` 直接运行 TypeScript 源码，无需编译。

### 完整配置参考

#### 搜索 API

| 变量 | 优先级 | 说明 | 获取方式 |
|------|:---:|------|------|
| `GOOGLE_CSE_API_KEY` | **推荐** | Google Custom Search API Key | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → 启用 Custom Search API → Credentials |
| `GOOGLE_CSE_CX` | **推荐** | 搜索引擎 ID | [Programmable Search Engine](https://programmablesearchengine.google.com/) → 创建 → 获取 CX |
| `SERPAPI_KEY` | 备选 | SerpAPI Key | [serpapi.com](https://serpapi.com/) → Dashboard |

#### AI 评分

| 变量 | 优先级 | 说明 | 获取方式 |
|------|:---:|------|------|
| `OPENAI_API_KEY` | **推荐** | OpenAI API Key | [platform.openai.com](https://platform.openai.com/) → API Keys |
| `DEEPSEEK_API_KEY` | 备选 | DeepSeek API Key | [platform.deepseek.com](https://platform.deepseek.com/) → API Keys |

#### 搜索 & 邮件

| 变量 | 默认值 | 说明 |
|------|------|------|
| `TARGET_MARKETS` | Peru,Indonesia,Ghana,Mexico,Chile,Nigeria | 目标市场（逗号分隔） |
| `MAX_RESULTS_PER_KEYWORD` | 20 | 每个关键词最多抓几条结果 |
| `MIN_SCORE` | 5 | 最低意向分（0-10） |
| `SEARCH_DELAY_MS` | 3000 | 搜索间隔（毫秒），太短会触发限流 |
| `SMTP_HOST` | smtp.gmail.com | SMTP 服务器 |
| `SMTP_PORT` | 587 | SMTP 端口 |
| `SMTP_SECURE` | false | 是否 TLS |
| `SMTP_USER` | — | 发件邮箱 |
| `SMTP_PASS` | — | Gmail 应用专用密码 |
| `MAIL_FROM_NAME` | — | 发件人名称 |
| `MAIL_FROM_ADDR` | — | 发件地址 |
| `MAIL_MIN_SCORE` | 7 | 最低发件意向分 |
| `MAIL_DELAY_MS` | 3000 | 发件间隔 |
| `EXPORT_DIR` | ~/Desktop/矿机客户线索/ | CSV 导出目录 |

### 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--keyword` | 指定搜索关键词 | `--keyword "ball mill"` |
| `--market` | 指定目标市场 | `--market Peru,Chile` |
| `--score` | 最低意向分 | `--score 7` |

### 工作流程（详细）

```
1. Google 搜索
   ├── 多关键词 × 多市场组合搜索
   ├── 自动排除社交媒体/电商/供应商域名
   └── 结果去重
        │
2. 内容抓取
   ├── axios 抓取页面文本
   └── 正则提取邮箱/电话/WhatsApp/公司名
        │
3. 双层评分
   ├── 规则引擎：11 条规则过滤供应商/制造商/黄页
   └── AI 深度评分：0-10 分，分析购买意向
        │
4. 联系补全
   └── 按公司名二次搜索补全遗漏联系方式
        │
5. 导出
   ├── 存入 JSON 数据库（自动去重，记录累计出现次数）
   └── 导出 12 分制中文 CSV + 开发信预览
```

### 扩展开发

**添加新目标市场**：编辑 `src/skills/search/google.ts` 中 `TARGET_MARKETS` 数组，并在 `src/skills/extractors/contact.ts` 的 `countryMap` 中添加国家映射。

**添加搜索关键词**：编辑 `src/skills/search/google.ts` 中的关键词数组。

**调整评分逻辑**：
- 规则引擎：修改 `src/skills/ai/rules.ts` 的 `skipPatterns`
- AI 评分：修改 `src/skills/ai/scorer.ts` 的 prompt

## 贡献指南

欢迎提 Issue 和 PR！仓库地址：https://github.com/Tommy-old/b2b-buyer-discovery

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/amazing-feature`)
3. 提交 (`git commit -m 'Add amazing feature'`)
4. 推送 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交前检查

- `.env` 不能提交（已在 `.gitignore` 中）
- `npx tsc --noEmit` 无错误

## 许可证

MIT License — 详见 [LICENSE](LICENSE)。

---

**声明**：本项目仅用于合法的商业开发。使用者应遵守目标市场法律法规（包括数据隐私和反垃圾邮件法规）。
