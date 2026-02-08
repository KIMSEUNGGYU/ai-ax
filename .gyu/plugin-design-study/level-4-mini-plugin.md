# Level 4: 미니 플러그인 실습

`mini-review` 플러그인을 직접 만들며 4컴포넌트(Skill/Command/Agent/Hook) 감각 체득.

## 실습 대상

```
mini-review/
├── .claude-plugin/plugin.json       ← 매니페스트
├── skills/review-criteria/SKILL.md  ← Skill (What)
├── commands/review.md               ← Command (How)
├── agents/code-reviewer.md          ← Agent (실행자)
├── hooks/hooks.json                 ← Hook 이벤트 매핑
└── scripts/review-reminder.mjs      ← Hook 스크립트
```

---

## 1. plugin.json — 매니페스트

```json
{
  "name": "mini-review",
  "version": "0.1.0",
  "description": "Level 4 학습용 미니 코드 리뷰 플러그인"
}
```

### 역할

플러그인의 **신분증**. Claude Code가 이 파일을 보고 "여기 플러그인이 있구나"를 인식한다.

### 핵심 포인트

| 필드 | 역할 |
|------|------|
| `name` | 플러그인 식별자. Command 호출 시 `/mini-review:review`의 앞부분 |
| `version` | 버전 관리 |
| `description` | 플러그인 설명 (사용자/마켓플레이스용) |

### 위치 규칙

**전역 경로가 아니라 플러그인 루트 기준 상대 경로.**
플러그인 폴더 자체는 어디에 있든 상관없음.

```
mini-review/                    ← 플러그인 루트 (위치 자유)
└── .claude-plugin/
    └── plugin.json             ← 이 상대 경로만 고정

fe-toolkit/                     ← 다른 플러그인도 마찬가지
└── .claude-plugin/
    └── plugin.json
```

이 파일이 없으면 Claude Code는 그냥 일반 폴더로 취급한다.

### 나머지 컴포넌트는 자동 탐색

plugin.json에 skills, commands, agents 경로를 명시할 수도 있지만,
**기본 컨벤션대로 폴더명을 맞추면 자동 인식**된다:
- `skills/` → Skill 탐색
- `commands/` → Command 탐색
- `agents/` → Agent 탐색
- `hooks/` → Hook 탐색

---

## 2. Skill — review-criteria/SKILL.md

```yaml
---
name: review-criteria
description: 코드 리뷰 시 적용할 기준. 코드 리뷰, diff 분석, PR 검토 시 자동 적용
---
# 본문: 체크리스트 (변경 영향도, 타입 안전성, 가독성, 과한 추상화) + 심각도 등급
```

### 구조: frontmatter + 본문

| 부분 | 역할 |
|------|------|
| `name` | 스킬 식별자 (디렉토리명과 일치) |
| `description` | **자동 트리거 키워드** — "코드 리뷰", "diff 분석" 등이 입력에 있으면 자동 로드 |
| 본문 | Claude에게 주입되는 **지식** — What(뭘 봐야 하는지)만. How(절차)는 없음 |

### 파일 위치 규칙

```
skills/
└── review-criteria/       ← 디렉토리명 = 스킬 이름
    └── SKILL.md           ← 파일명 반드시 SKILL.md (고정)
```

### description = 자동 트리거

```
사용자: "이 PR 좀 봐줘"
→ Claude가 description의 "PR 검토" 매칭
→ Skill 자동 로드 → 체크리스트가 컨텍스트에 주입
```

description 범위가 좁을수록 정확한 상황에서만 로드.
너무 넓으면 불필요한 상황에서도 로드됨.

---

## 3. Command — commands/review.md

```yaml
---
description: 코드 리뷰 실행 — Agent에게 위임하는 워크플로우
argument-hint: [파일 경로 또는 PR URL]
---
# 본문: Phase 1(diff 수집) → Phase 2(Agent 위임) → Phase 3(결과 전달)
```

### frontmatter

| 필드 | 역할 |
|------|------|
| `description` | Command 설명. Skill과 달리 **자동 트리거 아님** — `/mini-review:review`로 직접 호출만 |
| `argument-hint` | 사용자에게 보여주는 힌트 ("뭘 넘겨야 하는지") |

### 본문 = 메인 Claude에게 주는 대본

1. **역할 선언** — "너는 오케스트레이터다, 직접 하지 마"
2. **Phase별 절차** — 순서대로 뭘 해야 하는지
3. **위임 지시** — Task 호출 방법을 구체적으로 명시
4. **원칙** — "Agent 결과를 수정하지 않음"

