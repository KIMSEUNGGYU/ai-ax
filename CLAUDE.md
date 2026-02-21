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
│   ├── current.md                 ← 활성 작업 문서 (0~1개, 작업 완료 시 삭제)
│   ├── patterns/                  ← 프로젝트 구현 패턴 (수동 큐레이션)
│   │   └── README.md              ← 패턴 인덱스
│   ├── templates/                 ← 작업 문서 템플릿 (simple-task, complex-task)
│   ├── notes/                     ← /note 산출물
│   └── logs/                      ← 세션 로그
│
├── fe-workflow/                   ← FE 워크플로우 v0.4 (Skill x1, Command x4, Agent x2, Convention x4)
├── session-manager/               ← 세션 context 관리 v1.0 (Command x2, Hook x1)
├── mini-review/                   ← 학습용 미니 플러그인 (마켓플레이스 미등록)
└── CLAUDE.md                      ← 이 파일
```

## 세션 연속성 (컨벤션 기반)

### 작업 추적: .ai/current.md
- **활성 작업 1개**를 추적하는 파일. 작업 완료 시 삭제
- 멀티 세션 걸릴 작업이면 생성, 단순 작업이면 안 만들어도 됨
- 규모에 따라 스케일: 단순(~20줄) / 복잡(~500줄), 템플릿 참고

### 세션 시작 시
- `.ai/current.md` 존재하면 읽고, 이전 작업 이어갈지 사용자에게 확인

### 세션 중 저장
- `/save` 또는 "현재 상태 저장해" / "current.md 업데이트해" 요청 시 반영
- current.md 삭제는 사용자가 직접 수행 (Claude 임의 삭제 금지)

### 세션 재개 (수동)
- `/resume` → current.md 수동 로드 (hook 미작동 시)

### 세션 종료 시
- `/wrap` → 세션 분석/제안

### 패턴 승격
- 작업 완료 후, 재사용 가치 있는 구현 패턴은 `.ai/patterns/`로 승격
- 사용자 직접 요청 or Claude 세션 마무리 시 제안

### 참고
- 학습 자료: `.gyu/plugin-design-study/README.md`

## 설계 철학

- **ECC 철학** (MD 기반 규칙, 명시적 워크플로우, 품질 우선)
- **OMC 구조 차용** (Skill/Command/Agent/Hook 4컴포넌트)
- FE 전문 소수 에이전트 (5~8개), 범용 불필요
- 상세: `.gyu/plugin-design-study/README.md` 하단 ECC vs OMC 분석
