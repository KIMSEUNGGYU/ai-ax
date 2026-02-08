# Level 2: 플러그인 컴포넌트 상세

각 컴포넌트를 **개념 → OMC 실제 코드 → 핵심 패턴** 순으로 분석.

---

## 전체 구조 한눈에 보기

### 플러그인 컴포넌트 구조

```
┌─────────────────────────────────────────────────────┐
│                    플러그인 (plugin.json)             │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────┐ │
│  │  Skill   │  │ Command  │  │ Agent  │  │  Hook  │ │
│  │ (지식)   │  │ (절차)   │  │ (실행) │  │ (감시) │ │
│  │          │  │          │  │        │  │        │ │
│  │ 기준     │  │ 워크플로우│  │ 전문가 │  │ 리마인더│ │
│  │ 원칙     │  │ Phase별  │  │ 역할별 │  │ 키워드 │ │
│  │ 체크리스트│  │ 위임 지시│  │ 모델별 │  │ 차단   │ │
│  └──────────┘  └──────────┘  └────────┘  └────────┘ │
│   SKILL.md      name.md      name.md    hooks.json  │
│                                          scripts/    │
└─────────────────────────────────────────────────────┘
```

### 4개 컴포넌트 비교표

```
          │ 트리거         │ 내용           │ 비유     │ 파일
──────────┼────────────────┼────────────────┼──────────┼──────────
 Skill    │ 자동 + /호출   │ What (기준)    │ 참고서   │ SKILL.md
 Command  │ /호출만        │ How (절차)     │ 레시피   │ name.md
 Agent    │ Task()로 위임  │ 전문 시스템 프롬프트│ 직원 │ name.md
 Hook     │ 이벤트 자동    │ 주입/차단 로직 │ 알람     │ hooks.json
```

### 워크플로우 3가지 시나리오

```
시나리오 A: Skill만 (자연어, Hook 없음)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  "리뷰해줘" ──→ Skill 자동 로드 ──→ Claude 자유 실행
                  (기준만 있음)         (절차 없음)
                                        → 품질 불안정 ⚠️

시나리오 B: Command 직접 호출
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  "/code-review" ──→ Command 로드 ──→ 정해진 워크플로우 실행
                     + Skill 자동 로드   (기준 + 절차)
                                        → 품질 일정 ✅

시나리오 C: Hook이 자연어 → Command 연결 (OMC 방식)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  "리뷰해줘" ──→ Hook 감지 ──→ Command 로드 ──→ 정해진 워크플로우
                (keyword-      + Skill 자동 로드   (기준 + 절차)
                 detector)                         → 품질 일정 ✅
```

### 전체 동작 흐름도

```
사용자 입력
    │
    ▼
┌─────────────────────────┐
│ Hook: UserPromptSubmit   │ ← 키워드 감지 → Command 연결
│ (keyword-detector)       │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │ Command + Skill │ ← 절차(Command) + 기준(Skill) 로드
    │ 컨텍스트에 주입  │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │  메인 Claude    │ ← 지휘자 역할
    │  (오케스트레이터)│
    └────────┬───────┘
             │ Task() 호출
             ▼
┌─────────────────────────┐
│ Hook: PreToolUse         │ ← "병렬로 해", "검증해" 리마인더 주입
│ (pre-tool-enforcer)      │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐     ┌────────────────┐
    │ Agent A        │     │ Agent B        │  ← 병렬 실행 가능
    │ (architect)    │     │ (executor)     │
    │ model: opus    │     │ model: sonnet  │
    │ ✗ Write, Edit  │     │ ✗ Task         │
    └────────┬───────┘     └────────┬───────┘
             │                      │
             ▼                      ▼
┌─────────────────────────┐
│ Hook: PostToolUse        │ ← 결과 검증
│ (post-tool-verifier)     │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────┐
    │  메인 Claude    │ ← 결과 종합, 다음 단계 판단
    │  다음 Phase?    │
    └────────┬───────┘
             │
             ▼
┌─────────────────────────┐
│ Hook: Stop               │ ← "아직 할 일 남았으면 계속해"
│ (persistent-mode)        │
└─────────────────────────┘
```

