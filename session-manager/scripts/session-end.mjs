/**
 * SessionEnd Hook: 세션 종료 시 active 파일 + current.md 타임스탬프 갱신
 *
 * - .ai/active/*.md 파일들의 last-active 타임스탬프 업데이트
 * - 하위 호환: .ai/current.md도 함께 갱신
 * - fire-and-forget: Claude 턴 없음
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const activePath = join(projectRoot, '.ai', 'active');
const currentPath = join(projectRoot, '.ai', 'current.md');

const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
const marker = `<!-- last-active: ${timestamp} -->`;

async function updateTimestamp(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');

    if (content.includes('<!-- last-active:')) {
      content = content.replace(/<!-- last-active: .+ -->/, marker);
    } else {
      content = content.trimEnd() + '\n\n' + marker + '\n';
    }

    await writeFile(filePath, content, 'utf-8');
  } catch {
    // 파일 없으면 무시
  }
}

// active/ 파일들 갱신
try {
  const files = await readdir(activePath);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  await Promise.all(mdFiles.map(f => updateTimestamp(join(activePath, f))));
} catch {
  // 폴더 없으면 무시
}

// 하위 호환: current.md 갱신
await updateTimestamp(currentPath);
