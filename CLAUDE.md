# ai-ax

나의 Claude Code 설정/플러그인을 관리하는 레포.
현재 학습 + 플러그인 구축 병행 중. 최종 목표는 마켓플레이스 배포.

## 레포 성격

- **코드 프로젝트가 아님** — 설정/플러그인/학습 문서 관리 공간
- 학습 완료 후에는 ax 마켓플레이스 (플러그인 모음)만 남을 예정
- 기존 `~/.claude/commands/`, `~/.claude/skills/`는 레거시 → 개편 예정

## 프로젝트 구조

```
ai-ax/
├── .gyu/                          ← 사용자 소유 (수정 시 확인 필수)
│   ├── plugin-design-study/       ← CC 플러그인 학습 (OMC/ECC 분석)
│   ├── plugin-design/             ← fe-workflow 설계 마스터
│   │   ├── conventions/           ← FE 컨벤션 (Skill 소스)
│   │   └── plugin-design.md       ← 설계 문서 (진행 상태 포함)
│   └── everything-cc/             ← ECC 구조 분석
│
├── .ai/                           ← Claude 소유 (자유롭게 업데이트)
│   ├── STATUS.md                  ← 현재 작업 상태 (덮어쓰기)
│   └── DECISIONS.md               ← 결정 기록 (누적)
│
├── fe-toolkit/                    ← FE 플러그인 (개편 예정)
├── .claude-plugin/marketplace.json ← 마켓플레이스 설정
└── CLAUDE.md                      ← 이 파일
```

## 작업 트랙

| 트랙 | 마스터 문서 | 상태 |
|------|-------------|------|
| 학습 | `.gyu/plugin-design-study/README.md` | Level 1~3 완료, Level 4 대기 |
| 빌드 | `.gyu/plugin-design/plugin-design.md` | Step 1 진행 중 |

## 세션 시작 시

1. `.ai/STATUS.md` 읽기 → 현재 작업 상태 파악
2. 이전 작업 이어갈지 사용자에게 확인

## 세션 종료 시

`.ai/STATUS.md` + `.ai/DECISIONS.md` 업데이트

## 설계 철학

- **ECC 철학** (MD 기반 규칙, 명시적 워크플로우, 품질 우선)
- **OMC 구조 차용** (Skill/Command/Agent/Hook 4컴포넌트)
- FE 전문 소수 에이전트 (5~8개), 범용 불필요
- 상세: `.gyu/plugin-design-study/README.md` 하단 ECC vs OMC 분석
