# learning

개인 세션 관리 + 학습 추출 플러그인.

## 커맨드

| 커맨드 | 역할 |
|--------|------|
| `/learning:clear` | 세션 종료 — 컨텍스트 저장 + 패턴 승격 |
| `/learning:resume` | 이전 세션 컨텍스트 복원 |
| `/learning:doc` | 내용 정리 → 프로젝트/Obsidian 저장 |

## 에이전트

| 에이전트 | 역할 |
|----------|------|
| learning-extractor | 세션 학습 내용 TIL 추출 |

## 스킬

| 스킬 | 트리거 |
|------|--------|
| doc | "정리해줘", "기록해둬", "메모해둬" 등 |

## 훅

| 이벤트 | 동작 |
|--------|------|
| SessionStart | `.ai/context/latest.md` + `.ai/patterns/` 자동 로드 |
