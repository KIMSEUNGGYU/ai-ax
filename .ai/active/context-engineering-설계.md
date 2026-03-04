# Context Engineering 시스템 설계

## 목표
AI가 프로젝트 맥락을 잘 이해하고 유지할 수 있는 폴더 구조 + 워크플로우 + 자동화 시스템 설계

## 배경
- 모노레포 (6개 서비스) 환경에서 Claude Code 사용
- 루트/서비스별 실행 위치가 다름 → 문맥 단절
- 병렬 작업 시 current.md 오염 문제
- 스펙 완료 후 방치, 프로젝트 히스토리 부재
- 반복 코드 패턴(테이블, 필터, 페이지네이션 등)이 축적 안 됨

---

## 확정: 폴더 구조

```
monorepo/
  ├── CLAUDE.md                  ← ".ai/ 읽어라" 규칙
  ├── .ai/
  │   ├── INDEX.md               ← AI 진입점 (SessionStart Hook 주입)
  │   ├── active/                ← 진행 중 작업 (병렬 가능)
  │   │   ├── admin-auth.md
  │   │   └── dx-deploy.md
  │   ├── archive/               ← 완료 기록 (서비스별, 경량)
  │   │   └── admin/
  │   │       └── 청약-리스트.md
  │   └── patterns/              ← 재사용 코드 패턴 (핵심 자산)
  │       ├── table-filter.md
  │       └── pagination.md
  └── services/
        ├── admin/
        └── dx/
```

### 핵심 원칙
- `.ai/`는 모노레포 **루트에 단일** 관리 (어디서 실행해도 같은 문맥)
- 루트 CLAUDE.md → 상위 디렉토리 자동 로드로 하위 서비스에서도 적용
- `specs/` 별도 폴더 없음 → active 파일에 스펙+진행상태 통합

---

## 확정: 워크플로우

### 기본 사이클 (기존 session-manager 확장)

```
[세션 시작]
  SessionStart Hook → INDEX.md 주입
  → "어떤 작업?" → active/ 목록에서 선택 → 해당 파일 읽기

[작업 중]
  코딩 (UI → API 정리 → API 연결 → 상세 기능)

[컨텍스트 80%]
  /save → active/task.md 업데이트 → /clear → 다시 시작

[작업 완료]
  /done → archive 저장 + 패턴 질문 + active 삭제 + INDEX.md 업데이트
```

### 커맨드 정의

| 커맨드 | 단위 | 빈도 | 하는 일 |
|--------|------|------|---------|
| `/save` | 세션 | 매 세션 | active/task.md 의 "현재 컨텍스트" 업데이트 |
| `/resume` | 세션 | 매 세션 | 특정 active 파일 읽고 이어가기 (Hook 보완) |
| `/done` | 스펙(기능) | 기능 완료 시 | archive 저장 + 패턴 질문 + 정리 |

### /done 상세 동작

```
/done 실행
  ↓
1. active/task.md 읽기
2. archive/{서비스}/task.md 에 경량 기록 저장
3. patterns/ 확인 후 패턴 질문 (조건부)
   - 유사 패턴 있음 → "업데이트할까요?"
   - 패턴화 가능한 구조 감지 → "패턴으로 저장할까요?"
   - 해당 없음 → 질문 안 함
4. active/task.md 삭제
5. INDEX.md 업데이트
```

### 패턴 감지 기준 (규칙 기반)

질문하는 경우:
- 페이지 단위 구현 (list, detail, form)
- 공통 UI 조합 (테이블+필터, 폼+밸리데이션)
- API 연동 패턴 (새 도메인 CRUD)
- 상태관리 패턴 (새 store 구조)

질문 안 하는 경우:
- 버그 수정
- 단순 스타일 변경
- 기존 패턴 내 구현

---

## 확정: 파일 내용

### INDEX.md (AI 진입점, SessionStart 주입)

```markdown
# Project Context

## 현재 진행 중
- [admin 인증 리팩토링](active/admin-auth.md) — JWT→session
- [DX 배포 자동화](active/dx-deploy.md) — GitHub Actions

## 서비스 맵
| 서비스 | 역할 | 기술스택 |
|--------|------|----------|
| admin  | 관리자 | Next.js, Zustand |
| dx     | 개발도구 | Vite, React |

## 핵심 결정
- 상태관리: Zustand
- API: httpClient 래퍼
- 인증: JWT → session 전환 예정
```

