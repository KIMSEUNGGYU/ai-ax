# Everything Claude Code 구조 분석

## 전체 디렉토리 구조

```
everything-claude-code/
├── agents/              # 서브에이전트 (Task 위임용)
├── skills/              # 도메인 지식 & 워크플로우
├── commands/            # 슬래시 명령어
├── rules/               # 항상 적용되는 규칙
│   ├── common/          # 언어 무관
│   ├── typescript/
│   ├── python/
│   └── golang/
├── hooks/               # 이벤트 기반 자동화
├── scripts/             # 훅에서 호출하는 Node.js 스크립트
├── contexts/            # 모드별 시스템 프롬프트
├── mcp-configs/         # MCP 서버 설정
├── examples/            # CLAUDE.md 예제
└── .claude-plugin/      # 플러그인 매니페스트
```

---

## 1. Agents (13개) — "누구에게 위임할 것인가"

서브에이전트는 `.md` 파일로 정의. Claude Code의 `Task` 도구로 위임된다.

| 에이전트 | 역할 | 사용 도구 |
|----------|------|-----------|
| `planner` | 기능 구현 계획 수립 | Read, Grep, Glob (opus) |
| `architect` | 시스템 설계 결정 | Read, Grep, Glob |
| `tdd-guide` | 테스트 주도 개발 가이드 | Read, Grep, Glob |
| `code-reviewer` | 품질/보안 리뷰 | Read, Grep, Glob |
| `security-reviewer` | 취약점 분석 | Read, Grep |
| `e2e-runner` | Playwright E2E 테스트 | Bash, Read |
| `refactor-cleaner` | 미사용 코드 정리 | Read, Grep, Glob |
| `build-error-resolver` | 빌드 오류 해결 | Bash, Read |
| `doc-updater` | 문서 자동 업데이트 | Read, Write |
| `go-reviewer` | Go 전문 리뷰 | Read, Grep |
| `python-reviewer` | Python 전문 리뷰 | Read, Grep |
| `database-reviewer` | DB/Supabase 리뷰 | Read, Grep |
| `go-build-resolver` | Go 빌드 오류 해결 | Bash, Read |

### 에이전트 파일 구조

```markdown
---
name: planner
description: 복잡한 기능과 리팩토링을 위한 계획 전문가
tools: [Read, Grep, Glob]
model: opus
---

# 역할
- 상세 구현 계획 작성
- 복잡한 기능을 단계별 분해
- 의존성/위험 파악

# 프로세스
1. 요구사항 분석
2. 아키텍처 검토 (기존 코드 분석)
3. 단계 분해 (파일 경로, 의존성, 복잡도)
4. 구현 순서 결정
```

---

## 2. Rules — "항상 지켜야 할 규칙"

CC 공식 기능 `.claude/rules/`를 활용. 모든 세션에 자동 로드.

### 구조

```
rules/
├── common/
│   ├── coding-style.md    # 불변성, 파일 200-400줄, 함수 50줄 이하
│   ├── git-workflow.md    # 커밋 형식, PR 프로세스
│   ├── testing.md         # TDD, 80% 커버리지
│   ├── performance.md     # 모델 선택, 컨텍스트 관리
│   ├── patterns.md        # 디자인 패턴
│   ├── hooks.md           # 훅 아키텍처
│   ├── agents.md          # 에이전트 위임 시점
│   └── security.md        # 보안 검사
├── typescript/
├── python/
└── golang/
```

### 핵심 규칙 (coding-style.md)

- **불변성**: 기존 객체 변경 금지, 새 객체 반환
- **파일 크기**: 200-400줄 권장, 800줄 max
- **구성**: 타입별이 아닌 기능/도메인별 구성
- **입력 검증**: 시스템 경계에서 항상 검증
- **함수**: 50줄 이하, 중첩 4단계 max

### Path 스코핑 (CC 공식 기능)

```markdown
---
paths:
  - "src/api/**/*.ts"
---
# API 규칙 (해당 경로 파일 작업 시에만 활성화)
```

---

## 3. Commands (31개) — "슬래시로 빠르게 실행"

`.md` 파일로 정의. `/plan`, `/tdd` 등으로 호출.

