# Claude Code 2026 업데이트 — Opus 4.6 & Agent Teams

> 2026년 2월 기준. 기존 학습 내용(오케스트레이션 패턴, 4컴포넌트)의 연장선에서 정리.

---

## 1. Claude Opus 4.6

### 출시 정보
- **출시일**: 2026년 2월 5일
- **모델 ID**: `claude-opus-4-6`
- **가격**: 입력 $5 / 출력 $25 (100만 토큰당, 기존과 동일)

### 스펙 변경

| 항목 | Opus 4.5 | Opus 4.6 |
|------|----------|----------|
| **컨텍스트 윈도우** | 200K 토큰 | **1M 토큰** (베타) |
| **최대 출력** | 32K 토큰 | **128K 토큰** |

### 핵심 신규 기능

#### 1) Adaptive Thinking (적응형 사고)

기존 extended thinking은 on/off 방식이었다. Opus 4.6은 **자동 조절**.

```
간단한 질문 → thinking 거의 안 함 → 빠른 응답
복잡한 설계 → 깊은 thinking → 정확한 응답
도구 호출 사이 → interleaved thinking → 에이전트 워크플로우에 특히 유리
```

에이전트 오케스트레이션 관점에서의 의미:
- 오케스트레이터가 "다음에 뭘 할지" 판단할 때 자동으로 깊이 사고
- 단순 파일 읽기 같은 작업에서는 토큰 절약
- **Effort Controls** (`low`, `medium`, `high`, `max`)로 개발자가 직접 조절도 가능

#### 2) Context Compaction (컨텍스트 압축)

서버 사이드에서 자동으로 오래된 대화 컨텍스트를 요약/압축.

```
기존: 컨텍스트 200K 꽉 차면 → 앞의 지시를 잊음 → 불안정
4.6:  컨텍스트 임계값 도달 → 자동 압축 → 사실상 무한 대화
```

멀티 에이전트 관점:
- 기존에 "컨텍스트 분리"가 멀티 에이전트의 핵심 이유였음
- 1M 컨텍스트 + 자동 압축으로 **단일 에이전트의 한계가 크게 완화**
- 그래도 역할 분리, 병렬 실행 등의 이유로 멀티 에이전트는 여전히 유효

#### 3) 벤치마크

| 벤치마크 | 결과 |
|----------|------|
| Terminal-Bench 2.0 (에이전트 코딩) | 최고 점수 |
| Humanity's Last Exam (복합 추론) | 프론티어 모델 1위 |
| MRCR v2 8-needle 1M (장문 이해) | 76% (Sonnet 4.5는 18.5%) |

---

## 2. Agent Teams

### 기존 패턴과의 비교

01.오케스트레이션-패턴에서 학습한 내용:

```
Autopilot: 오케스트레이터가 순서 지정 → Task()로 서브 에이전트 위임
Swarm:     N개 에이전트가 공유 작업 목록에서 자율 수령
```

Agent Teams는 Claude Code에 **공식 내장된** 멀티 에이전트 기능이다.

### Subagent vs Agent Teams

| | Subagent (기존) | Agent Teams (신규) |
|---|---|---|
| **관계** | 메인 → 서브 (상하) | Team Lead ↔ Teammates (협업) |
| **소통** | 결과만 반환 | **팀원끼리 직접 메시지** (P2P) |
| **조정** | 메인이 모든 작업 관리 | **공유 Task List**로 자기 조정 |
| **컨텍스트** | 독립, 결과만 전달 | 독립, 메시징으로 소통 |
| **적합** | 결과만 필요한 집중 작업 | 토론/협업이 필요한 복합 작업 |
| **비용** | 낮음 | 높음 (각 인스턴스 별도 과금) |

### 구조

```
Team Lead (메인 세션)
  ├── Teammate A (독립 Claude Code 인스턴스)
  ├── Teammate B (독립 Claude Code 인스턴스)
  └── Teammate C (독립 Claude Code 인스턴스)
      │
      ├── 공유 Task List ← 작업 할당/수령
      └── Mailbox ← 에이전트 간 메시징
```

기존 오케스트레이션 패턴과 대비:

```
패턴 A (메인이 지휘):     메인 → Task(A), Task(B), Task(C) → 결과 수집
패턴 B (서브가 지휘):     메인 → Task(오케스트레이터) → Task(A), Task(B)
Agent Teams:             Lead ↔ Teammate A ↔ Teammate B ↔ Teammate C
                         (서로 직접 소통, 공유 작업 목록)
```