### `{{ARGUMENTS}}` 패턴

```
사용자: /mini-review:review src/login.tsx
→ {{ARGUMENTS}} = "src/login.tsx"
→ Command 본문에서 이 값을 참조
```

### Task 호출을 명시적으로 쓰는 이유

"서브 에이전트로 해"라고만 쓰면 Claude가 자유 해석 → 매번 다른 동작.
`Task(subagent_type = "plugin:mini-review:code-reviewer")` 명시하면 해석 여지 없음.

```
plugin:mini-review:code-reviewer
  │       │             │
  │       │             └── 어떤 에이전트
  │       └── 어떤 플러그인
  └── 플러그인 에이전트 (내장이 아님)
```

명시 안 하면 Claude가 내장 에이전트(Explore, Plan 등)를 대신 쓸 수 있음.

### Claude Code 내장 에이전트 (참고)

| subagent_type | 역할 |
|---|---|
| Explore | 코드베이스 탐색 (파일 찾기, 키워드 검색) |
| Plan | 설계/계획 (코드 수정 불가) |
| Bash | 터미널 커맨드 실행 전문 |
| general-purpose | 범용 멀티스텝 작업 |
| claude-code-guide | CC 사용법/설정 안내 |

플러그인 에이전트는 `plugin:플러그인명:에이전트명`으로 호출해서 내장과 구분.

---

## 4. Agent — agents/code-reviewer.md

```yaml
---
name: code-reviewer
description: 읽기 전용 코드 리뷰어. 코드를 분석하고 피드백만 제공.
model: sonnet
disallowedTools: Write, Edit, Bash, NotebookEdit
---
# 본문: 4단계 프로토콜 (변경 파악 → 기준 적용 → 피드백 작성 → 판정)
# 출력 형식: CRITICAL → HIGH → MEDIUM/LOW → APPROVE/REQUEST_CHANGES
```

### Agent만의 frontmatter 필드

| 필드 | 역할 | 이 Agent에서 |
|------|------|---|
| `name` | 에이전트 식별자 | `code-reviewer` |
| `description` | 설명 | 리뷰 전용 |
| `model` | 사용할 모델 | `sonnet` (비용 균형) |
| `disallowedTools` | 차단할 도구 | Write, Edit, Bash, NotebookEdit |

### disallowedTools = 물리적 역할 제한

```
쓸 수 있는 것:  Read, Grep, Glob, Task (읽기 + 탐색)
못 쓰는 것:     Write, Edit, Bash, NotebookEdit (수정 + 실행)
```

프롬프트 "수정하지 마" → 무시 가능 ❌
도구 자체 차단 → 물리적으로 불가능 ✅

### model 선택 기준

```
opus   — 고품질, 고비용. 아키텍처/설계 판단
sonnet — 균형. 코드 리뷰처럼 양 많은 작업
haiku  — 저비용. 단순 작업 (파일 나열, 패턴 검색)
```

### allowed-tools vs disallowedTools 차이

| | Command/Skill | Agent |
|---|---|---|
| 방식 | `allowed-tools` (화이트리스트) | `disallowedTools` (블랙리스트) |
| 의미 | "이것만 허용" | "이것만 차단" |
| 적용 대상 | 메인 Claude | 서브 에이전트 (독립 인스턴스) |

Claude Code가 컴포넌트별로 지원하는 방식이 다름.
선택 기준이 아니라 **각 컴포넌트의 스펙**.

### NotebookEdit 참고

Jupyter Notebook(.ipynb) 셀 편집 도구. FE 작업에서는 거의 안 씀.
코드 리뷰어가 노트북까지 수정하면 안 되니까 함께 차단.

---

## 5. Hook — hooks/hooks.json + scripts/review-reminder.mjs

두 파일이 한 세트. hooks.json이 이벤트 매핑, mjs가 실제 로직.

### hooks.json — 이벤트-스크립트 매핑

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/review-reminder.mjs\"",
        "timeout": 3
      }]
    }]
  }
}
```

| 필드 | 의미 |
|------|------|
| `PreToolUse` | 언제 — 도구 실행 직전마다 |
| `matcher: "*"` | 어떤 도구 — 모든 도구 (와일드카드) |
| `command` | 뭘 실행 — Node.js 스크립트 |
| `${CLAUDE_PLUGIN_ROOT}` | 플러그인 루트 경로 자동 치환 |
| `timeout: 3` | 3초 안에 완료되어야 함 |

### `CLAUDE_PLUGIN_ROOT`는 뭘 가리키나?

**전역/프로젝트/로컬이 아닌, 그 플러그인 폴더 자체.**

```
mini-review/                    ← 이 플러그인에서 CLAUDE_PLUGIN_ROOT = 여기
├── .claude-plugin/plugin.json
└── scripts/review-reminder.mjs

