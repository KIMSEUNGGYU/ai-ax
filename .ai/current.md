# session-manager v2 구현

## 목표
세션 지식 유실 방지 + 저장 체계 확립 — /note, SessionEnd Hook, 저장 체계 추가

## 진행
- [x] v1 리빌드 (커밋 69bbb77)
- [x] v1 포맷 개선 — 템플릿 구조 확정
- [x] learning 플러그인 분석
- [x] v2 범위 확정 논의
- [x] v2 설계 (brainstorming)
- [x] v2 구현 계획 (writing-plans)
- [x] v2 구현 (커밋 802be32)
- [x] GUIDE.md 작성
- [x] 실제 세션에서 테스트 (/note, SessionEnd Hook 동작 확인)

## 작업 내역
- v2 설계: brainstorming → 저장 체계 + /note + SessionEnd Hook 확정
- v2 구현: session-end.mjs, commands/note.md, skills/note.md, hooks.json, plugin.json v2.0.0
- session-start.mjs: /save 리마인더 추가
- README.md: v2 컴포넌트 반영
- CLAUDE.md: /note, 저장 체계, SessionEnd 동기화
- GUIDE.md: 사용자 가이드 문서 작성
- 설계/계획 문서: docs/plans/2026-02-21-session-manager-v2-{design,plan}.md

## 결정사항
- /note에 패턴 통합 → 별도 /promote 불필요 (이유: AI 자동 판단으로 충분)
- 패턴은 AI 제안 + 사용자 승인 (이유: 자동 감지는 노이즈, 수동만은 누락 위험)
- SessionEnd는 current.md 타임스탬프만 (이유: fire-and-forget이라 Claude 턴 없음)
- note 스킬 추가 (이유: "정리해줘" 자연어 트리거 편의성)
- 병렬 작업은 current → current-{task}.md 이름 변경으로 수동 대응 (이유: YAGNI, 가끔 발생)

## 메모
- SessionEnd Hook은 fire-and-forget — 지능적 업데이트 불가, 타임스탬프 수준만 가능
- 실제 테스트 필요: /note 저장 위치 판단, SessionEnd 타임스탬프 갱신