### Agent 역할 제한 구조

```
┌─────────────────────────────────────────┐
│             역할 기반 도구 제한            │
│                                          │
│  architect    ──→  ✗ Write, Edit         │
│  (분석 전용)        읽기만 가능            │
│                                          │
│  executor     ──→  ✗ Task                │
│  (구현 전용)        위임 불가, 직접 구현    │
│                                          │
│  verifier     ──→  ✗ Write, Edit         │
│  (검증 전용)        수정 불가, 검증만       │
│                                          │
│  executor-low ──→  model: haiku (저비용)  │
│  executor     ──→  model: sonnet (균형)   │
│  executor-high──→  model: opus (고품질)   │
└─────────────────────────────────────────┘
```

---

## 상세 분석

아래부터 각 컴포넌트를 개념 → OMC 실제 코드 → 핵심 패턴 순으로 분석.

---

## 1. Skill — 자동 적용되는 지식

### 개념

- Claude가 **관련 작업을 감지하면 자동으로 로드**하는 지식/원칙
- 사용자가 호출할 필요 없음. `description`이 매칭 키워드 역할
- 파일 하나(SKILL.md) = 메타데이터 + 프롬프트

### 파일 구조

```
skills/
  code-review/
    SKILL.md        ← 디렉토리명 = 스킬 이름
```

### OMC 실제 코드: `skills/code-review/SKILL.md`

```yaml
---
name: code-review
description: Run a comprehensive code review
---
```

```markdown
# Code Review Skill

Conduct a thorough code review for quality, security, and maintainability.

## When to Use
- User requests "review this code", "code review"
- Before merging a pull request

## What It Does
Delegates to the `code-reviewer` agent (Opus model) for deep analysis:

1. Identify Changes — git diff로 변경 파일 파악
2. Review Categories — Security, Code Quality, Performance, Best Practices
3. Severity Rating — CRITICAL / HIGH / MEDIUM / LOW
4. Specific Recommendations — 파일:라인 위치 + 수정 제안
```

### 핵심 패턴

| 패턴 | 설명 |
|------|------|
| **description이 트리거** | "code review"라고 말하면 이 스킬이 자동 로드됨 |
| **에이전트 위임 지시** | 스킬 본문에서 "code-reviewer 에이전트에 위임하라" 지시 |
| **체크리스트 제공** | Claude가 빠뜨리지 않도록 구체적 항목 나열 |
| **출력 형식 지정** | 결과를 어떤 포맷으로 보여줄지 명시 |

### Skill vs Command 차이 (중요)

```
Skill:   사용자가 "코드 리뷰해줘" → Claude가 자동 감지 → 스킬 로드
Command: 사용자가 "/review" 입력 → 직접 트리거 → 커맨드 실행
```

같은 기능이라도 **트리거 방식이 다름**. OMC는 둘 다 만들어서:
- 자연어로 말하면 → Skill이 감지
- 명시적으로 호출하면 → Command가 실행

참고: Skill도 `/스킬명`으로 직접 호출 가능. 차이는 **자동 트리거 지원 여부**.

### Skill과 Command의 프롬프트 내용은 다르다

같은 기능(예: code-review)이라도 **담는 내용이 다름:**

**Skill = What (뭘 기준으로):**
```markdown
## Review Categories
- Security — XSS, SQL injection, 하드코딩된 시크릿
- Code Quality — 함수 크기, 복잡도, 네스팅
## Severity Rating
- CRITICAL / HIGH / MEDIUM / LOW
```
→ 지식, 원칙, 체크리스트 제공

**Command = How (어떻게 실행):**
```markdown
1. git diff로 변경 파일 파악
2. code-reviewer 에이전트에 위임
3. 결과를 REPORT 형식으로 출력
4. APPROVED / REVISE / REJECT 판정
```
→ 실행 절차, 워크플로우 제공

