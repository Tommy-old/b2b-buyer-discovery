import dotenv from 'dotenv';
dotenv.config();

import { runHuntingWorkflow } from './workflows/hunting';
import { logger } from './core/logger';
import { MINING_KEYWORDS, TARGET_MARKETS } from './skills/search/google';

// 从命令行参数解析
const args = process.argv.slice(2);

function parseArgs() {
  const opts: {
    keywords?: string[];
    markets?: string[];
    minScore?: number;
  } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--keyword' && args[i + 1]) {
      opts.keywords = [args[i + 1]];
      i++;
    }
    if (args[i] === '--market' && args[i + 1]) {
      opts.markets = args[i + 1].split(',');
      i++;
    }
    if (args[i] === '--score' && args[i + 1]) {
      opts.minScore = Number(args[i + 1]);
      i++;
    }
  }

  return opts;
}

async function main() {
  const cliOpts = parseArgs();

  logger.info('MINA SC Trade Hunting Skill');
  logger.info('Target: Mining equipment buyers in Latin America, SE Asia, Africa');
  logger.info('Model: DeepSeek AI');

  if (!process.env.DEEPSEEK_API_KEY) {
    logger.error('DEEPSEEK_API_KEY not found. Please copy .env.example to .env and fill in your key.');
    process.exit(1);
  }

  // 默认：5个关键词 × 3个主力市场
  const opts = {
    keywords: cliOpts.keywords || MINING_KEYWORDS.slice(0, 5),
    markets: cliOpts.markets || ['Peru', 'Indonesia', 'Ghana'],
    minScore: cliOpts.minScore || 5,
    exportCsv: true,
  };

  logger.info('Config:', opts);

  try {
    const leads = await runHuntingWorkflow(opts);
    logger.info(`Done. ${leads.length} qualified leads found.`);
  } catch (err: any) {
    logger.error('Workflow failed', { error: err.message });
    process.exit(1);
  }
}

main();
