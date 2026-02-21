# 플러그인 정리 + 문서 최신화

## 목표
불필요 플러그인/커맨드 제거, 문서(CLAUDE.md, README.md) 현행화

## 진행
- [x] 플러그인 현황 분석 (fe-workflow, session-manager, learning)
- [x] learning 플러그인 삭제 (session-manager v2가 대체)
- [x] docs/plans/ 삭제 (v2 설계/계획 문서, 구현 완료)
- [x] marketplace.json session-manager 버전 2.0.0 → 0.2.0
- [x] CLAUDE.md 전면 재작성 (/init 프리픽스, 구조 간결화)
- [x] README.md 최신화 (learning/session-wrap 제거, 커맨드 반영)
- [x] fe-workflow `_pr.md`, `pr.md` 삭제
- [x] CLAUDE.md mini-review 참조 제거
- [x] `.ai/.templates/` 삭제 (인라인 포맷으로 충분)
- [x] `/save` 커맨드 개선 — 스펙 파일 인자 지원, 아무 때나 호출 가능

## 작업 내역
- `learning/`, `docs/`, `.ai/.templates/` 삭제
- `fe-workflow/commands/_pr.md`, `pr.md` 삭제
- `.claude-plugin/marketplace.json`, `session-manager/.claude-plugin/plugin.json` 버전 0.2.0
- CLAUDE.md: /init 프리픽스, 플러그인 테이블, 세션 연속성 간결화
- README.md: learning/session-wrap/pr 참조 제거
- `/save` 커맨드: argument-hint 추가, $ARGUMENTS 처리, "아무 때나 호출 가능"

## 결정사항
- learning 삭제 (이유: session-manager v2가 완전 대체)
- session-wrap 참조 제거 (이유: 사용 안 함)
- pr 커맨드 제거 (이유: 개인 개발에 불필요)
- session-manager 버전 0.2.0 (이유: 1.0 미만 개발 단계)
- 템플릿 파일 삭제 (이유: /save 인라인 포맷으로 충분, 별도 파일은 참조 안 됨)

## 다음 작업
- [ ] fe-workflow + session-manager 실사용 방향성 정의 — 실제 개발할 때 어떻게 쓸지 워크플로우 구체화

## 메모
- 글로벌 CLAUDE.md에 워크플로우/응답스타일 섹션에 `(deprecated?)` 표시됨 — 추후 정리 필요

<!-- last-active: 2026-02-21 16:23 -->