| | Skill | Command |
|---|---|---|
| **역할** | 참고서 | 레시피 |
| **내용** | 기준/원칙 | 실행 절차 |
| **비유** | "보안 항목은 이 6가지를 봐" | "1단계: diff 확인, 2단계: 에이전트 위임..." |

### 실제 워크플로우: Skill만 vs Command + Skill

**시나리오 A: 자연어 → Skill만 동작**

```
사용자: "이 코드 리뷰해줘"

1. Claude가 "코드 리뷰" 키워드 감지
2. Skill(code-review) 자동 로드
   → 체크리스트/기준이 컨텍스트에 주입됨
3. 메인 Claude가 알아서 리뷰 수행
   → 구조화된 절차 없음, Claude 판단에 의존
```

결과: 리뷰는 하지만, **어떤 순서로 할지는 Claude 마음**. 품질이 들쑥날쑥.

**시나리오 B: `/command` → Command + Skill 둘 다 동작**

```
사용자: "/oh-my-claudecode:code-review"

1. Command(code-review.md) 로드
   → "이 절차대로 실행해" 워크플로우 주입
2. Skill(code-review)도 자동 로드 (컨텍스트가 "code review"이니까)
   → 체크리스트/기준이 추가로 주입됨
3. 메인 Claude가 Command의 절차를 따름:
   Step 1: git diff로 변경 파일 파악
   Step 2: Task(code-reviewer 에이전트) 위임
   Step 3: 결과를 REPORT 형식으로 출력
   Step 4: APPROVED / REVISE / REJECT 판정
```

결과: 매번 **동일한 절차**로 실행. Skill의 기준 + Command의 절차가 합쳐져서 품질 일정.

**시나리오 C: 자연어 + keyword-detector Hook → Command 워크플로우 실행 (OMC 방식)**

```
사용자: "리뷰해줘"

1. [Hook: UserPromptSubmit] → keyword-detector.mjs 실행
2. "review" 키워드 감지
3. Claude에게 "code-review 커맨드를 사용해" 메시지 주입
4. Command(code-review) 워크플로우 실행 (시나리오 B와 동일)
```

결과: 자연어로 말해도 **Command 워크플로우가 동작**. Hook이 자연어 → Command 연결 다리 역할.

**흐름 비교:**

```
시나리오 A (Skill만):
  "리뷰해줘" → [Skill 지식 로드] → Claude 자유 실행 → 품질 불안정

시나리오 B (Command 직접):
  "/code-review" → [Command 절차 + Skill 지식] → 정해진 워크플로우 → 품질 일정

시나리오 C (Hook 연결, OMC):
  "리뷰해줘" → [Hook이 감지] → [Command 절차 + Skill 지식] → 품질 일정
```

**OMC가 둘 다 만든 이유:** Skill만으로는 실행 품질이 불안정하고, Command만으로는 기준이 부족.
둘을 조합하고, Hook으로 자연어 진입점까지 연결해서 완성.

---

## 2. Command — 사용자가 호출하는 워크플로우

### 개념

- 사용자가 `/플러그인명:커맨드명`으로 **직접 호출**
- 실행 절차(워크플로우)를 순서대로 정의
- `{{ARGUMENTS}}`로 사용자 입력을 받음

### 파일 구조

```
commands/
  autopilot.md
  plan.md
  swarm.md
```

### OMC 실제 코드: `commands/autopilot.md`

```yaml
---
description: Fully autonomous workflow from idea to working code
---
```

**5단계 프로세스:**

```
Phase 1. Expansion  — 아이디어를 상세 스펙으로 확장
Phase 2. Planning   — 구현 전략 개발
Phase 3. Execution  — 병렬 에이전트로 코드 빌드
Phase 4. QA         — 종합 테스트 및 검증
Phase 5. Validation — 다중 아키텍트 리뷰
```

**핵심 원칙 (본문에 명시):**

