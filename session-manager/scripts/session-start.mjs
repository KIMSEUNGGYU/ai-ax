/**
 * SessionStart Hook: 세션 시작 시 STATUS.md 로드 + 세션 ID 생성
 *
 * - .ai/STATUS.md 내용을 additionalContext로 주입
 * - 세션 ID를 생성해서 컨텍스트에 포함
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

const projectRoot = process.cwd();
const statusPath = join(projectRoot, '.ai', 'STATUS.md');
const sessionId = `${new Date().toISOString().slice(0, 10)}_${randomBytes(2).toString('hex')}`;

let statusContent = '';
try {
  statusContent = await readFile(statusPath, 'utf-8');
} catch {
  // STATUS.md 없으면 무시
}

const context = [
  `[session-manager] 세션 ID: ${sessionId}`,
  statusContent
    ? `[session-manager] 이전 작업 상태:\n${statusContent}`
    : '[session-manager] 이전 작업 상태 없음 (.ai/STATUS.md 미존재)',
].join('\n\n');

console.log(JSON.stringify({
  continue: true,
  hookSpecificOutput: {
    additionalContext: context,
  },
}));
