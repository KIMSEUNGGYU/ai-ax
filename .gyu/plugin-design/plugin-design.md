# fe-workflow 플러그인 설계

## 개요

FE 개발 워크플로우를 하나의 플러그인으로 통합 관리.
기존 `~/.claude/commands/`, `~/.claude/skills/` 레거시를 대체.

## 배경

### 현재 (레거시)
- `~/.claude/commands/`: architecture, review, recap, organization
- `~/.claude/skills/fe-principles/`: 코드 원칙 (자동 적용)
- 문제: 구현 중 원칙 적용 미흡, 리뷰 깊이 부족

### 목표
- 기존 워크플로우 개선 + 플러그인으로 통합
- 구현 중 원칙이 실제로 적용되도록 강화
- 코드 리뷰 깊이/체계 향상
- MD 기반 문서 관리 (설계, 스펙, 지식 축적)
- 로컬 개발 → 마켓플레이스 배포

---

## 작업 흐름

### Step 1: 코드 컨벤션/철학 정리 ✅
> conventions/ 폴더에 영역별로 정리. 이 내용이 플러그인 skill의 소스가 됨.

- [x] code-principles.md
- [x] folder-structure.md
- [x] api-layer.md (구 api-type-layer.md)
- [~] error-handling.md — 톤 정리 추후

### Step 2: 플러그인 컴포넌트 설계 ← 현재 (v0.3)
> 정리된 컨벤션을 기반으로 플러그인 구성 요소 확정

- [x] Skills 상세 설계 — fe-principles (auto-load)
- [x] /review Level 4 재설계 완료 (v0.2)
- [x] v0.3 전체 워크플로우 설계 (아래 참조)
- [ ] architect.md 에이전트 구현
- [ ] /architecture Level 4 재설계 + 산출물 저장
- [ ] /pr command 신규 구현
- [ ] 로그/상태 관리 구조 구현 (v0.4+)

### Step 3: 플러그인 구현 + 테스트
> 로컬에서 플러그인 테스트

- [ ] 플러그인 로드 테스트 (`claude --plugin-dir ./fe-workflow`)
- [ ] 각 command 호출 테스트
- [ ] 검증 및 피드백 반영

### Step 4: 마이그레이션
> 기존 레거시 대체

- [x] 기존 commands/skills 삭제
- [ ] 마켓플레이스 배포 (GitHub)

---

## 결정 사항

- 플러그인명: `fe-workflow`
- 위치: 로컬 개발 → GitHub 마켓플레이스
- 레거시: 플러그인 완성 후 삭제
- 설계 철학: **ECC (설정 지향, 품질 중심, 개발자 주도)** + OMC 구조 패턴 차용

### 설계 원칙 (ECC vs OMC 분석 기반)

| 원칙 | 선택 | 이유 |
|------|------|------|
| MD 기반 규칙/컨벤션 | ECC | conventions/가 Skill의 소스 |
| 명시적 워크플로우 | ECC | `/architecture → 구현 → /review → /recap` |
| 4컴포넌트 구조 | OMC 차용 | Skill/Command/Agent/Hook 구조는 효과적 |
| 역할 제한 (disallowedTools) | OMC 차용 | review 에이전트 읽기 전용 등 |
| FE 전문 소수 에이전트 | ECC | 5~8개면 충분, 범용 35개 불필요 |
| 자연어 매직 (keyword-detector) | 불필요 | 명시적 `/command`로 충분 |
| 복잡한 상태 관리 (.omc/state/) | 불필요 | 단순 워크플로우에 과도 |
| Agent Teams (TeammateTool) | v0.5+ 검토 | 현재 규모에 과도. conventions 10개+ 확장 시 재검토 |

> 상세 분석: `.gyu/plugin-design-study/README.md` 하단 참조

---

## v0.3 워크플로우 설계

### 레퍼런스

