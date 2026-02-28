# ai-ax Context

## 프로젝트 개요
Claude Code 플러그인 관리 레포 — 설정/플러그인/학습 문서 관리 공간

## 서비스 맵
| 플러그인 | 역할 | 버전 |
|----------|------|------|
| fe-workflow | FE 컨벤션 기반 설계→리뷰 | - |
| session-manager | 세션 context 관리 + 지식 영속 저장 | v0.4.0 |

## 현재 진행 중
- [isc-sync 플러그인 구현](active/isc-sync.md) — Slack/Calendar 데이터 수집 플러그인, 테스트 단계
- [Context Engineering 설계](active/context-engineering-설계.md) — .ai/ 폴더 구조 + 워크플로우 설계, 실사용 검증 단계

## 핵심 결정
- ECC 철학 (MD 기반 규칙, 명시적 워크플로우)
- OMC 구조 차용 (Skill/Command/Agent/Hook 4컴포넌트)
- `.ai/`는 프로젝트 루트에 단일 관리
- `.gyu/` = 사용자 소유, `.ai/` = Claude 소유
