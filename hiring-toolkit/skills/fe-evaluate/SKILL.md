---
name: fe-evaluate
description: FE 채용 과제를 6가지 Phase로 체계적 평가 (구조, 변경용이성, 추상화, 가독성, 타입). React/TypeScript 과제 평가, 코드 품질 채점, 경력별 기준 적용 시 사용.
allowed-tools: Read, Glob, Grep, Bash
---

# FE Assignment Grading

FE 채용 과제를 6가지 Phase로 체계적 평가합니다.

## ⚠️ IMPORTANT: 경력 레벨별 평가 (엄격 모드)

**평가 시작 전 반드시 물어보세요:**

"이 과제를 제출한 분의 경력이 어떻게 되시나요?"
- 1-2년차 (Junior) → 미드 레벨 기준 적용
- 3-4년차 (Mid-level) → 시니어 기준 적용
- 5-6년차 (Senior) → Staff+ 기준 적용
- 7년차 이상 (Staff+) → Principal 수준 기준 적용

**경력별 기준 파일 읽기:**
- Junior: `skills/fe-evaluate/grading-criteria-junior.md`
- Mid-level: `skills/fe-evaluate/grading-criteria-mid.md`
- Senior: `skills/fe-evaluate/grading-criteria-senior.md`
- Staff+: `skills/fe-evaluate/grading-criteria-staff.md`

## 🎯 평가 철학 (7가지 원칙)

| 원칙 | 설명 | 기준 |
|------|------|------|
| **[GOAL]** | 변경 용이성 | 한 종류 변경 = 한 파일 |
| **[SSOT]** | 단일 진실 | 정의는 1곳에만 |
| **[SRP]** | 단일 책임 | 변경 이유는 하나 |
| **[COUP]** | 응집↑ 결합↓ | 함께 바뀌는 것끼리 가까이 |
| **[DECL]** | 선언적 | What 선언, How는 하위로 |
| **[READ]** | 가독성 | 의도가 드러나는 이름 |
| **[COG7]** | 인지 부하 | 함수≤30줄, 파라미터≤3, 분기≤3 |

## ❌ 안티패턴 (즉시 감점)

- ❌ any 사용 (CRITICAL - 즉시 실격 수준)
- ❌ 타입 단언 남용
- ❌ 불필요한 커스텀 훅 (로직 숨기기)
- ❌ 불필요한 Context (Props로 충분한 경우)
- ❌ 순환 참조
- ❌ DRY 위반 (3+ 중복)

## 🚀 Evaluation Workflow

### Step 1: 경력 레벨 확인
사용자에게 경력 물어보고 적절한 criteria 파일 읽기

### Step 2: assignment.md 확인
```bash
cat .ref/assignment.md  # 또는 사용자 제공 요구사항 문서
```
- 파일 있으면 Phase 0 실행 (요구사항 완성도)
- 파일 없으면 Phase 0 스킵

### Step 3: 자동화 스크립트 실행 (선택)
```bash
# Phase 1: 순환 참조 탐지
node skills/fe-evaluate/scripts/detect-circular-deps.js <과제경로>

# Phase 4: 복잡도 분석
node skills/fe-evaluate/scripts/analyze-complexity.js <과제경로>

# Phase 5: any 사용 탐지
node skills/fe-evaluate/scripts/detect-any-usage.js <과제경로>
```

### Step 4: Phase 0-5 SubAgent 평가

**Phase 0: Requirements Checker (Optional)**
- 요구사항 완성도 평가
- Critical 미충족 시 즉시 불합격
- 명세: `agents/requirements-checker.md`

**Phase 1: Structure Analyzer**
- [COUP] 응집도
- Page First 구조
- 순환 참조 탐지
- 명세: `agents/structure-analyzer.md`

**Phase 2: Changeability Checker**
- [GOAL] 변경 용이성
- 시나리오 시뮬레이션 (새 페이지/필드/API 변경)
- 명세: `agents/changeability-checker.md`

**Phase 3: Abstraction Validator**
- ACC 추상화 체크리스트
- 불필요한 Hook/Context 탐지
- 명세: `agents/abstraction-validator.md`

**Phase 4: Readability Checker**
- [READ] 네이밍
- [DECL] 선언적 코드
- [COG7] 인지 부하 제한
- 명세: `agents/readability-checker.md`

**Phase 5: Type Analyzer**
- any 사용 (0회 필수)
- 타입 단언 최소화
- [SSOT] 타입 중복 없음
- 명세: `agents/type-analyzer.md`

### Step 5: 최종 리포트
- Phase 0-5 점수 종합
- 경력 레벨 기준 적용
- 채용 추천 여부 결정

## 📝 Scoring

각 Phase: 0-100점 (Phase 1-5 각 20점으로 환산)

**철학 위반 시 감점:**
- any 사용: -50점 (즉시 실격 수준)
- 타입 단언 남용: -30점
- 불필요한 Hook/Context: -20점

### 합격 기준

1. Phase 0 Critical **100% 충족** (필수)
2. 코드 품질 점수가 **경력별 합격선 이상**

| 경력 | 합격선 |
|-----|--------|
| Junior | 50% |
| Mid | 60% |
| Senior | 70% |
| Staff+ | 80% |

## 📚 참고 문서

**AI용:**
- [agents/README.md](../../agents/README.md) - SubAgent 아키텍처 + 실행 방법
- [grading-criteria-*.md](.) - 경력별 상세 기준

**사람용 (.docs/):**
- [QUICK-START.md](../../.docs/QUICK-START.md) - 빠른 시작 가이드
- [evaluation-framework.md](../../.docs/evaluation-framework.md) - 평가 프레임워크 상세
- [TOOLS.md](../../.docs/TOOLS.md) - 자동화 스크립트 상세
