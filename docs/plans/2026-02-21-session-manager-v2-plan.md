# session-manager v2 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 세션 지식 유실 방지 + 저장 체계 확립 — session-end Hook, /note 커맨드, note 스킬 추가

**Architecture:** v1(current.md 기반 context 관리) 위에 3개 컴포넌트 추가. session-end Hook은 SessionEnd 이벤트로 current.md 백업/타임스탬프 기록 (fire-and-forget, Claude 턴 없음). /note 커맨드는 세션 지식을 AI 자동 판단으로 적절한 영속 저장소에 저장. note 스킬은 자연어 트리거.

**Tech Stack:** Node.js (ESM), Claude Code Plugin System (hooks.json, commands/, skills/)

**기술 제약:** SessionEnd Hook은 fire-and-forget — 스크립트가 직접 파일 조작만 가능, Claude에게 턴을 줄 수 없음. 따라서 "지능적 업데이트"는 불가하고, 메타데이터 수준의 자동화만 가능.

---

### Task 1: session-end Hook — hooks.json 등록

**Files:**
- Modify: `session-manager/hooks/hooks.json`

**Step 1: hooks.json에 SessionEnd 이벤트 추가**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/session-start.mjs\"",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/session-end.mjs\"",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

**Step 2: JSON 문법 검증**

Run: `node -e "JSON.parse(require('fs').readFileSync('session-manager/hooks/hooks.json', 'utf-8')); console.log('OK')"`
Expected: `OK`

---

### Task 2: session-end Hook — 스크립트 작성

**Files:**
- Create: `session-manager/scripts/session-end.mjs`

**Step 1: session-end.mjs 작성**

current.md 존재 시 "last active" 타임스탬프를 주석으로 추가/갱신. 없으면 아무것도 안 함.

```javascript
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

  // 기존 마커 교체 또는 파일 끝에 추가
  if (content.includes('<!-- last-active:')) {
    content = content.replace(/<!-- last-active: .+ -->/, marker);
  } else {
    content = content.trimEnd() + '\n\n' + marker + '\n';
  }

  await writeFile(currentPath, content, 'utf-8');
} catch {
  // current.md 없으면 아무것도 안 함
}
```

**Step 2: 스크립트 단독 실행 테스트**

테스트용 current.md 생성 후 스크립트 실행:

Run: `echo "# Test" > /tmp/test-current.md && cd /tmp && mkdir -p .ai && cp test-current.md .ai/current.md && node /path/to/session-end.mjs && cat .ai/current.md`
Expected: `# Test` 뒤에 `<!-- last-active: YYYY-MM-DD HH:MM -->` 추가됨

**Step 3: 커밋**

```bash
git add session-manager/hooks/hooks.json session-manager/scripts/session-end.mjs
git commit -m "feat: session-end Hook 추가 — 세션 종료 시 타임스탬프 자동 갱신"
```

---

### Task 3: session-start 시스템 메시지 강화

**Files:**
- Modify: `session-manager/scripts/session-start.mjs`

**Step 1: current.md 로드 시 /save 리마인더 추가**

session-start.mjs의 systemMessage를 강화하여, current.md가 있을 때 /save 리마인더 포함:

```javascript
if (content) {
  result.hookSpecificOutput = {
    hookEventName: 'SessionStart',
    additionalContext: `[session-manager] 이전 작업 컨텍스트:\n${content}`,
  };
  result.systemMessage = '[session-manager] current.md 로드됨. 주요 진전 시 /save로 저장하세요.';
} else {
  result.systemMessage = '[session-manager] current.md 없음 — 새 세션';
}
```

변경점: systemMessage에 `/save` 리마인더 추가.

**Step 2: 커밋**

```bash
git add session-manager/scripts/session-start.mjs
git commit -m "fix: session-start 시스템 메시지에 /save 리마인더 추가"
```

---

### Task 4: /note 커맨드 작성

**Files:**
- Create: `session-manager/commands/note.md`

**Step 1: note.md 작성**

참고: `session-manager/commands/save.md`의 구조를 따름 (frontmatter + 동작 + 원칙).

```markdown
---
description: 세션 지식 영속 저장 — AI가 저장 위치 자동 판단
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

세션 대화에서 나온 지식을 영속 저장소에 저장한다.

## 저장 위치 판단 기준

| 내용 성격 | 저장 위치 | 예시 |
|----------|----------|------|
| 프로젝트 설계/분석/결정 | `.ai/notes/{topic}.md` | API 구조 분석, 아키텍처 결정, 라이브러리 비교 |
| 재사용 코드 패턴 | `.ai/patterns/{pattern-name}.md` | 커스텀 훅 패턴, 에러 처리 패턴, 폴더 구조 |
| 개인 학습 (TIL, 개념, 트러블슈팅) | `~/obsidian-note/00_Inbox/{title}.md` | React 렌더링 이해, Git rebase 정리 |

## 동작

### 1. 정리 대상 파악
- 사용자가 명시하면 ("이 부분 정리해줘") 해당 내용 사용
- 인자 없이 `/note`만 호출하면 → "어떤 내용을 정리할까요?" 질문

### 2. 저장 위치 자동 판단 + 확인
- 내용 성격을 분석하여 위 기준표로 저장 위치 판단
- 재사용 코드 패턴이면 → ".ai/patterns/에 저장할까요?" 제안 (AI 제안 + 사용자 승인)
- 판단 결과를 사용자에게 보여주고 확인:
  ```
  📍 저장 위치: .ai/notes/api-design.md
  이대로 저장할까요?
  ```

### 3. 기존 문서 확인
- Glob으로 유사 파일명 검색
- 기존 문서 있으면 → 업데이트 (새 내용 병합)
- 없으면 → 새로 생성

### 4. 저장
- 내용을 정리하여 저장
- .ai/patterns/ 저장 시 → `.ai/patterns/README.md` 인덱스도 업데이트

## 포맷 가이드

### .ai/notes/ 포맷
```markdown
# {제목}

