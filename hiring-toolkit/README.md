# FE Assignment Grading Toolkit

FE 채용 과제를 6가지 Phase로 체계적 평가하는 Claude 플러그인

## 사용법

```
/fe-evaluate @과제경로
```

## 구조

```
hiring-toolkit/
├── .ref/                         # AI용 참조 (과제 요구사항)
│   └── assignment.md
│
├── .docs/                        # 사람용 문서
│   ├── QUICK-START.md            # 빠른 시작 가이드
│   ├── TOOLS.md                  # 자동화 스크립트 상세
│   └── evaluation-framework.md   # 평가 프레임워크 상세
│
├── agents/                       # AI용 에이전트 (6개)
│   ├── README.md                 # SubAgent 실행 방법
│   ├── requirements-checker.md   # Phase 0
│   ├── structure-analyzer.md     # Phase 1
│   ├── changeability-checker.md  # Phase 2
│   ├── abstraction-validator.md  # Phase 3
│   ├── readability-checker.md    # Phase 4
│   └── type-analyzer.md          # Phase 5
│
└── skills/fe-evaluate/           # AI용 스킬
    ├── SKILL.md                  # 메인 스킬 정의
    ├── grading-criteria-*.md     # 경력별 평가 기준 (4개)
    └── scripts/                  # 자동화 스크립트
        ├── detect-circular-deps.js
        ├── detect-any-usage.js
        └── analyze-complexity.js
```

### 폴더 역할

| 폴더 | 용도 | 읽는 주체 |
|------|------|----------|
| `.ref/` | 과제 요구사항 | AI |
| `.docs/` | 가이드/문서 | 사람 |
| `agents/` | 에이전트 명세 | AI |
| `skills/` | 스킬 + 기준 | AI |

## 평가 철학 (7가지 원칙)

| 원칙 | 설명 | 기준 |
|------|------|------|
| **[GOAL]** | 변경 용이성 | 한 종류 변경 = 한 파일 |
| **[SSOT]** | 단일 진실 | 정의는 1곳에만 |
| **[SRP]** | 단일 책임 | 변경 이유는 하나 |
| **[COUP]** | 응집↑ 결합↓ | 함께 바뀌는 것끼리 가까이 |
| **[DECL]** | 선언적 | What 선언, How는 하위로 |
| **[READ]** | 가독성 | 의도가 드러나는 이름 |
| **[COG7]** | 인지 부하 | 함수≤30줄, 파라미터≤3, 분기≤3 |

## 평가 Phase

| Phase | 에이전트 | 평가 항목 |
|-------|----------|----------|
| 0 | requirements-checker | 요구사항 완성도 |
| 1 | structure-analyzer | 폴더 구조, [COUP] |
| 2 | changeability-checker | [GOAL] 변경 용이성 |
| 3 | abstraction-validator | ACC 추상화 |
| 4 | readability-checker | [READ], [DECL], [COG7] |
| 5 | type-analyzer | TypeScript, [SSOT] |

## 점수 체계

### 요구사항 (Phase 0)
- **Critical 미충족**: 불합격
- **High 미충족**: -15점/항목
- **Medium 미충족**: -10점/항목

### 코드 품질 (Phase 1-5)
- 각 Phase 20점씩 (총 100점)
- 경력별 합격선 적용

## 경력별 합격선

| 입력 경력 | 적용 기준 | 합격선 |
|----------|----------|--------|
| Junior (1-2년) | Mid 기준 | 50% |
| Mid (3-4년) | Senior 기준 | 60% |
| Senior (5-6년) | Staff+ 기준 | 70% |
| Staff+ (7년+) | Principal 기준 | 80% |

## 과제 평가 시

1. `.ref/assignment.md` 수정 (과제별 요구사항 작성)
2. `/fe-evaluate` 실행
3. 경력 입력 후 평가 결과 확인