fe-toolkit/                     ← 이 플러그인에서 CLAUDE_PLUGIN_ROOT = 여기
└── scripts/...
```

plugin.json 위치 기준으로 Claude Code가 자동 설정. 플러그인마다 다른 값.

### review-reminder.mjs — 실제 로직

```javascript
// 1. stdin으로 이벤트 데이터 수신
const input = await readStdin();  // { toolName: "Read", toolInput: {...} }

// 2. 도구별 맞춤 리마인더
const reminders = {
  Read: '변경 영향도를 함께 파악하라.',
  Task: 'Agent에게 충분한 컨텍스트를 전달하라.',
  Grep: '변경된 함수가 다른 곳에서 사용되는지 확인하라.',
};

// 3. stdout으로 약속된 JSON 형식 반환
{ "continue": true, "hookSpecificOutput": { "additionalContext": "메시지" } }
```

### stdout JSON 형식이 중요한 이유

일반 `console.log("메시지")` → 무시됨 ❌
약속된 JSON 형식 → Claude Code가 파싱 → `additionalContext`를 Claude 컨텍스트에 주입 ✅

```
continue: true   → 도구 실행 허용 (false면 차단)
additionalContext → Claude의 바로 다음 컨텍스트에 삽입 (프롬프트처럼 동작)
```

### 도구 이름(toolName) 목록

stdin의 `toolName`은 Claude Code 내장 도구 중 하나:

| 도구명 | 역할 |
|--------|------|
| Read | 파일 읽기 |
| Write | 파일 생성 |
| Edit | 파일 수정 |
| Bash | 터미널 명령 실행 |
| Glob | 파일 패턴 검색 |
| Grep | 파일 내용 검색 |
| Task | 서브 에이전트 생성 |
| WebFetch | URL 내용 가져오기 |
| WebSearch | 웹 검색 |
| NotebookEdit | Jupyter 노트북 편집 |

### 전체 흐름

```
Claude가 Read를 쓰려 함
  → PreToolUse 이벤트
  → hooks.json → review-reminder.mjs 실행
  → stdin: { toolName: "Read", ... }
  → 스크립트: reminders["Read"] 매칭
  → stdout: { continue: true, additionalContext: "변경 영향도를 함께 파악하라." }
  → Claude 컨텍스트에 주입
  → Read 실행
```

매칭되지 않는 도구에는 `{ continue: true }`만 반환 (리마인더 없음).

---

## 요약: 4컴포넌트 동작 흐름

```
사용자: "/mini-review:review src/login.tsx"
  │
  ▼
[Skill] review-criteria 자동 로드 → 리뷰 기준이 컨텍스트에 주입
  │
  ▼
[Command] review.md 로드 → 3단계 워크플로우 대본
  │
  ├─ Phase 1: 메인 Claude가 직접 diff 수집
  │
  ├─ Phase 2: Task(plugin:mini-review:code-reviewer) 호출
  │     │
  │     ├─ [Hook] PreToolUse → "Agent에게 충분한 컨텍스트를 전달하라"
  │     │
  │     └─ [Agent] code-reviewer 독립 인스턴스 생성
  │           ├ model: sonnet
  │           ├ disallowedTools: Write, Edit, Bash, NotebookEdit
  │           └ 리뷰 수행 → 결과 반환
  │
  └─ Phase 3: 결과 사용자에게 전달
```

## 핵심 배운 것

| 컴포넌트 | 핵심 한 줄 |
|----------|-----------|
| plugin.json | `.claude-plugin/plugin.json` 있어야 플러그인 인식. name이 호출 접두사 |
| Skill | description이 자동 트리거. 본문은 What(기준)만 |
| Command | `/명령`으로 직접 호출. 본문은 How(절차). `{{ARGUMENTS}}`로 입력 참조 |
| Agent | `disallowedTools`로 물리적 역할 제한. `model`로 비용/품질 조절 |
| Hook | stdin JSON → 스크립트 → stdout JSON. `additionalContext`로 매번 리마인더 주입 |

---

> 다음: 개편 방향 설계 또는 Level 5 진행
