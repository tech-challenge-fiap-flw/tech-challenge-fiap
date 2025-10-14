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
if (process.env.EMAIL_HOST) {
  // eslint-disable-next-line no-console
  console.log('[JestEnv] EMAIL_HOST loaded');
}
