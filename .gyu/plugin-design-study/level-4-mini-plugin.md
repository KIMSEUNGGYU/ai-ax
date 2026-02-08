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