```
"YOU ARE AN ORCHESTRATOR, NOT AN IMPLEMENTER"
- 오케스트레이터는 파일 읽기, 진행 추적, 상태 전달만
- 모든 코드 변경은 전문 실행 에이전트로 위임
```

**에이전트 티어 (비용 최적화):**

```
executor-low  (Haiku)  — 단순 단일 파일 작업
executor      (Sonnet) — 표준 기능
executor-high (Opus)   — 복잡한 다중 파일 작업
```

### OMC 실제 코드: `commands/swarm.md`

```yaml
---
description: N coordinated agents on shared task list with SQLite-based atomic claiming
aliases: [swarm-agents]
---
```

**사용법:**

```bash
/oh-my-claudecode:swarm 3:executor "린트 에러 전부 수정"
/oh-my-claudecode:swarm aggressive:executor "대규모 리팩토링"
```

**핵심 메커니즘:**
- SQLite DB로 작업 목록 관리 (tasks, heartbeats, swarm_session 테이블)
- 각 에이전트가 `claimTask()` → `completeTask()` 사이클
- 원자적 트랜잭션으로 동일 작업 중복 방지
- 하트비트로 죽은 에이전트 감지 → 작업 재할당

### 핵심 패턴

| 패턴 | 설명 |
|------|------|
| **워크플로우 = Phase 나열** | Command 본문에 단계별 절차를 순서대로 작성 |
| **역할 선언** | "너는 오케스트레이터다, 직접 구현하지 마" |
| **에이전트 위임 지시** | "이 Phase에서는 executor 에이전트를 써라" |
| **aliases** | `/swarm` 대신 `/swarm-agents`로도 호출 가능 |
| **{{ARGUMENTS}}** | 사용자 입력을 본문에서 참조 |

### Command가 하는 일 정리

```
Command = "메인 Claude에게 주는 대본"

1. 역할 부여: "너는 오케스트레이터다"
2. 절차 안내: "Phase 1부터 순서대로 해"
3. 위임 지시: "구현은 executor에게 Task로 넘겨"
4. 완료 조건: "빌드 성공하면 끝"
```

---

## 3. Agent — 위임받는 전문가

### 개념

- Command/Skill에서 `Task(subagent_type="plugin:에이전트명")`으로 호출
- 독립된 Claude 인스턴스에 **전문 시스템 프롬프트** 적용
- `disallowedTools`로 역할 경계 강제

### 파일 구조

```
agents/
  architect.md
  executor.md
```

### OMC 실제 코드: `agents/architect.md`

```yaml
---
name: architect
description: Strategic Architecture Advisor (READ-ONLY)
model: opus
disallowedTools: Write, Edit
---
```

```markdown
# Architect Agent

읽기 전용 컨설턴트. 코드 분석, 진단, 권장사항 제공.

## 4단계 프로토콜
1. 컨텍스트 수집 — 코드베이스 탐색
2. 심층 분석 — 패턴, 의존성, 문제점 파악
3. 권장사항 — 구체적 개선안 제시
4. 검증 — 권장사항의 실현 가능성 확인
```

**주목할 점:**
- `model: opus` → 가장 똑똑한 모델 사용 (설계는 정확도가 중요)
- `disallowedTools: Write, Edit` → **코드 수정 불가**. 분석만 가능
- 이렇게 하면 실수로 코드를 바꾸는 일이 원천 차단됨

### OMC 실제 코드: `agents/executor.md`

```yaml
---
name: executor
description: Focused implementation task executor
model: sonnet
disallowedTools: Task
---
```

```markdown
# Executor Agent

직접 실행. 위임 없음.

## 원칙
- Todo 중심 워크플로우
- 완료 전 검증 필수 (빌드/테스트)
```

**주목할 점:**
- `model: sonnet` → 비용 효율적 모델 (구현은 양이 많으니)
- `disallowedTools: Task` → **다른 에이전트에게 위임 불가**. 직접 해야 함
- 위임 체인이 끝없이 이어지는 것 방지

### 핵심 패턴: 역할 기반 도구 제한

