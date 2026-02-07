# Level 3: OMC 코드 심층 분석

Level 2에서 각 컴포넌트의 역할을 배웠다면, Level 3에서는 **실제로 어떻게 동작하는지** 코드를 읽으며 분석.

---

## 전체 구조 한눈에 보기

```
OMC가 동작하는 3가지 핵심 메커니즘:

1. 키워드 라우팅  — 자연어를 감지해서 올바른 워크플로우로 연결
2. 오케스트레이션 — Command가 메인 Claude에게 "대본"을 주고 에이전트 위임
3. 상태 관리     — .omc/state/ 에 모드 상태를 저장해서 세션 간 유지
```

---

## 1. 키워드 라우팅: keyword-detector.mjs

### 이게 뭘 하는가?

사용자가 메시지를 보낼 때마다(UserPromptSubmit) 실행되어, 자연어에서 키워드를 감지하고 해당 Skill/Command를 트리거.

### 전체 흐름

```
사용자: "autopilot으로 로그인 페이지 만들어"
              │
              ▼
┌─────────────────────────────┐
│  1. stdin으로 입력 수신       │
│  2. JSON 파싱 → prompt 추출  │
│  3. 코드블록/URL/경로 제거    │  ← sanitize (오탐 방지)
│  4. 키워드 매칭              │
│  5. 충돌 해소                │
│  6. 상태 파일 생성            │
│  7. 스킬 호출 메시지 생성     │
│  8. stdout으로 출력           │
└─────────────────────────────┘
              │
              ▼
Claude에게 주입: "Skill: oh-my-claudecode:autopilot 을 호출해"
```

### 핵심 코드 분석

**① 오탐 방지 (sanitize)**

```javascript
function sanitizeForKeywordDetection(text) {
  return text
    .replace(/<(\w[\w-]*)[\s>][\s\S]*?<\/\1>/g, '')  // XML 태그 제거
    .replace(/https?:\/\/[^\s)>\]]+/g, '')             // URL 제거
    .replace(/```[\s\S]*?```/g, '')                    // 코드블록 제거
    .replace(/`[^`]+`/g, '');                          // 인라인 코드 제거
}
```

**왜 필요?** 사용자가 코드 안에 "autopilot"이란 단어를 쓰면 오탐이 발생하니까.
코드블록, URL, XML 태그 안의 키워드는 무시한다.

**② 키워드 매칭 (우선순위)**

```javascript
// 15개 키워드를 우선순위 순으로 매칭
// 1순위: cancel (모든 모드 중지)
if (/\b(cancelomc|stopomc)\b/i.test(cleanPrompt))

