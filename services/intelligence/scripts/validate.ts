#!/usr/bin/env npx ts-node
// Pre-deploy validation — runs tsc --noEmit and reports result
// Called by GitHub Actions before Railway deploys

import { execSync } from 'child_process';

console.log('[validate] Running TypeScript compile check...');

try {
  execSync('npx tsc --noEmit', { 
    cwd: process.cwd(),
    stdio: 'pipe'
  });
  console.log('[validate] ✅ TypeScript compile: PASS');
  process.exit(0);
} catch (err: unknown) {
  const error = err as { stdout?: Buffer; stderr?: Buffer };
  const output = error.stdout?.toString() ?? '';
  console.error('[validate] ❌ TypeScript compile: FAIL');
  console.error(output);
  process.exit(1);
}
