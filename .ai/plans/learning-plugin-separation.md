# learning 플러그인 분리 — 완료

> dev-workflow(팀)에서 개인화 요소를 분리하여 ai-ax/learning 플러그인으로 이관

## 배경

dev-workflow는 "팀 공통 개발 워크플로우" 성격인데, 세션 관리/학습 추출/문서 정리는 **개인 생산성** 영역.
팀이 아닌 개인이 주로 활용하는 기능이므로 분리.

## 분리 결과

### dev-workflow (팀) — 남은 것

| 컴포넌트 | 역할 |
|----------|------|
| `/dev:pr` | 승인 후 커밋+푸시+PR |
| `/dev:pr-auto` | 완전 자동 PR |
| `ticket` skill | Linear 이슈+브랜치 생성 |
| `git-commit-messages` skill | [ISH-XXXX] 커밋 포맷 |
| `commit-validator` hook | 커밋 메시지 검증 |
| `pr-validator` hook | PR 검증 |
| `.mcp.json` | Linear MCP |

### learning (개인) — 이관된 것

| 컴포넌트 | 역할 | 원래 위치 |
|----------|------|-----------|
| `/learning:clear` | 컨텍스트 저장 + 패턴 승격 | dev /dev:clear |
| `/learning:resume` | 이전 세션 복원 | dev /dev:resume |
| `/learning:doc` | 프로젝트/Obsidian 문서 정리 | dev /dev:doc |
| `doc` skill | "정리해줘" 자연어 트리거 | dev doc/SKILL.md |
| `learning-extractor` agent | TIL 추출 | dev agents/ |
| `session-start.sh` hook | SessionStart 컨텍스트 로드 | dev scripts/ |

## 역할 분담 (최종)

| 기능 | 위치 | 이유 |
|------|------|------|
| PR, 티켓, 커밋 검증 | dev-workflow (팀) | 팀 공통 워크플로우 |
| 컨텍스트 저장/복원 | **learning (개인)** | 개인 세션 관리 |
| 문서 정리 (Obsidian 연동) | **learning (개인)** | 개인 노트 |
| 세션 학습 추출 | **learning (개인)** | 개인 생산성 |
| 세션 종료 분석 | session-wrap (외부) | 범용 세션 정리 |
| FE 컨벤션, 설계, 리뷰 | fe-workflow (개인) | FE 전용 |
| 세션 상태 저장 | session-manager (개인) | 개인 세션 관리 |

## 참고

- dev-workflow 소스: `~/git/claude-plugins-node-main/dev-workflow/`
- learning 소스: `~/gyu/ai-ax/learning/`
- session-wrap: `~/.claude/plugins/local/session-wrap/`