| 카테고리 | 명령어 |
|----------|--------|
| **워크플로우** | `/plan`, `/learn`, `/checkpoint`, `/verify` |
| **코드 품질** | `/code-review`, `/go-review`, `/python-review`, `/refactor-clean` |
| **테스트** | `/tdd`, `/e2e`, `/test-coverage`, `/go-test` |
| **빌드** | `/build-fix`, `/go-build` |
| **멀티에이전트** | `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend` |
| **학습** | `/instinct-status`, `/instinct-import`, `/instinct-export`, `/evolve` |
| **유틸** | `/pm2`, `/sessions`, `/skill-create`, `/update-docs` |

---

## 4. Skills (29개) — "깊은 도메인 지식"

Commands가 "실행"이라면 Skills는 "지식". `SKILL.md`로 정의.

| 카테고리 | 스킬 |
|----------|------|
| **언어별** | `coding-standards`, `golang-patterns`, `python-patterns` |
| **백엔드** | `backend-patterns`, `django-*`, `springboot-*`, `jpa-patterns` |
| **프론트엔드** | `frontend-patterns` |
| **품질** | `tdd-workflow`, `security-review`, `verification-loop` |
| **학습** | `continuous-learning`, `continuous-learning-v2` |
| **기타** | `iterative-retrieval`, `strategic-compact`, `eval-harness` |

---

## 5. Hooks — "이벤트 기반 자동화"

```json
{
  "PreToolUse": [
    { "matcher": "Bash(npm run dev)", "command": "tmux 내에서만 실행" },
    { "matcher": "Bash(git push)", "command": "push 전 변경사항 검토 알림" },
    { "matcher": "Write(*.md)", "command": "불필요한 md 생성 차단" }
  ],
  "PostToolUse": [
    { "matcher": "Write(*.ts|*.tsx)", "command": "Prettier 자동 포맷팅" },
    { "matcher": "Write(*.ts)", "command": "TypeScript 타입 검사" },
    { "matcher": "Write(*.js|*.ts)", "command": "console.log 경고" }
  ],
  "SessionStart": ["이전 컨텍스트 로드 + 패키지 매니저 감지"],
  "SessionEnd": ["상태 저장 + 패턴 평가"]
}
```

---

## 6. Scripts — "훅이 호출하는 실행 파일"

```
scripts/
├── lib/
│   ├── utils.js              # 파일/경로 유틸
│   └── package-manager.js    # npm/yarn/pnpm/bun 감지
├── hooks/
│   ├── session-start.js      # 이전 컨텍스트 로드
│   ├── session-end.js        # 상태 저장
│   └── evaluate-session.js   # 패턴 추출 (학습)
└── setup-package-manager.js
```

---

## 7. Contexts — "모드별 시스템 프롬프트"

```
contexts/
├── dev.md       # 개발 모드 (코드 작성 중심)
├── review.md    # 리뷰 모드 (품질 중심)
└── research.md  # 탐색 모드 (조사 중심)
```

---

## 8. Continuous Learning (인스팅크트)

가장 독창적인 부분. 세션에서 패턴을 자동 학습.

```
사용자 작업 → 훅이 패턴 캡처
→ 옵저버 에이전트(Haiku)가 분석
→ 인스팅크트 생성 (신뢰도 0.3~0.9)
→ /evolve로 관련 인스팅크트를 스킬로 진화
```

| 신뢰도 | 의미 |
|--------|------|
| 0.3 | 시험적 (제안만) |
| 0.7 | 강함 (자동 승인) |
| 0.9 | 확실 (핵심 행동) |

---

## CC 공식 기능 vs ECC 자체 구현

| 기능 | CC 공식 | ECC 자체 |
|------|---------|----------|
| `rules/` 디렉토리 | ✅ 공식 | 규칙 **내용**만 자체 작성 |
| `commands/` 슬래시 명령어 | ✅ 공식 | 명령어 **내용**만 자체 작성 |
| `agents/` 서브에이전트 | ✅ 공식 | 에이전트 **정의**만 자체 작성 |
| `hooks/` 이벤트 훅 | ✅ 공식 | 훅 **설정**만 자체 작성 |
| `skills/` 스킬 | ✅ 공식 | 스킬 **내용**만 자체 작성 |
| Continuous Learning | ❌ | ✅ ECC 자체 구현 |
| 플러그인 패키징 | ✅ 공식 | 매니페스트만 자체 작성 |

> 결론: ECC는 CC 공식 메커니즘 위에 **자기만의 콘텐츠**를 채운 것. 학습 시스템만 자체 구현.
