# session-manager

AI 페어 프로그래밍 context 관리 플러그인. 세션 간 맥락을 `.ai/current.md` 파일로 유지한다.

## 커맨드

| 커맨드 | 역할 |
|--------|------|
| `/save` | 작업 컨텍스트를 `.ai/current.md`에 저장. `done` 인자 시 삭제 |
| `/resume` | `.ai/current.md` 수동 복원 (hook 미작동 시 사용) |

## Hook

| 이벤트 | 동작 |
|--------|------|
| SessionStart | `.ai/current.md` 존재 시 내용을 additionalContext로 주입 |

## 워크플로우

```
세션 종료       →  /save        →  .ai/current.md 생성/업데이트
     ↓
다음 세션 시작  →  (자동 hook)  →  current.md 내용 주입
     ↓
(hook 미작동)   →  /resume      →  current.md 수동 로드
     ↓
작업 완료       →  /save done   →  current.md 삭제
```

## 파일 구조

```
session-manager/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── save.md          ← /save 커맨드
│   └── resume.md        ← /resume 커맨드
├── hooks/
│   └── hooks.json       ← SessionStart hook 등록
├── scripts/
│   └── session-start.mjs  ← hook 스크립트
└── README.md
```

## current.md 포맷

```markdown
# {작업 제목}

## 목표
{한 줄 요약}

## 스펙 참조
{.ai/specs/ 경로, 없으면 생략}

## 진행
- [x] 완료 항목
- [ ] 남은 항목

## 작업 내역
- {이번 세션에서 한 구체적 작업}

## 결정사항
- 결정 + 이유

## 메모
{블로커, 주의사항}
```

## 설계 히스토리

### v0 → v1 변경 이유

**v0 문제점:**
- `STATUS.md` + `DECISIONS.md` + 세션 로그 + 습관 점수 등 저장 대상이 너무 많았음
- learning 플러그인(context/latest.md)과 기능 중복
- 습관 점수/대시보드는 실제로 거의 안 쓰임

**v1 설계 원칙:**
- **하나의 파일(`current.md`)로 단순화** — 세션 간 맥락 전달의 단일 진실 공급원
- 세션 ID, 습관 점수 등 부가 기능 제거
- `/note`, `/dashboard` 제거 (v2에서 별도 검토)
- current.md 없으면 hook이 아무것도 주입 안 함 (불필요한 메시지 제거)
