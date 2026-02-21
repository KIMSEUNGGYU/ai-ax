# session-manager

AI 페어 프로그래밍 context 관리 플러그인. 세션 간 맥락을 `.ai/current.md` 파일로 유지하고, 세션 지식을 영속 저장소에 보존한다.

## 커맨드

| 커맨드 | 역할 |
|--------|------|
| `/save` | 작업 컨텍스트를 `.ai/current.md`에 저장 |
| `/resume` | `.ai/current.md` 수동 복원 (hook 미작동 시 사용) |
| `/note` | 세션 지식을 영속 저장소에 저장 (AI 자동 판단) |

## 스킬

| 스킬 | 트리거 |
|------|--------|
| `note` | "정리해줘", "남겨둬", "노트로 만들어줘" 등 자연어 |

## Hook

| 이벤트 | 동작 |
|--------|------|
| SessionStart | `.ai/current.md` 존재 시 내용을 additionalContext로 주입 |
| SessionEnd | `.ai/current.md` 존재 시 last-active 타임스탬프 갱신 |

## 저장 체계

```
세션 대화 (휘발)
    ↓ SessionEnd Hook (자동)
current.md (작업 context, 세션 간 유지)
    ↓ /note (수동 트리거)
영속 저장소:
  ├── .ai/notes/       ← 프로젝트 지식 (설계, 분석, 결정)
  ├── .ai/patterns/    ← 재사용 패턴 (AI 제안 + 사용자 승인)
  └── ~/obsidian-note/ ← 개인 학습 (TIL, 개념, 트러블슈팅)
```

## 워크플로우

```
세션 시작       →  (자동 hook)  →  current.md 내용 주입
     ↓
세션 진행       →  /note        →  지식을 영속 저장소에 저장
     ↓
세션 종료       →  /save        →  current.md 업데이트
                   (자동 hook)  →  타임스탬프 갱신
     ↓
(hook 미작동)   →  /resume      →  current.md 수동 로드
     ↓
작업 완료       →  사용자가 current.md 삭제
```

## 파일 구조

```
session-manager/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── save.md            ← /save 커맨드
│   ├── resume.md          ← /resume 커맨드
│   └── note.md            ← /note 커맨드
├── skills/
│   └── note.md            ← note 스킬 (자연어 트리거)
├── hooks/
│   └── hooks.json         ← SessionStart + SessionEnd hook 등록
├── scripts/
│   ├── session-start.mjs  ← 시작 hook 스크립트
│   └── session-end.mjs    ← 종료 hook 스크립트
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

### v1 → v2 변경 이유

**v1 문제점:**
- 세션에서 나온 지식(학습, 분석, 패턴)이 세션 종료 후 유실
- 어디에 뭘 저장할지 기준 부재 (.ai/notes vs obsidian vs patterns)
- 세션 종료 시 수동 /save 필수 (잊으면 유실)

**v2 추가 기능:**
- `/note` 커맨드 + `note` 스킬: 세션 지식을 AI 자동 판단으로 적절한 영속 저장소에 저장
- SessionEnd Hook: 세션 종료 시 current.md 타임스탬프 자동 갱신
- 저장 체계 명시: 내용 성격별 저장 위치 규칙
