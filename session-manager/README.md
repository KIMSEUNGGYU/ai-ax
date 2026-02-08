# session-manager

세션 관리 플러그인 — 활동 로깅, 코딩 습관 분석, 상태 저장.

## 설치

```bash
# 개발 중 (임시)
claude --plugin-dir /path/to/session-manager

# 정식 적용
/plugin marketplace add /path/to/ai-ax
/plugin install session-manager@claude-plugins
```

## 커맨드

| 커맨드 | 역할 |
|--------|------|
| `/wrap` | 세션 마무리 — 상태 저장 + 활동 로그 + 습관 점수 |
| `/dashboard` | 습관 대시보드 — 점수 추이, 강점/약점, 개선 포인트 |
| `/note` | 개발 중 패턴/개념 정리 → `.ai/notes/`에 md 저장 |

## 워크플로우

```
세션 종료          →  /wrap         →  STATUS.md + 로그 + 점수
       ↓
다음 세션 시작     →  (자동)        →  STATUS.md 로드 + 세션 ID 생성
       ↓
습관 확인          →  /dashboard    →  점수 추이 + 개선 포인트
```

## /wrap 3 Phase

1. **상태 저장**: `.ai/STATUS.md` 덮어쓰기 + `.ai/DECISIONS.md` 누적
2. **세션 로그**: `.ai/logs/sessions/{YYYY-MM-DD}_{id}.md` 생성
3. **습관 점수**: `.ai/logs/habit-score.md`에 행 추가

## AI 협업 점수 (/10)

| 항목 | 배점 |
|------|------|
| 설계 후 구현 (/architecture → 구현) | 2 |
| 리뷰 실행 (/review) | 2 |
| 피드백 반영 후 재리뷰 | 2 |
| plan 모드 활용 | 1 |
| 커밋 단위 (기능별 분리) | 2 |
| 문서화 | 1 |

## 저장 구조

```
.ai/
├── STATUS.md              ← 현재 작업 상태 (덮어쓰기)
├── DECISIONS.md           ← 결정 기록 (누적)
└── logs/
    ├── habit-score.md     ← 습관 점수 누적 테이블
    └── sessions/
        └── {YYYY-MM-DD}_{id}.md  ← 세션별 활동 로그
```

## Hook

- **SessionStart**: 세션 시작 시 `.ai/STATUS.md` 자동 로드 + 세션 ID 생성

## 구조

```
session-manager/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── wrap.md
│   ├── dashboard.md
│   └── note.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── session-start.mjs
└── README.md
```
