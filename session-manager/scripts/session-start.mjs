/**
 * SessionStart Hook: 세션 시작 시 .ai/current.md 로드
 *
 * - .ai/current.md 존재하면 additionalContext로 주입
 * - 없으면 아무것도 주입하지 않음
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const currentPath = join(projectRoot, '.ai', 'current.md');

let content = '';
try {
  content = await readFile(currentPath, 'utf-8');
} catch {
  // current.md 없으면 빈 결과
}

const result = {};

if (content) {
  result.hookSpecificOutput = {
    hookEventName: 'SessionStart',
    additionalContext: `[session-manager] 이전 작업 컨텍스트:\n${content}`,
  };
  result.systemMessage = '[session-manager] current.md 로드됨';
} else {
  result.systemMessage = '[session-manager] current.md 없음 — 새 세션';
}

console.log(JSON.stringify(result));
