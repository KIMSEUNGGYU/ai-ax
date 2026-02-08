# ai-ax

나의 Claude Code 설정/플러그인을 관리하는 레포.
현재 학습 + 플러그인 구축 병행 중. 최종 목표는 마켓플레이스 배포.

## 레포 성격

- **코드 프로젝트가 아님** — 설정/플러그인/학습 문서 관리 공간
- 최종 목표: ax 마켓플레이스 (플러그인 모음)

## 프로젝트 구조

```
ai-ax/
├── .claude-plugin/
│   └── marketplace.json           ← 마켓플레이스 등록
├── .gyu/                          ← 사용자 소유 (수정 시 확인 필수)
│   ├── plugin-design-study/       ← CC 플러그인 학습 (OMC/ECC 분석)
│   ├── plugin-design/             ← 다이어그램 + 아카이브
│   └── everything-cc/             ← ECC 구조 분석
│
├── .ai/                           ← Claude 소유 (자유롭게 업데이트)
│   ├── STATUS.md                  ← 상태 + 로드맵 (/save 관리)
│   ├── DECISIONS.md               ← 세션별 결정 누적 (/save 관리)
│   ├── notes/                     ← /note 산출물
│   └── logs/                      ← 세션 로그 + 습관 점수
│
├── fe-workflow/                   ← FE 워크플로우 v0.4 (Skill x1, Command x4, Agent x2, Convention x4)
├── session-manager/               ← 세션 상태 관리 v0.1 (Command x3, Hook x1)
├── mini-review/                   ← 학습용 미니 플러그인 (마켓플레이스 미등록)
└── CLAUDE.md                      ← 이 파일
```

## 작업 상태 관리

- **현재 상태 + 로드맵**: `.ai/STATUS.md` (/save가 자동 관리)
- **결정 기록**: `.ai/DECISIONS.md` (/save가 자동 누적)
- 학습 참고: `.gyu/plugin-design-study/README.md`

## 세션 시작 시

SessionStart hook이 자동으로 STATUS.md를 로드한다.
수동이 필요하면: `.ai/STATUS.md` 읽기 → 이전 작업 이어갈지 확인.

## 세션 종료 시

1. `/wrap` → 세션 분석/제안 (session-wrap 외부 플러그인)
2. `/save` → 상태 저장 + 로그 + 점수 (session-manager)

## 설계 철학

- **ECC 철학** (MD 기반 규칙, 명시적 워크플로우, 품질 우선)
- **OMC 구조 차용** (Skill/Command/Agent/Hook 4컴포넌트)
- FE 전문 소수 에이전트 (5~8개), 범용 불필요
- 상세: `.gyu/plugin-design-study/README.md` 하단 ECC vs OMC 분석