### 설정 방법

**1) 활성화** (실험 기능)

```json
// settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**2) 팀 생성 — 자연어로 요청**

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
```

**3) 디스플레이 모드**

| 모드 | 설명 |
|------|------|
| `in-process` | 기본값. 하나의 터미널에서 `Shift+Up/Down`으로 팀원 전환 |
| `tmux` / `auto` | tmux/iTerm2 사용. 각 팀원이 별도 패널 |

**4) Delegate Mode** — `Shift+Tab`으로 활성화

Lead가 직접 구현 안 하고 **조정(orchestration)만** 하도록 제한.

→ 01.오케스트레이션-패턴의 "오케스트레이터는 지휘만 한다" 원칙과 동일!

### 핵심 기능

| 기능 | 설명 |
|------|------|
| **Plan Approval** | 팀원이 구현 전 계획을 세우고 Lead 승인 |
| **Task Dependencies** | 작업 간 의존성 자동 관리. 선행 작업 완료 시 차단 해제 |
| **File Lock** | 동일 파일 동시 수정 방지 |
| **Hooks** | `TeammateIdle`, `TaskCompleted` 훅으로 품질 게이트 |
| **Direct Messaging** | Lead 거치지 않고 특정 팀원에게 직접 지시 |

### 사용 사례

```
리서치/리뷰:     여러 팀원이 서로 다른 관점으로 동시 조사
새 기능 개발:    각 팀원이 독립적인 영역 담당 (FE/BE/테스트)
경쟁 가설 디버깅: 각 팀원이 다른 이론 테스트 → 서로 반박
대규모 리팩토링: Swarm과 유사하지만 소통 가능
```

### 제약 사항 (실험 기능)

- 세션 재개 시 in-process 팀원 복원 불가
- 세션당 하나의 팀만 운영 가능
- 중첩 팀 불가 (팀원이 자체 팀 생성 불가)
- Lead 변경 불가

---

## 3. 기존 학습 내용과의 연결

### 오케스트레이션 패턴 진화

```
[학습한 것]                          [새로운 것]

Autopilot (순차 오케스트레이션)  ──→  Agent Teams + Delegate Mode
  오케스트레이터가 순서 지정           Lead가 조정, 팀원이 실행
  Task()로 서브 에이전트 위임          팀원끼리 직접 소통

Swarm (자율 수령)              ──→  Agent Teams + 공유 Task List
  SQLite로 작업 목록 관리              내장 Task List로 자율 조정
  원자적 트랜잭션으로 중복 방지         File Lock으로 충돌 방지
```

### 4컴포넌트와의 관계

| 컴포넌트 | Agent Teams에서 |
|----------|----------------|
| **Skill** | 각 Teammate에게 다른 Skill 적용 가능 (보안 전문가, 성능 전문가 등) |
| **Command** | 팀 생성 자체가 자연어 → 별도 Command 불필요 |
| **Agent** | Teammate = 공식 내장 Agent (disallowedTools 대신 역할 자연어 지정) |
| **Hook** | `TeammateIdle`, `TaskCompleted` 등 팀 전용 Hook 추가 |

### 컨텍스트 분리 관점

```
기존 이해:
  "멀티 에이전트의 본질 = 컨텍스트 분리"
  → 기억 공간 한계를 우회하는 전략

Opus 4.6 이후:
  1M 컨텍스트 + 자동 압축 → 단일 에이전트 한계 크게 완화
  그래도 멀티 에이전트가 필요한 이유:
    ✅ 역할 분리 (설계자 vs 구현자 vs 검증자)
    ✅ 병렬 실행 (독립 작업 동시 처리)
    ✅ 전문성 (각 에이전트에 다른 Skill/역할)
    ✅ 소통 (Agent Teams의 P2P 메시징)
```

---

## 4. Claude Code 기타 최신 업데이트 (2026년 1~2월)

| 기능 | 설명 |
|------|------|
| **Auto Memory** | 작업하면서 자동으로 기억 기록/회상 (`~/.claude/projects/*/memory/`) |
| **`--from-pr` 플래그** | 특정 GitHub PR에 연결된 세션 재개 |
| **Claude in Chrome (Beta)** | Claude Code에서 직접 브라우저 제어 |
| **Summarize from here** | 부분 대화 요약 기능 |

---

## 참고 출처

- [Anthropic - Introducing Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Claude Code Docs - Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [TechCrunch - Opus 4.6 with agent teams](https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/)