> 날짜: YYYY-MM-DD

## 요약
{한 줄 요약}

## 내용
{정리된 내용}

## 관련
- {관련 파일 경로 또는 참조}
```

### .ai/patterns/ 포맷
```markdown
# {패턴명}

> 날짜: YYYY-MM-DD

## 언제 사용
{이 패턴을 적용할 상황}

## 패턴
{코드 또는 구조}

## 예시
{실제 사용 예}
```

### ~/obsidian-note/ 포맷
- 기존 옵시디언 노트 스타일을 따름
- 00_Inbox에 저장하여 나중에 정리

## 원칙
- 간결하게 (핵심만)
- 코드 전체 복붙 금지 (핵심 부분만, 경로 참조)
- 저장 위치를 임의로 결정하지 말고 반드시 사용자에게 확인
- 기존 문서가 있으면 덮어쓰지 말고 병합

## 대화 출력
저장 완료 후:
```
/note 저장 완료 — {제목} → {저장 경로}
```
```

**Step 2: 커밋**

```bash
git add session-manager/commands/note.md
git commit -m "feat: /note 커맨드 추가 — 세션 지식 영속 저장"
```

---

### Task 5: note 스킬 작성

**Files:**
- Create: `session-manager/skills/note.md`

**Step 1: skills 디렉토리 확인**

Run: `ls session-manager/skills/ 2>/dev/null || echo "not found"`
Expected: `not found` (신규 디렉토리)

**Step 2: note.md 스킬 작성**

```markdown
---
description: "정리해줘", "남겨둬", "노트로 만들어줘" 등 자연어로 지식 저장 트리거
---

사용자가 세션 대화 중 정리/저장을 자연어로 요청할 때 트리거된다.

## 트리거 표현

- "정리해줘", "이거 정리해줘"
- "남겨둬", "이거 남겨둬"
- "노트로 만들어줘"
- "기록해줘"
- "패턴으로 저장해줘"

## 동작

`/note` 커맨드와 동일한 로직을 수행한다.

1. 정리 대상 파악
2. 저장 위치 자동 판단 + 사용자 확인
3. 기존 문서 확인 (있으면 업데이트)
4. 저장

상세 동작은 `/note` 커맨드 참조.
```

**Step 3: 커밋**

```bash
git add session-manager/skills/note.md
git commit -m "feat: note 스킬 추가 — 자연어 트리거로 /note 동작"
```

---

### Task 6: plugin.json 업데이트

**Files:**
- Modify: `session-manager/.claude-plugin/plugin.json`

**Step 1: 버전 및 설명 업데이트**

```json
{
  "name": "session-manager",
  "description": "AI 페어 프로그래밍 context 관리 — 세션 간 맥락 유지 + 지식 영속 저장",
  "version": "2.0.0"
}
```

**Step 2: 커밋**

```bash
git add session-manager/.claude-plugin/plugin.json
git commit -m "chore: session-manager v2.0.0 버전 범프"
```

---

### Task 7: README.md 업데이트

**Files:**
- Modify: `session-manager/README.md`

**Step 1: v2 컴포넌트 반영**

README에 추가할 내용:
- 커맨드 테이블에 `/note` 추가
- Hook 테이블에 `SessionEnd` 추가
- 스킬 테이블 신규 추가
- 워크플로우 다이어그램에 `/note` 흐름 추가
- 저장 체계 섹션 추가
- 파일 구조에 `skills/` 디렉토리, `session-end.mjs` 추가

**Step 2: 커밋**

```bash
git add session-manager/README.md
git commit -m "docs: README v2 업데이트 — /note, session-end Hook, 저장 체계"
```

---

### Task 8: CLAUDE.md 동기화

**Files:**
- Modify: `CLAUDE.md` (프로젝트 루트)

**Step 1: 세션 연속성 섹션에 /note 추가**

"세션 연속성" 섹션에 추가:
- `/note`로 세션 지식 영속 저장 가능
- 저장 위치 체계 안내 (`.ai/notes/`, `.ai/patterns/`, `~/obsidian-note/`)

**Step 2: 프로젝트 구조에 skills/ 반영**

session-manager 구조 설명에 `skills/note.md` 추가.

**Step 3: 커밋**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md에 /note, 저장 체계 동기화"
```

---

### Task 9: 수동 검증

**Step 1: 플러그인 구조 검증**

Run: `find session-manager -type f | sort`

Expected:
```
session-manager/.claude-plugin/plugin.json
session-manager/README.md
session-manager/commands/note.md
session-manager/commands/resume.md
session-manager/commands/save.md
session-manager/hooks/hooks.json
session-manager/scripts/session-end.mjs
session-manager/scripts/session-start.mjs
session-manager/skills/note.md
```

**Step 2: hooks.json 문법 검증**

Run: `node -e "JSON.parse(require('fs').readFileSync('session-manager/hooks/hooks.json', 'utf-8')); console.log('OK')"`
Expected: `OK`

**Step 3: session-end.mjs 문법 검증**

Run: `node --check session-manager/scripts/session-end.mjs`
Expected: 에러 없음

**Step 4: 실제 세션에서 테스트**

1. Claude Code 새 세션 시작 → session-start Hook 동작 확인
2. `/note` 호출 → 저장 위치 판단 + 저장 동작 확인
3. "정리해줘" 자연어 → note 스킬 트리거 확인
4. 세션 종료 → session-end Hook으로 타임스탬프 추가 확인