```
architect:  Write, Edit 차단    → 분석만 가능 (읽기 전용)
executor:   Task 차단           → 직접 구현만 (위임 불가)
verifier:   Write, Edit 차단    → 검증만 가능 (수정 불가)
```

**이유:** 각 에이전트가 자기 역할만 하도록 **선언적으로 강제**. 프롬프트에 "하지 마"라고 쓰는 것보다 도구 자체를 막는 게 확실함.

### 에이전트 티어 패턴 (모델 선택)

```
haiku  — 단순 작업 (파일 나열, 패턴 카운팅) → 저비용
sonnet — 표준 작업 (코드 구현, 분석)        → 균형
opus   — 복잡한 작업 (아키텍처, 판단)       → 고비용, 고품질
```

작업 복잡도에 따라 모델을 다르게 지정해서 비용 최적화.

---

## 4. Hook — 이벤트 기반 자동 실행

### 개념

- 특정 이벤트 발생 시 **외부 스크립트를 자동 실행**
- Claude가 아닌 **Node.js 스크립트**가 실행됨
- stdin으로 이벤트 데이터 받고 → stdout으로 결과 반환

### 파일 구조

```
hooks/
  hooks.json          ← 이벤트-스크립트 매핑
scripts/
  keyword-detector.mjs
  pre-tool-enforcer.mjs
  post-tool-verifier.mjs
  ...
```

### OMC 실제 코드: `hooks/hooks.json`

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/keyword-detector.mjs\"",
        "timeout": 5
      }]
    }],
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/pre-tool-enforcer.mjs\"",
        "timeout": 3
      }]
    }],
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/persistent-mode.cjs\"",
        "timeout": 5
      }]
    }]
  }
}
```

### 이벤트 종류

| 이벤트 | 발생 시점 | OMC 활용 |
|--------|----------|----------|
| **UserPromptSubmit** | 사용자가 메시지 보낼 때 | 키워드 감지, 스킬 자동 주입 |
| **SessionStart** | 세션 시작 시 | 초기화, 메모리 로드 |
| **PreToolUse** | 도구 실행 직전 | 도구별 리마인더 주입 |
| **PostToolUse** | 도구 실행 직후 | 결과 검증 |
| **SubagentStart/Stop** | 서브 에이전트 시작/종료 | 에이전트 추적 |
| **PreCompact** | 컨텍스트 압축 직전 | 중요 정보 저장 |
| **Stop** | Claude 응답 완료 시 | 끈기 모드 (멈추지 않게) |
| **SessionEnd** | 세션 종료 시 | 정리, 상태 저장 |

### OMC 실제 코드: `scripts/pre-tool-enforcer.mjs` (핵심 발췌)

```javascript
// stdin으로 이벤트 데이터 수신
const input = await readStdin();
const toolName = extractJsonField(input, 'toolName');

// 도구별 리마인더 메시지 생성
const messages = {
  Task: "병렬 실행 가능한 작업은 동시에 실행하라",
  Bash: "독립적 작업은 병렬로. 긴 작업은 백그라운드로",
  Edit: "수정 후 반드시 동작 검증하라",
  Read: "여러 파일을 읽을 때는 병렬로 읽어라",
};

// stdout으로 결과 반환
console.log(JSON.stringify({
  continue: true,                    // 도구 실행 계속 진행
  hookSpecificOutput: {
    additionalContext: messages[toolName]  // Claude에게 주입할 메시지
  }
}));
```

### Hook의 입출력 구조

```
[이벤트 발생]
     ↓
stdin → { toolName: "Task", toolInput: {...}, directory: "/path" }
     ↓
[Node.js 스크립트 실행]
     ↓
stdout → { continue: true/false, hookSpecificOutput: { additionalContext: "..." } }
     ↓
