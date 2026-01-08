import { config } from 'dotenv';
import { existsSync } from 'fs';

// Prefer .env.test, then .env.local, then fallback to .env
if (existsSync('.env.test')) {
  config({ path: '.env.test' });
} else if (existsSync('.env.local')) {
  config({ path: '.env.local' });
} else {
  config();
}

// Minimal sanity log (won't expose secrets)
import { logger } from '../src/utils/logger';

if (process.env.EMAIL_HOST) {
  logger.info({ service: 'JestEnv', event: 'EMAIL_HOST loaded' });
}
