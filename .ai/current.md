# 플러그인 정리 + 문서 최신화

## 목표
불필요 플러그인/커맨드 제거, 문서 현행화, 실사용 방향성 정의

## 진행
- [x] 플러그인 현황 분석 + learning 삭제
- [x] fe-workflow _pr.md, pr.md 삭제
- [x] CLAUDE.md, README.md 전면 정리
- [x] /save 커맨드 개선 (argument-hint, 아무 때나 호출)
- [x] 버전 관리 단일화 (marketplace, CLAUDE.md, README.md에서 버전 제거)
- [x] 잔재 파일 정리 (.ai/plans/, fe-workflow README pr 참조)
- [x] 실사용 워크플로우 정의

## 결정사항
- learning 삭제 (이유: session-manager v2가 완전 대체)
- pr 커맨드 제거 (이유: 개인 개발에 불필요)
- 버전은 plugin.json에서만 관리 (이유: 이중 관리 불필요)
- session-manager 이름 유지 (이유: Claude Code SessionStart/End Hook 용어와 일치)
- /save는 current.md만 업데이트 (이유: README/CLAUDE.md는 의도적 수동 수정)
- 실사용 워크플로우: 단순수정 → 바로구현 / 새기능 → /architecture→구현→/review / 복잡 → /save 추가

## 다음 작업
- [ ] 글로벌 CLAUDE.md deprecated 섹션 정리
- [ ] 회사 프로젝트 실사용 후 fe-workflow conventions 업데이트
