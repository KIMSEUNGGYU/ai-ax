/**
 * SessionEnd Hook: 세션 종료 시 current.md 타임스탬프 갱신
 *
 * - current.md 존재하면 last-active 타임스탬프 업데이트
 * - 없으면 아무것도 안 함
 * - fire-and-forget: Claude 턴 없음
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const currentPath = join(projectRoot, '.ai', 'current.md');

try {
  let content = await readFile(currentPath, 'utf-8');
  const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const marker = `<!-- last-active: ${timestamp} -->`;

  if (content.includes('<!-- last-active:')) {
    content = content.replace(/<!-- last-active: .+ -->/, marker);
  } else {
    content = content.trimEnd() + '\n\n' + marker + '\n';
  }

  await writeFile(currentPath, content, 'utf-8');
} catch {
  // current.md 없으면 아무것도 안 함
}
