# session-manager v2 설계

## 목표
v1(context 저장/로드)에 기능 추가 + Claude가 실제로 규칙을 따르도록 강화

## 진행
- [x] v1 리빌드 (커밋 69bbb77)
- [x] v1 포맷 개선 — 템플릿 구조 확정
- [x] learning 플러그인 분석
- [ ] v2 범위 확정 논의
- [ ] v2 설계 (plan mode)
- [ ] v2 구현

## v1 최종 템플릿 구조

| 섹션 | 역할 | 비고 |
|------|------|------|
| 목표 | 한 줄 요약 | 필수 |
| 스펙 참조 | .ai/specs/ 경로 | 없으면 생략 |
| 진행 | [x] 완료 + [ ] 남은 것 | 필수. [ ]가 곧 다음 할 일 |
| 작업 내역 | 구체적으로 뭘 했는지 | 필수 |
| 결정사항 | 결정 + 이유 | 필수 |
| 메모 | 블로커, 주의사항 | 없으면 생략 |
| (작업 고유 섹션) | 자유 추가 | 복잡한 작업 시 |

## v2 후보 기능
- /doc — 내용 정리 → .ai/notes/ 또는 Obsidian (learning에서 이관)
- doc 스킬 — "정리해줘" 자연어 트리거
- /promote — 패턴 승격 (.ai/patterns/)
- Claude 자율 준수 강화

## learning 플러그인 분석 결과

| 컴포넌트 | v1과 겹침 | v2 이관 가치 |
|----------|-----------|-------------|
| /clear, /resume | 겹침 | 불필요 |
| /doc + doc 스킬 | 안 겹침 | 높음 |
| learning-extractor | 안 겹침 | 낮음 (과설계) |

## 핵심 문제 인식
Claude가 만든 규칙을 Claude 자신이 안 따름
- current.md 임의 삭제, /save 미사용
- 해결: save.md에 삭제 금지 원칙, CLAUDE.md에 명시

## 작업 내역
- v1 리빌드: plugin.json, session-start.mjs, save.md, resume.md, README.md 재작성
- v1 포맷 개선: "작업 내역" 추가, "다음 할 일" 제거(진행과 중복), 삭제 기능 제거, 유연성 안내 추가
- CLAUDE.md 동기화: `/save done` 제거, 삭제 금지 명시
- learning 분석: /doc(6유형 템플릿), /clear(겹침), learning-extractor(과설계)

## 결정사항
- 진행의 [ ] 미완료 = 다음 할 일 → 별도 섹션 불필요 (이유: 중복 제거)
- current.md 삭제는 사용자만 가능 (이유: Claude 임의 삭제 방지)
- 복잡한 작업은 작업 고유 섹션 자유 추가 (이유: 템플릿 경직성 방지)
