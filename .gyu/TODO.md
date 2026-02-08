## fe-workflow TODO
> 미룬 것들 + v0.4 계획

### v0.4 — 구조 개선

- [ ] 세션 관리 커맨드 분리 (recap.md, organization.md → 별도 플러그인)
  - FE 전용이 아닌 범용 세션 관리 → 독립 플러그인이 적합
  - fe-workflow는 개발 워크플로우(architecture → review → pr)에 집중
- [ ] error-handling.md 톤 정리
- [ ] 로그/상태 관리 구현 (Hook 기반 자동 기록 검토)

### conventions 보완

- [ ] folder-structure.md — 5. 헷갈리기 쉬운 폴더 섹션에 _common api 케이스 추가
- [ ] 컴포넌트설계/페이지 구조 — 제거 또는 개선 결정

### 완료

- [x] marketplace.json에 fe-workflow 등록
- [x] 플러그인 로드 테스트 (5개 커맨드 + skill 정상 로드)
- [x] fe-toolkit 제거 (fe-workflow로 대체)
- [x] v0.1 산출물 정리 (v0.1-build.md, v0.1-diagram.md 삭제)
- [x] v0.3 아키텍처 다이어그램 작성