continue=true → 진행  /  continue=false → 차단
additionalContext → Claude의 컨텍스트에 메시지 주입
```

### 핵심 패턴

| 패턴 | 설명 |
|------|------|
| **매번 리마인더 주입** | PreToolUse에서 "병렬로 해라", "검증해라" 반복 주입 |
| **continue: false로 차단** | 위험한 작업 감지 시 실행 자체를 막을 수 있음 |
| **상태 추적** | SubagentStart/Stop으로 에이전트 수 추적 |
| **끈기 모드** | Stop 이벤트에서 "아직 안 끝났으면 계속해" 주입 |
| **자연어 → Command 연결** | keyword-detector가 자연어를 감지해서 Command 워크플로우 트리거 |

### Hook = Claude 행동을 상황별로 실시간 교정하는 장치

프롬프트에 "병렬로 실행해"라고 적어놔도, 대화가 길어지면 Claude는 잊는다.
컨텍스트 윈도우 앞쪽에 있던 지시가 뒤로 밀려나기 때문.

```
프롬프트에 한 번 적기:     "병렬로 해" → 대화 길어지면 잊음 ❌
Hook으로 매번 주입:        도구 쓸 때마다 "병렬로 해" → 절대 안 잊음 ✅
```

| 이벤트 | 주입 내용 | 효과 |
|--------|----------|------|
| **PreToolUse** | 도구별 맞춤 리마인더 | 매 동작마다 원칙 강제 |
| **Stop** | "아직 할 일 남았으면 계속해" | Claude가 중간에 멈추는 것 방지 |
| **UserPromptSubmit** | 키워드 감지 → Command 연결 | 자연어로도 전체 워크플로우 동작 |
| **PostToolUse** | 결과 검증 리마인더 | 실행 후 확인 강제 |

---

## 컴포넌트 간 연결 관계

```
사용자 입력
  ↓
[Hook: UserPromptSubmit] — 키워드 감지
  ↓
[Command] 또는 [Skill] 로드
  ↓
메인 Claude가 지침 읽음
  ↓
Task(subagent_type="plugin:agent") 호출
  ↓                              ↑
[Hook: PreToolUse]         [Hook: PostToolUse]
  ↓                              ↑
[Agent] 독립 실행 ──────→ 결과 반환
  ↓
[Hook: SubagentStop] — 추적
  ↓
메인 Claude가 다음 단계 판단
```

**데이터 흐름:**
1. Hook이 **감시/주입** 역할 (Claude 동작에 개입)
2. Command/Skill이 **지침** 제공 (무엇을 할지)
3. Agent가 **실행** (실제 작업 수행)
4. 메인 Claude가 **종합** (결과 판단)

---

## 요약

### 컴포넌트별 한 줄 정리

| 컴포넌트 | 한 줄 정리 |
|----------|-----------|
| **Skill** | `description`이 트리거. 체크리스트/원칙을 자동 주입 |
| **Command** | 메인 Claude에게 주는 대본. Phase별 절차 + 에이전트 위임 지시 |
| **Agent** | `disallowedTools`로 역할 강제. 모델 티어로 비용 최적화 |
| **Hook** | stdin/stdout JSON으로 Claude 동작에 개입. 리마인더 주입/차단 |

### OMC에서 배울 핵심 패턴 3가지

1. **executor의 `disallowedTools: Task`** — 위임 체인 무한루프 방지. 실행자는 직접 해야 함
2. **pre-tool-enforcer (Hook)** — 매 도구 실행마다 "병렬로 해라" 리마인더 주입. Claude가 잊지 않게 반복
3. **Stop 훅의 persistent-mode** — Claude가 멈추려 하면 "아직 안 끝났으면 계속해" 강제

---

## 이해 체크

- [ ] Skill의 description이 자동 트리거 역할을 한다는 것을 안다
- [ ] Command는 "메인 Claude에게 주는 대본"임을 안다
- [ ] Agent의 disallowedTools가 역할 경계를 강제하는 이유를 안다
- [ ] Hook의 입출력 구조 (stdin JSON → stdout JSON)를 안다
- [ ] 4개 컴포넌트가 어떻게 연결되는지 흐름을 그릴 수 있다

---

> 다음: [Level 3 — OMC 코드 심층 분석](./level-3-omc-analysis.md)
