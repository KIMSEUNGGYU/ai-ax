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
- [x] fe-workflow `_pr.md` 삭제 (회사용, 개인 불필요)
- [x] fe-workflow `pr.md` 삭제
- [x] CLAUDE.md mini-review 참조 제거
- [x] 글로벌 CLAUDE.md 워크플로우/응답스타일 deprecated 표시 확인

## 작업 내역
- `learning/` 디렉토리 전체 삭제
- `docs/` 디렉토리 전체 삭제
- `fe-workflow/commands/_pr.md`, `pr.md` 삭제
- `.claude-plugin/marketplace.json` session-manager 버전 0.2.0
- `session-manager/.claude-plugin/plugin.json` 버전 0.2.0
- CLAUDE.md: /init 표준 프리픽스 추가, 플러그인 테이블+컴포넌트 구조 추가, 세션 연속성 간결화
- README.md: learning/session-wrap/pr 참조 제거, 워크플로우 다이어그램 정리

## 결정사항
- learning 삭제 (이유: session-manager v2가 세션 관리+지식 저장 기능 완전 대체)
- session-wrap 참조 제거 (이유: 사용 안 함)
- pr 커맨드 제거 (이유: 개인 개발에 불필요)
- session-manager 버전 0.2.0으로 관리 (이유: 1.0 미만 개발 단계 표현)

## 다음 작업
- [ ] fe-workflow 개선 — conventions 다듬기, 설계 산출물 저장 체계, 구조 리뷰

## 메모
- 글로벌 CLAUDE.md에 워크플로우/응답스타일 섹션에 `(deprecated?)` 표시됨 — 추후 정리 필요
