# isc-sync 플러그인 구현

## 목표
Slack, Calendar 등 흩어진 활동 데이터를 자동 수집·정리하는 Claude Code 플러그인 구축

## 스펙 참조
`.ai/specs/daily-sync-plugin.md` — 전체 아키텍처, DFS 플랜, 확정 사항

## 진행

### 설계 (완료)
- [x] Slack API 테스트 — `from:me` 검색, 컨텍스트 소비 이슈 확인
- [x] 플러그인 컨셉 확립 — 개인용(daily/weekly) + 회사용(company-weekly)
- [x] 미결정 사항 확정 — 이름, 폴더, subagent, 시간범위, 스크럼 연동
- [x] 전체 아키텍처 ASCII 다이어그램 작성
- [x] DFS 구현 플랜 + 마일스톤 작성
- [x] 스펙 문서 최종 업데이트

### P0: Foundation (완료)
- [x] `~/isc-sync/` 결과 저장 폴더 생성
- [x] `ai-ax/isc-sync/` 플러그인 scaffold 생성 (`/plugin-dev:create-plugin`)
- [x] plugin.json v0.1.0 생성
- [x] 디렉토리 구조 (commands/, agents/, skills/)

### P1: 컴포넌트 구현 (완료)
- [x] `slack-collector` agent — sonnet, 스크럼 스레드 + from:me concise 검색
- [x] `calendar-collector` agent — haiku, gcal_list_events
- [x] `daily.md` command — 오케스트레이터, 병렬 실행
- [x] `weekly.md` command — 주간 오케스트레이터
- [x] `recap-format` skill — 출력 포맷 가이드
- [x] plugin-validator 검증 통과 (Critical 0, color 필드 추가)

### 테스트 (다음)
- [ ] `/isc:daily` 실제 실행 테스트
- [ ] `/isc:weekly` 실제 실행 테스트
- [ ] 컨텍스트 소비량 벤치마크

### 향후
- [ ] P3: `/isc:company-weekly` — Notion + Slack 팀장 채널 (소스 정보 미확인)
- [ ] P4: Extensions — Linear, Gmail, Monthly
- [ ] 실습 자료 정리 (완성 후 마지막 단계)

## 작업 내역
- (이전) Slack MCP 테스트, 스펙 문서 작성, 아키텍처 설계
- `~/isc-sync/` 결과 저장 폴더 생성
- `/plugin-dev:create-plugin`으로 scaffold 생성 (Phase 1~6 완료)
- `isc-sync/.claude-plugin/plugin.json` — v0.1.0
- `isc-sync/agents/slack-collector.md` — sonnet, cyan, 스크럼(C08R5DWBGQM) + from:me 검색
- `isc-sync/agents/calendar-collector.md` — haiku, green, gcal_list_events
- `isc-sync/commands/daily.md` — 어제+오늘, 2개 agent 병렬 실행
- `isc-sync/commands/weekly.md` — 지난 주, 일자별 하이라이트
- `isc-sync/skills/recap-format/SKILL.md` — daily/weekly 포맷 가이드
- plugin-validator 검증: Critical 0, agent color 필드 추가

## 결정사항
- 플러그인 이름: `isc-sync` — 회사 약칭 + sync
- 플러그인 코드: `ai-ax/isc-sync/` — 다른 플러그인과 동일 레벨
- 결과 저장: `~/isc-sync/` — 독립 프로젝트 폴더
- company-weekly 제외 — 소스 정보 미확인, P3로 보류
- Agent 모델: slack=sonnet(요약 품질), calendar=haiku(단순 리스트)
- 스크럼 채널: `C08R5DWBGQM` — `오늘의 스크럼` 키워드로 스레드 검색
- 실습 자료 정리: 플러그인 완성 후 마지막 단계로 진행

## 메모
- 회사용 소스 미확인: Notion 주간 페이지 구조, Slack 팀장 주간 정리 채널명
- 컨텍스트 비용: Slack detailed 모드 절대 금지. concise + 날짜 범위 좁히기 필수

## 관련 작업
- [Context Engineering 시스템 설계](context-engineering-설계.md) — 플러그인 구현 완료, 실사용 테스트 남음

<!-- last-active: 2026-03-03 22:50 -->
