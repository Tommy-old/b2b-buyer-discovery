# Trade Hunting Skill

AI-powered mining equipment buyer discovery. Searches Google for active buyers, EPC projects, and tenders in Latin America, SE Asia, and Africa. Scores leads with DeepSeek AI.

## Quick Start

```bash
# 1. Install
npm install
npx playwright install chromium

# 2. Configure
cp .env.example .env
# Fill in your DEEPSEEK_API_KEY

# 3. Run (default: Peru + Indonesia + Ghana)
npm run hunt

# Custom market
npm run hunt -- --market Peru,Chile,Colombia

# Custom keyword
npm run hunt -- --keyword "cone crusher" --market Indonesia

# Higher quality bar
npm run hunt -- --score 7
```

## What It Does

| Step | Description |
|------|-------------|
| 🔍 Search | Google搜索矿机买家 + 项目招标信息 |
| 📄 Scrape | 抓取页面详细内容 |
| 📇 Extract | 提取邮箱、电话、WhatsApp |
| 🤖 Score | DeepSeek AI 评分 0-10 |
| 💾 Save | 存入本地 SQLite 数据库 |
| 📊 Export | 导出 CSV 到 exports/ 目录 |

## Output Example

```
#1 [9/10] MINERA DEL SUR S.A.C.
   Type: mining | Product: jaw crusher PE-600x900
   Approach: Send used crusher stock list with CIF price
   Email: purchasing@mineradelsur.com.pe
```

## Keywords (可在 src/skills/search/google.ts 修改)

- jaw crusher buyer
- cone crusher importer  
- crusher tender
- new quarry project
- aggregate plant project
- jaw plate supplier

## Target Markets

拉美: Peru / Chile / Colombia / Mexico  
东南亚: Indonesia / Philippines / Vietnam  
非洲: Ghana / Nigeria / South Africa

## Files

```
exports/          ← CSV 导出文件
data/leads.db     ← SQLite 本地数据库
logs/             ← 运行日志
```
