# session-manager

세션 상태 관리 + 습관 측정 플러그인.

> 세션 종료 분석/제안은 [session-wrap](https://github.com/team-attention/plugins-for-claude-natives/tree/main/plugins/session-wrap) 플러그인 사용 추천.

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
| `/save` | 세션 상태 저장 — STATUS.md + 활동 로그 + 습관 점수 |
| `/dashboard` | 습관 대시보드 — 점수 추이, 강점/약점, 개선 포인트 |
| `/note` | 개발 중 패턴/개념 정리 → `.ai/notes/`에 md 저장 |

## 워크플로우

```
세션 종료          →  /save         →  STATUS.md + 로그 + 점수
       ↓
다음 세션 시작     →  (자동)        →  STATUS.md 로드 + 세션 ID 생성
       ↓
습관 확인          →  /dashboard    →  점수 추이 + 개선 포인트
```

## /save 3 Phase

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
├── notes/                 ← /note 산출물
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
│   ├── save.md
│   ├── dashboard.md
│   └── note.md
├── hooks/
│   └── hooks.json
├── scripts/
│   └── session-start.mjs
└── README.md
```