// 2순위: ralph (끈기 모드)
if (/\b(ralph|don't stop|must complete|until done)\b/i.test(cleanPrompt))

// 3순위: autopilot (자율 실행) — 다양한 자연어 패턴 지원
if (/\b(autopilot|autonomous|full auto)\b/i.test(cleanPrompt) ||
    /\bbuild\s+me\s+/i.test(cleanPrompt) ||     // "build me a..."
    /\bcreate\s+me\s+/i.test(cleanPrompt) ||     // "create me a..."
    /\bi\s+want\s+a\s+/i.test(cleanPrompt))      // "I want a..."
```

**주목:** "build me a login page"처럼 자연어로 말해도 autopilot이 트리거됨.
정확한 키워드뿐 아니라 **의도를 표현하는 패턴**도 매칭.

**③ 충돌 해소**

```javascript
function resolveConflicts(matches) {
  // cancel은 모든 것에 우선
  if (names.includes('cancel')) return [cancel만];

  // ultrapilot이 autopilot보다 우선 (상위 호환)
  if (names.includes('ultrapilot') && names.includes('autopilot'))
    resolved = resolved.filter(m => m.name !== 'autopilot');

  // ecomode가 ultrawork보다 우선 (비용 절약 우선)
  if (names.includes('ecomode') && names.includes('ultrawork'))
    resolved = resolved.filter(m => m.name !== 'ultrawork');
}
```

**왜 필요?** "ultrapilot autopilot으로 해줘"처럼 여러 키워드가 동시에 감지될 수 있음.
상위 호환 모드가 하위를 흡수.

**④ 스킬 호출 메시지 생성**

```javascript
function createSkillInvocation(skillName, originalPrompt) {
  return `[MAGIC KEYWORD: ${skillName.toUpperCase()}]

You MUST invoke the skill using the Skill tool:
Skill: oh-my-claudecode:${skillName}

User request:
${originalPrompt}

IMPORTANT: Invoke the skill IMMEDIATELY.`;
}
```

**이게 핵심.** Hook이 Claude에게 **"이 스킬을 반드시 호출해"**라고 강제 주입.
Claude는 이 메시지를 받고 Skill 도구를 호출 → Skill이 로드 → Command 워크플로우 실행.

### 배울 점

| 패턴 | 설명 | fe-workflow 적용 가능? |
|------|------|----------------------|
| **오탐 방지 sanitize** | 코드블록/URL 안의 키워드 무시 | 키워드 감지 쓸 때 필수 |
| **자연어 패턴 매칭** | "build me a..." 같은 의도 패턴 | 우리는 한국어 패턴 필요 |
| **충돌 해소 로직** | 상위 호환 모드가 하위 흡수 | 모드 여러 개면 필요 |
| **강제 스킬 호출** | "MUST invoke" 강한 어조 | 핵심 패턴, 반드시 적용 |

---

## 2. Autopilot 오케스트레이션: 대본의 구조

### Command가 Claude에게 주는 핵심 지시

autopilot.md의 본문은 크게 4가지를 정의:

```
┌─────────────────────────────────────────┐
│            autopilot.md 구조             │
│                                          │
│  ① 역할 선언                             │
│     "YOU ARE AN ORCHESTRATOR,            │
│      NOT AN IMPLEMENTER"                 │
│                                          │
│  ② 5단계 워크플로우                       │
│     Phase 1~5 순서와 각 단계 상세          │
│                                          │
│  ③ 에이전트 선택 기준                      │
│     작업 복잡도 → 에이전트 티어 매핑        │
│                                          │
│  ④ 완료 조건                              │
│     빌드 성공 + 아키텍트 리뷰 통과          │
└─────────────────────────────────────────┘
```

### 5단계 워크플로우 상세

```
Phase 1. Expansion (확장)
━━━━━━━━━━━━━━━━━━━━
  입력: 사용자의 아이디어 (한 줄)
  출력: 상세 스펙 문서
  방법: 메인 Claude가 직접 수행 (에이전트 위임 없음)
  이유: 사용자 의도를 정확히 파악해야 하므로 대화 컨텍스트 필요


Phase 2. Planning (계획)
━━━━━━━━━━━━━━━━━━━━
  입력: Phase 1의 상세 스펙
  출력: 구현 계획 (파일 목록, 의존성, 순서)
  방법: Task(architect) 위임
  이유: 설계는 opus 모델이 더 정확


Phase 3. Execution (실행)
━━━━━━━━━━━━━━━━━━━━
  입력: Phase 2의 구현 계획
  출력: 실제 코드
  방법: Task(executor) 병렬 위임
  규칙: 독립적 파일은 동시에, 의존 파일은 순차로
  티어:
    ├ executor-low  (haiku)  — 설정 파일, 단순 유틸
    ├ executor      (sonnet) — 표준 컴포넌트, 훅
    └ executor-high (opus)   — 복잡한 비즈니스 로직


Phase 4. QA (품질 검증)
━━━━━━━━━━━━━━━━━━━━
  입력: Phase 3의 코드
  출력: 검증 결과 (PASS / FAIL)
  방법: 빌드 실행 + 린트 검사
  실패 시: Phase 3로 돌아가서 수정


Phase 5. Validation (아키텍트 리뷰)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  입력: Phase 4를 통과한 코드
  출력: 최종 승인 (APPROVED / REVISE)
  방법: Task(architect) × 3명 병렬 리뷰
  이유: 한 명이 놓칠 수 있으니 3명이 독립 리뷰
  실패 시: 피드백 → Phase 3 → Phase 4 → Phase 5 반복
```

### 에이전트 선택 기준

```
작업 복잡도 판단 → 에이전트 티어 선택

┌─────────────────────────────────────────────────┐
│  단일 파일 + 단순 변경                            │
│  예: .env 수정, import 추가                       │
│  → executor-low (haiku) — 저비용                  │
├─────────────────────────────────────────────────┤
│  단일~소수 파일 + 표준 구현                        │
│  예: 컴포넌트 생성, API 함수 작성                   │
│  → executor (sonnet) — 균형                       │
├─────────────────────────────────────────────────┤
│  다수 파일 + 복잡한 로직                           │
│  예: 인증 시스템, 상태 관리 리팩토링                 │
│  → executor-high (opus) — 고품질                  │
├─────────────────────────────────────────────────┤
│  UI/디자인 관련                                    │
│  → designer / designer-high                      │
├─────────────────────────────────────────────────┤
│  문서화                                           │
│  → writer                                        │
└─────────────────────────────────────────────────┘
```

### 오케스트레이터의 코드 수정 금지 규칙

```
메인 Claude가 직접 수정할 수 있는 파일 (예외):
  ✅ .omc/**          (상태 파일)
  ✅ .claude/**        (설정)
  ✅ CLAUDE.md         (프로젝트 문서)

나머지 모든 소스 코드:
  ❌ 직접 수정 금지 → executor 에이전트에 위임
```

**왜?** 오케스트레이터가 코드를 직접 쓰면:
1. 컨텍스트 윈도우가 코드로 가득 참
2. 전체 흐름 파악 능력이 떨어짐
3. 오케스트레이션에 집중 못함

---

## 3. pre-tool-enforcer: 매 동작마다 교정하는 감시자

### Level 2에서 배운 것 vs Level 3에서 파악할 것

```
Level 2: "도구 실행 직전마다 리마인더 주입" (개념)
Level 3: 구체적으로 어떻게? 상태 파일과 어떻게 연동? 모드별 분기는?
```

### 핵심 동작: 상태 인식형 리마인더

pre-tool-enforcer는 **단순 리마인더 주입기가 아니라**, 현재 활성 모드를 인식해서 메시지를 다르게 구성한다.

```
PreToolUse 이벤트 발생 (도구 실행 직전)
              │
              ▼
┌─────────────────────────────────────┐
│  1. stdin에서 이벤트 데이터 파싱       │
│     → toolName, toolInput 추출       │
│                                      │
│  2. 상태 파일 확인                    │
│     .omc/state/autopilot-state.json  │
│     .omc/state/ralph-state.json      │
│                                      │
│  3. 모드별 리마인더 분기               │
│     ├ autopilot 활성 → 오케스트레이션 리마인더 │
│     ├ ralph 활성     → 끈기 리마인더          │
│     └ 모드 없음      → 기본 리마인더          │
│                                      │
│  4. 도구별 맞춤 메시지 추가            │
│     Task → "병렬 가능하면 동시에"      │
│     Bash → "독립 작업은 병렬로"        │
│     Edit → "수정 후 검증 필수"         │
│                                      │
│  5. subagent-tracking.json 읽기       │
│     → "현재 활성 에이전트 N개" 정보 추가│
│                                      │
│  6. stdout으로 조합된 메시지 반환       │
└─────────────────────────────────────┘
```

### 왜 "상태 인식"이 중요한가?

```
상태 비인식 (단순 리마인더):
  Edit 사용할 때마다 → "수정 후 검증해"
  → 모드가 뭐든 같은 메시지. 오케스트레이션 모드인데 "직접 수정해"가 나올 수 있음 ❌

상태 인식 (OMC 방식):
  autopilot + Edit → "오케스트레이터는 직접 수정하면 안 됨. executor에 위임하라"
  일반 모드  + Edit → "수정 후 검증해"
  → 현재 모드에 맞는 적절한 리마인더 ✅
```

### 코드 구조 분석

```javascript
// 1. 이벤트 데이터 + 상태 파일 → 컨텍스트 조합
const toolName = extractJsonField(input, 'toolName');
const activeMode = detectActiveMode();     // 상태 파일에서 현재 모드 판단
const agentCount = getActiveAgentCount();  // tracking.json에서 활성 에이전트 수

// 2. 모드별 기본 메시지
const modeMessages = {
  autopilot: "오케스트레이터로서 작업 중. 코드 수정은 executor에 위임.",
  ralph: "끈기 모드. 완료될 때까지 멈추지 말 것.",
  default: ""
};

// 3. 도구별 맞춤 메시지
const toolMessages = {
  Task: `병렬 실행 가능한 작업은 동시에. 현재 활성 에이전트: ${agentCount}개`,
  Bash: "독립적 작업은 병렬로. 긴 작업은 백그라운드로",
  Edit: "수정 후 반드시 동작 검증",
  Read: "여러 파일은 병렬로 읽어라",
};

// 4. 조합해서 반환
const context = [modeMessages[activeMode], toolMessages[toolName]]
  .filter(Boolean).join('\n');
```

### 배울 점

| 패턴 | 설명 | fe-workflow 적용 |
|------|------|-----------------|
| **상태 인식 리마인더** | 같은 도구라도 모드에 따라 다른 메시지 | 우리 워크플로우 모드별 리마인더 필수 |
| **에이전트 수 주입** | tracking.json의 활성 에이전트 수를 Claude에게 알림 | 병렬 작업 관리 시 유용 |
| **매 동작 교정** | 프롬프트 한 번이 아니라 매번 반복 주입 | 장기 세션에서 원칙 유지의 핵심 |
| **조합 패턴** | 모드 메시지 + 도구 메시지를 레이어로 조합 | 확장 가능한 리마인더 구조 |

---

## 4. 상태 관리: .omc/state/

### 왜 상태가 필요한가?

```
문제: Claude는 기본적으로 "무상태"
  - 세션이 길어지면 초반 지시를 잊음
  - 컨텍스트 압축 시 모드 정보 유실
  - 에이전트 수, 진행 상황 추적 불가

해결: 파일 시스템에 상태 저장
  .omc/state/autopilot-state.json
  .omc/state/ralph-state.json
  .omc/state/subagent-tracking.json
```

### 상태 파일 구조

```javascript
// keyword-detector가 모드 활성화 시 생성
function activateState(directory, prompt, stateName) {
  const state = {
    active: true,
    started_at: new Date().toISOString(),
    original_prompt: prompt,           // 원래 사용자 요청 보존
    reinforcement_count: 0,            // 리마인더 주입 횟수
    last_checked_at: new Date().toISOString()
  };

  // 로컬 + 글로벌 두 곳에 저장
  writeFileSync('.omc/state/autopilot-state.json', JSON.stringify(state));
  writeFileSync('~/.omc/state/autopilot-state.json', JSON.stringify(state));
}
```

**주목:**
- `original_prompt` — 사용자의 원래 요청을 저장. 컨텍스트 압축돼도 원래 목표를 잃지 않음
- `reinforcement_count` — 리마인더를 몇 번 주입했는지 추적
- **로컬 + 글로벌** 두 곳에 저장 — 프로젝트별 상태 + 전역 상태 동시 관리

### 상태 활용 흐름

```
1. keyword-detector  → 모드 활성화 → 상태 파일 생성
2. pre-tool-enforcer → 매 도구마다 상태 파일 읽기 → 모드별 리마인더 주입
3. persistent-mode   → Stop 이벤트 시 상태 확인 → "아직 안 끝났으면 계속"
4. session-start     → 세션 시작 시 이전 상태 복원
5. cancel            → 상태 파일 삭제 → 모드 해제
```

### subagent-tracker: 에이전트 추적

```javascript
// hooks.json
"SubagentStart": [{ command: "subagent-tracker.mjs start" }]
"SubagentStop":  [{ command: "subagent-tracker.mjs stop" }]
```

```
서브 에이전트 생성 시 → start → tracking.json에 기록
서브 에이전트 종료 시 → stop  → tracking.json 업데이트

tracking.json:
{
  "agents": [
    { "id": "abc", "status": "running", "type": "executor" },
    { "id": "def", "status": "completed", "type": "architect" }
  ],
  "total_spawned": 5
}
```

**pre-tool-enforcer가 이 정보를 읽어서:**
```
"현재 활성 에이전트 3개. 병렬 실행 가능한 작업은 동시에 실행하라"
```
→ 메인 Claude가 현재 몇 개 에이전트가 돌고 있는지 알 수 있음.

---

## 5. persistent-mode: 끈기 모드

### 왜 필요한가?

Claude는 기본적으로 **적당히 하고 멈추려는 경향**이 있다.
복잡한 작업 중간에 "이 정도면 됐습니다"라고 끝내버리는 문제.

### 동작 원리

```
Claude가 응답을 완료하려 함 (Stop 이벤트)
              │
              ▼
┌─────────────────────────────────┐
│  persistent-mode.cjs 실행        │
│                                  │
│  1. 상태 파일 확인               │
│     .omc/state/ralph-state.json  │
│     .omc/state/autopilot-state.json │
│                                  │
│  2. 활성 모드가 있으면:           │
│     → "아직 완료 안 됨. 계속해"   │
│     → continue: true 반환        │
│                                  │
│  3. 활성 모드가 없으면:           │
│     → 정상 종료 허용              │
│     → continue: true (간섭 없음) │
└─────────────────────────────────┘
```

### Stop Hook의 반환값 구조

```javascript
// 활성 모드가 있을 때
{
  continue: true,                    // ← 핵심: Stop 이벤트에서 true = "계속 실행"
  hookSpecificOutput: {
    additionalContext:               // Claude의 다음 턴에 주입되는 메시지
      "[PERSISTENCE MODE ACTIVE]\n" +
      "작업이 아직 완료되지 않았습니다.\n" +
      `원래 목표: ${state.original_prompt}\n` +
      "남은 할 일을 확인하고 계속 진행하세요.\n" +
      "멈추지 마세요."
  }
}

// 활성 모드가 없을 때
{
  continue: true                     // 간섭 없이 정상 종료 허용
  // additionalContext 없음
}
```

**Stop Hook에서 `continue: true`의 의미:**
- Stop 이벤트는 다른 이벤트와 다름
- `continue: true` = Claude가 응답을 이어서 생성 (멈추지 않음)
- `additionalContext`가 있으면 → 다음 턴의 컨텍스트에 주입
- `additionalContext`가 없으면 → 자연스럽게 종료

**original_prompt 복원의 실전 효과:**
```
세션 초반: "로그인 페이지를 만들어" (original_prompt)
     ↓
Phase 3 진행 중, 컨텍스트 압축 발생
     ↓
Claude: "어... 내가 뭘 하고 있었지?"
     ↓
persistent-mode: "원래 목표: 로그인 페이지를 만들어"
     ↓
Claude: Phase 4(QA)로 진행
```

컨텍스트 압축은 장기 세션에서 **반드시** 발생한다. original_prompt를 파일 시스템에 저장해두면 이 문제를 해결.

---

## 6. Hook 간 상호작용: 상태 파일이 만드는 연결고리

### 왜 이 관점이 중요한가?

Level 2에서 각 Hook을 **개별**로 배웠고, 위 섹션들에서 **심층** 분석했다.
하지만 OMC의 진짜 힘은 **Hook들이 상태 파일을 매개로 협력하는 구조**에 있다.

### 상태 파일 = Hook 간 통신 채널

```
Hook들은 서로 직접 호출하지 않는다.
대신 .omc/state/ 의 JSON 파일을 통해 간접 통신한다.

┌──────────────────┐
│ keyword-detector  │──쓰기──→ autopilot-state.json ──읽기──→┌──────────────────┐
│ (UserPromptSubmit)│                    │                   │ pre-tool-enforcer │
└──────────────────┘                    │                   │ (PreToolUse)      │
                                        │                   └──────────────────┘
                                        │
                                        └──────────읽기──→┌──────────────────┐
                                                          │ persistent-mode   │
                                                          │ (Stop)            │
                                                          └──────────────────┘
```

```
┌──────────────────┐
│ subagent-tracker  │──쓰기──→ tracking.json ──읽기──→┌──────────────────┐
│ (SubagentStart/   │                                 │ pre-tool-enforcer │
│  SubagentStop)    │                                 │ (PreToolUse)      │
└──────────────────┘                                 └──────────────────┘
```

### 시간순 협력 흐름

```
t0: 사용자 "autopilot으로 만들어"
    │
    ▼
t1: [keyword-detector] ──→ autopilot-state.json 생성 (active: true, original_prompt 저장)
    │
    ▼
t2: Claude가 Skill/Command 로드 → Phase 1 시작
    │
    ▼
t3: [pre-tool-enforcer] ──→ state 읽기 → autopilot 모드 인식
    │                        → "오케스트레이터로서 코드 수정은 executor에 위임"
    │
    ▼
t4: Claude가 Task(architect) 호출
    │
    ▼
t5: [subagent-tracker] ──→ tracking.json에 architect 기록
    │
    ▼
t6: [pre-tool-enforcer] ──→ tracking.json 읽기
    │                        → "현재 활성 에이전트 1개"
    │
    ▼
t7: architect 완료 → executor × 3 병렬 호출
    │
    ▼
t8: [subagent-tracker] ──→ tracking.json 업데이트 (활성 3개)
    │
    ▼
t9: [pre-tool-enforcer] ──→ "현재 활성 에이전트 3개. 병렬 실행 가능한 작업은 동시에"
    │
    ▼
... (Phase 4, 5 진행)
    │
    ▼
tN: Claude가 응답 완료하려 함
    │
    ▼
tN+1: [persistent-mode] ──→ state 읽기 → active: true
      │                      → "아직 완료 안 됨. 원래 목표: {original_prompt}"
      │
      ▼
tN+2: Claude 계속 진행
    │
    ▼
t완료: 모든 Phase 완료 → autopilot-state.json 삭제
      │
      ▼
      [persistent-mode] ──→ state 없음 → 정상 종료 허용
```

### 핵심 설계 원칙: 파일 시스템 = 공유 메모리

```
왜 DB나 IPC가 아닌 파일 시스템?

1. Claude Code의 Hook은 독립 프로세스 — 메모리 공유 불가
2. 파일은 가장 단순한 프로세스 간 통신 수단
3. JSON이라 디버깅이 쉬움 (cat으로 바로 확인 가능)
4. 세션 간에도 유지됨 (세션 종료 후 재시작해도 상태 복원)
```

### fe-workflow 적용 시 고려사항

| 포인트 | 설명 |
|--------|------|
| **상태 파일 설계 먼저** | Hook을 만들기 전에 "어떤 상태를 공유할지" 먼저 설계 |
| **읽기/쓰기 분리** | 한 Hook이 쓰고 다른 Hook이 읽는 단방향 흐름 유지 |
| **상태 파일 = API** | 상태 파일의 JSON 스키마가 곧 Hook 간 인터페이스 |
| **정리 전략** | 모드 종료 시 상태 파일 삭제하는 cancel 로직 필수 |

---

## 7. 전체 메커니즘 종합

### OMC의 동작을 하나의 흐름으로

```
[세션 시작]
    │
    ▼
Hook(SessionStart) → 이전 상태 복원, 버전 확인
    │
    ▼
사용자: "autopilot으로 로그인 페이지 만들어"
    │
    ▼
Hook(UserPromptSubmit) → keyword-detector
    │  "autopilot" 감지
    │  .omc/state/autopilot-state.json 생성
    │  "Skill: autopilot 호출해" 메시지 주입
    │
    ▼
Skill(autopilot) 로드 → 기준/지식 컨텍스트에 추가
Command(autopilot) 실행 → 5단계 워크플로우 대본 로드
    │
    ▼
메인 Claude: Phase 1 (Expansion) — 직접 수행
    │
    ▼
메인 Claude: Phase 2 (Planning) — Task(architect) 위임
    │                                    │
    │  Hook(PreToolUse) ←─────────────────┘
    │  "병렬 가능한 건 동시에"
    │                                    │
    │  Hook(SubagentStart) ←─────────────┘
    │  tracking.json에 기록
    │                                    │
    │  architect가 설계 완료 ──→ 결과 반환
    │                                    │
    │  Hook(SubagentStop) ←──────────────┘
    │  tracking.json 업데이트
    │
    ▼
메인 Claude: Phase 3 (Execution) — Task(executor) × N 병렬
    │
    │  executor-low  → 설정 파일
    │  executor      → 컴포넌트
    │  executor-high → 복잡한 로직
    │
    ▼
메인 Claude: Phase 4 (QA) — 빌드/린트 실행
    │
    │  실패 → Phase 3로 돌아감
    │  성공 ↓
    │
    ▼
메인 Claude: Phase 5 (Validation) — Task(architect) × 3 병렬 리뷰
    │
    │  REVISE → Phase 3로 돌아감
    │  APPROVED ↓
    │
    ▼
완료 → .omc/state/autopilot-state.json 삭제
    │
    ▼
Hook(Stop) → persistent-mode
    상태 파일 없음 → 정상 종료 허용
```

### 만약 중간에 Claude가 멈추려 하면?

```
Phase 3 실행 중, Claude: "이 정도면 됐습니다—"
    │
    ▼
Hook(Stop) → persistent-mode
    │  autopilot-state.json 확인 → active: true
    │
    ▼
"[PERSISTENCE MODE] 아직 완료 안 됨.
 원래 목표: 로그인 페이지 만들어
 Phase 4, 5가 남았습니다. 계속하세요."
    │
    ▼
Claude: 계속 진행
```

---

## 요약

### OMC의 4가지 핵심 메커니즘

| 메커니즘 | 담당 | 핵심 |
|----------|------|------|
| **키워드 라우팅** | keyword-detector.mjs | 자연어 → Skill/Command 연결. 오탐 방지 + 충돌 해소 |
| **오케스트레이션** | autopilot.md (Command) | 5단계 대본 + 에이전트 티어 선택 + 코드 수정 금지 |
| **실시간 교정** | pre-tool-enforcer.mjs | 상태 인식형 리마인더. 모드 + 도구별 맞춤 메시지 |
| **상태 관리** | .omc/state/*.json | Hook 간 통신 채널. 모드 유지, 목표 보존, 에이전트 추적 |

### fe-workflow에 적용할 패턴 판단

| OMC 패턴 | 적용? | 이유 |
|----------|-------|------|
| 오탐 방지 sanitize | ✅ | 키워드 감지 쓸 때 필수 |
| 자연어 패턴 매칭 | ⚠️ 후순위 | 우선은 명시적 `/command`로 충분 |
| 충돌 해소 | ⚠️ 후순위 | 모드가 많아지면 필요 |
| 5단계 워크플로우 | ✅ 변형 | 우리 워크플로우에 맞게 Phase 재정의 |
| 에이전트 티어 | ⚠️ 후순위 | 비용 최적화는 나중에 |
| **상태 인식형 리마인더** | ✅ | 모드별 다른 교정 메시지 — 장기 세션 품질 유지의 핵심 |
| **상태 파일 기반 Hook 협력** | ✅ | Hook 간 통신 아키텍처 — 먼저 상태 스키마 설계 |
| persistent-mode | ✅ | 자율 실행의 핵심 |
| subagent-tracker | ⚠️ 후순위 | 병렬 에이전트 많아지면 필요 |

---

## 이해 체크

- [ ] keyword-detector의 sanitize → 매칭 → 충돌 해소 → 스킬 호출 흐름을 안다
- [ ] autopilot 5단계 중 어떤 Phase가 순차이고 어떤 Phase 안에서 병렬인지 구분할 수 있다
- [ ] pre-tool-enforcer가 상태 파일을 읽어서 모드별로 다른 리마인더를 주입하는 구조를 안다
- [ ] 상태 파일(.omc/state/)이 왜 필요한지, 어떤 정보를 저장하는지 안다
- [ ] persistent-mode가 Claude의 "멈추려는 경향"을 어떻게 방지하는지 안다
- [ ] Hook 간 상호작용이 파일 시스템(상태 파일)을 매개로 이루어지는 이유를 안다
- [ ] 오케스트레이터가 코드를 직접 안 쓰는 이유를 기술적으로 설명할 수 있다

---

> 다음: [Level 4 — 미니 플러그인 실습](./level-4-mini-plugin.md)