| 프로젝트 | 핵심 패턴 | 참고 포인트 |
|---|---|---|
| oh-my-claudecode | Command→Skill(전략)→Agent(실행), 3계층 모델 라우팅 | 에이전트 계층 분리, disallowedTools |
| everything-claude-code | Command→Agent 직접 위임, Command 간 체이닝 | 실용적 구조, plugin.json 선언 방식 |

→ **ECC 패턴 채택**: Command가 Agent를 직접 위임, 명시적 체이닝

### 전체 워크플로우

```
/architecture → (개발) → /review → /pr
                           ↑
                     fe-principles (Skill, auto-load)
```

### 컴포넌트 맵

```
fe-workflow/
├── .claude-plugin/
│   └── plugin.json              ← 컴포넌트 선언 강화
├── conventions/                  ← 지식 소스 (현행 유지)
│   ├── code-principles.md
│   ├── folder-structure.md
│   ├── api-layer.md
│   └── error-handling.md
├── skills/
│   └── fe-principles/SKILL.md   ← auto-load (현행 유지)
├── commands/
│   ├── architecture.md           ← Level 4 재설계 (오케스트레이터→agent 위임)
│   ├── review.md                 ← 현행 유지 (v0.2 완성)
│   ├── pr.md                     ← 신규
│   ├── recap.md                  ← 현행 유지 (보조)
│   └── organization.md           ← 현행 유지 (보조)
├── agents/
│   ├── architect.md              ← 신규 (설계 전문, Read only)
│   └── code-reviewer.md          ← 현행 유지
└── logs/                         ← v0.4+ 구현 예정
```

### 단계별 설계

#### 1. 설계 — `/architecture` → `architect` agent
- Command: 오케스트레이터 (요구사항 수집 → agent 위임 → 결과 전달)
- Agent: `architect.md` — Read only (disallowedTools: Write, Edit, Bash)
- **산출물을 md 파일로 저장** (구현 지시서 → 개발 단계에서 참조 가능)

#### 2. 개발 — command 없음
- 메인 Claude가 직접 수행 (Skill auto-load로 원칙 자동 주입)
- 서브에이전트 불필요 — 대화 컨텍스트 유지 + 실시간 피드백이 중요
- `/architecture` 산출물(md)을 참조하며 개발

#### 3. 리뷰 — `/review` → `code-reviewer` agent
- 현행 v0.2 유지 (3-Phase 오케스트레이터 + 4-Step 프로토콜)

#### 4. PR — `/pr` (신규)
- Command 단독 실행 (agent 불필요)
- 브랜치 diff 수집 → PR 제목/본문 자동 생성 → `gh pr create`

### 버전 로드맵

| 버전 | 범위 | 핵심 |
|---|---|---|
| **v0.2** ✅ | /review Level 4, commands 마이그레이션 | 오케스트레이터+에이전트 패턴 확립 |
| **v0.3** | 전체 워크플로우 구현 | architect agent, /architecture 재설계, /pr 신규 |
| **v0.4** | 로그/상태 관리 | Command 실행 로그, 리뷰 점수 추적, Hook 자동화 |
| **v0.5** | Agent Teams 검토 | 멀티 리뷰어, 병렬 설계 탐색 (규모 확장 시) |

#### v0.4 — 로그/상태 관리

- 각 Command 실행 시 로그 자동 기록
- 기록 내용: timestamp, command명, 입력 요약, 산출물 경로, (리뷰 시) 점수
- Hook(PostToolUse)으로 자동화 검토
- 용도: 워크플로우 어느 단계에서 문제가 발생했는지 추적 → 개선 포인트 파악

#### v0.5 — Agent Teams 검토

- Opus 4.6의 TeammateTool — 팀원끼리 직접 대화, 공유 태스크 리스트, 자율 조율
- 현재 fe-workflow 규모에는 과도 (토큰 3~5배, 실험 기능 제약)
- 검토 시점: conventions 10개+ 확장, 리뷰 영역이 보안/성능/접근성으로 확장될 때

---

## 로그

- 2025-02-05: Step 1 시작 - API/타입 계층 컨벤션 정리 완료
- 2026-02-08: v0.3 전체 워크플로우 설계 완료
