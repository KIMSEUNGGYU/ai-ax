# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 레포 성격

Claude Code 플러그인을 관리하는 레포. 코드 프로젝트가 아닌 설정/플러그인/학습 문서 관리 공간.

## 플러그인

| 플러그인 | 버전 | 역할 | 컴포넌트 |
|----------|------|------|----------|
| fe-workflow | 0.4.0 | FE 컨벤션 기반 설계→리뷰→PR | Command x2, Agent x2, Skill x1, Convention x4 |
| session-manager | 0.2.0 | 세션 context 관리 + 지식 영속 저장 | Command x3, Skill x1, Hook x2 |

각 플러그인은 `{name}/.claude-plugin/plugin.json`으로 정의, `.claude-plugin/marketplace.json`에 등록.

## 플러그인 컴포넌트 구조

```
{plugin-name}/
├── .claude-plugin/plugin.json    ← 이름, 버전, 설명
├── commands/                     ← /커맨드 (MD 파일)
├── skills/                       ← 자연어 트리거 스킬 (MD 파일)
├── agents/                       ← 서브에이전트 정의
├── hooks/                        ← hooks.json (SessionStart/End 등)
├── scripts/                      ← Hook 실행 스크립트 (.mjs)
├── conventions/                  ← 자동 로드 규칙 (MD 파일)
└── README.md
```

## 디렉토리 소유권

- `.gyu/` = **사용자 소유** — 수정 시 반드시 확인. 플러그인 설계 학습/분석 자료
- `.ai/` = **Claude 소유** — 자유롭게 업데이트. 세션 상태/노트/패턴/로그

## 세션 연속성

### 작업 추적: .ai/current.md
- 활성 작업 1개를 추적. 멀티 세션 작업이면 생성, 단순 작업이면 불필요
- current.md 삭제는 사용자만 수행 (Claude 임의 삭제 금지)

### 세션 흐름
- **시작**: SessionStart Hook이 `.ai/current.md` 자동 로드 → 이어갈지 확인
- **저장**: `/save` → current.md 생성/업데이트 (아무 때나 호출 가능)
- **지식 저장**: `/note` → AI가 저장 위치 판단 → 사용자 확인
- **재개**: `/resume` → current.md 수동 로드 (hook 미작동 시)
- **종료**: SessionEnd Hook이 current.md 타임스탬프 갱신

### 지식 저장 위치
| 내용 | 위치 |
|------|------|
| 프로젝트 설계/분석/결정 | `.ai/notes/` |
| 재사용 코드 패턴 | `.ai/patterns/` |
| 개인 학습 (TIL, 트러블슈팅) | `~/obsidian-note/00_Inbox/` |

## 설계 철학

- **ECC 철학** (MD 기반 규칙, 명시적 워크플로우)
- **OMC 구조** 차용 (Skill/Command/Agent/Hook 4컴포넌트)
- 학습 자료: `.gyu/plugin-design-study/README.md`