### active/task.md (작업 파일)

```markdown
# 청약 리스트 페이지

## 스펙
- 기획서 요약 or 링크
- 주요 기능: 필터, 정렬, 페이지네이션

## 작업
- [x] UI 퍼블리싱
- [x] API 정리
- [ ] API 연결          ← 지금 여기
- [ ] 상세 기능

## 현재 컨텍스트 ← /save 시 업데이트
httpClient로 GET /subscriptions 연결 중...

## 결정사항
- useSuspenseQuery, staleTime 30초
```

### archive/ 파일 (경량 기록)

```markdown
# 청약 리스트 페이지
- 완료: 2026-02-20
- 구현: 테이블, 필터, 페이지네이션
- 결정: useSuspenseQuery, staleTime 30초, 서버사이드 필터
```

### patterns/ 파일 (재사용 패턴)

```markdown
# 테이블 + 필터 패턴

## 구조
pages/{도메인}/list/
  ├── page.tsx
  ├── components/FilterBar.tsx, DataTable.tsx
  └── hooks/useListParams.ts

## 핵심
- Query: useSuspenseQuery, staleTime 30초
- 필터: URL searchParams 기반
- 참고 구현: pages/subscription/list/
```

---

## 확정: 글로벌 시스템

- ~~`~/.claude/rules/context-system.md`~~ → **`session-manager/conventions/context-system.md`로 변경**
- 이유: convention은 플러그인 설치된 프로젝트에 자동 로드, ai-ax repo만 양쪽 PC에서 pull하면 sync 완료
- session-manager 플러그인 확장 — /save, /resume, /done 구현

---

## 확정: Git 관리

```gitignore
# git 추적
.ai/INDEX.md       ✅ (프로젝트 맵)
.ai/patterns/      ✅ (팀 자산)

# git 제외
.ai/active/        ❌ (개인 세션 상태)
.ai/archive/       ❌ (일단 제외, 검증 후 결정)
```

---

## 구현 완료 (session-manager v0.3.0)

- [x] `conventions/context-system.md` — .ai/ 운영 규칙
- [x] `/save` — active/{task}.md 기반으로 변경
- [x] `/resume` — active/ 목록 + 다음 작업 안내
- [x] `/done` — archive 저장 + 패턴 질문 + active 삭제
- [x] SessionStart Hook — INDEX.md + active/ 주입
- [x] SessionEnd Hook — active/*.md 타임스탬프 갱신
- [x] README.md, GUIDE.md, CLAUDE.md 전면 갱신
- [x] 회사 모노레포 INDEX.md 초안 생성
- [x] current.md → active/ 마이그레이션 (ai-ax, 회사 모노레포)

## 남은 작업

- [ ] 회사 모노레포에서 실제 테스트 (/save, /resume, /done)
- [ ] hookSpecificOutput.additionalContext 동작 확인

## 미결정 / 검증 필요 (써보면서)

| 항목 | 상태 | 비고 |
|------|------|------|
| archive 실효성 | 검증 필요 | 안 쓰면 제거 |
| INDEX.md 토큰 예산 | 미정 | 너무 크면 세션 비용 증가 |
| 패턴 감지 규칙 세부 | 점진적 조정 | 써보면서 다듬기 |
| 글로벌 knowledge/ | YAGNI | 패턴 안정화 후 재논의 |

---

## 리서치 참고

| 출처 | 핵심 패턴 |
|------|-----------|
| CCPM | GitHub Issue 기반 추적, 스펙→코드 연결 |
| BMAD | Document Sharding, Decision Traceability |
| 훈스 블로그 | Spec-Based Workflow, 세션 분리, CLAUDE.md 2.5k |
| sshh.io | Document & Clear, /catchup |
| Claude Code 공식 | MD 계층 로드, auto memory 200줄, rules/ 모듈 |
| OpenAI Codex | AGENTS.md, Progressive Disclosure, Skills |

<!-- last-active: 2026-03-03 22:50 -->
