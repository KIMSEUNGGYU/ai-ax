/**
 * SessionStart Hook: 세션 시작 시 .ai/INDEX.md + active/ 목록 주입
 *
 * 1. .ai/INDEX.md 존재하면 additionalContext로 주입
 * 2. .ai/active/ 파일 목록을 systemMessage로 표시
 * 3. 하위 호환: .ai/current.md 있으면 함께 주입 (마이그레이션 지원)
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const indexPath = join(projectRoot, '.ai', 'INDEX.md');
const activePath = join(projectRoot, '.ai', 'active');
const currentPath = join(projectRoot, '.ai', 'current.md');

let indexContent = '';
let activeFiles = [];
let currentContent = '';

// INDEX.md 읽기
try {
  indexContent = await readFile(indexPath, 'utf-8');
} catch {
  // 없으면 무시
}

// active/ 파일 목록
try {
  const files = await readdir(activePath);
  activeFiles = files.filter(f => f.endsWith('.md'));
} catch {
  // 폴더 없으면 무시
}

// 하위 호환: current.md
try {
  currentContent = await readFile(currentPath, 'utf-8');
} catch {
  // 없으면 무시
}

const result = {};
const contextParts = [];
const messageParts = [];

// INDEX.md 주입
if (indexContent) {
  contextParts.push(`[session-manager] 프로젝트 컨텍스트:\n${indexContent}`);
  messageParts.push('[session-manager] INDEX.md 로드됨');
}

// current.md 하위 호환
if (currentContent) {
  contextParts.push(`[session-manager] 이전 작업 컨텍스트 (current.md):\n${currentContent}`);
  messageParts.push('[session-manager] current.md 감지 — active/ 방식으로 마이그레이션을 권장합니다.');
}

// active 파일 안내
if (activeFiles.length > 0) {
  const list = activeFiles.map(f => `  - ${f.replace('.md', '')}`).join('\n');
  messageParts.push(`[session-manager] 진행 중 작업 ${activeFiles.length}개:\n${list}\n→ /resume 으로 작업을 이어가세요.`);
} else if (!currentContent) {
  messageParts.push('[session-manager] 활성 작업 없음 — 새 세션');
}

if (contextParts.length > 0) {
  result.hookSpecificOutput = {
    hookEventName: 'SessionStart',
    additionalContext: contextParts.join('\n\n---\n\n'),
  };
}

if (messageParts.length > 0) {
  result.systemMessage = messageParts.join('\n');
} else {
  result.systemMessage = '[session-manager] 새 세션';
}

console.log(JSON.stringify(result));
