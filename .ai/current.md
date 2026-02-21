# session-manager v1 리빌드

## 목표
기존 session-manager(STATUS.md) + learning(context/latest.md) 통합 → current.md 기반 단일 플러그인으로 리빌드

## 진행
- [x] 설계 확정 (plan mode)
- [x] dashboard.md, note.md 삭제
- [x] plugin.json 업데이트 (v1.0.0, description 갱신)
- [x] session-start.mjs 재작성 (current.md 기반)
- [x] save.md 재작성 (current.md 생성/업데이트/삭제)
- [x] resume.md 생성 (수동 복원 커맨드)
- [x] hooks.json 확인 (변경 불필요)
- [x] README.md 재작성 + 설계 히스토리
- [x] 검증 (hook 동작 — current.md 유/무)
- [x] learning 플러그인 — 유지 결정
- [x] CLAUDE.md 세션 연속성 섹션 점검 (/save, /resume 추가)
- [x] marketplace.json 업데이트
- [ ] 커밋

## 결정사항
- STATUS.md → current.md로 단일화 (이유: 여러 파일 분산 관리 복잡, 하나로 충분)
- 세션 ID/습관 점수/대시보드 제거 (이유: 실제 사용 빈도 낮음)
- /note는 v2로 이관 (이유: v1 범위는 context 저장/로드만)
- current.md 없으면 hook이 아무것도 주입 안 함 (이유: 불필요한 메시지 제거)
- learning 플러그인 유지 (이유: 별도 용도로 남겨둠)

## 다음 할 일
커밋
