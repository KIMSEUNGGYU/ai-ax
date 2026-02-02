# Evaluation Framework

## Purpose

6-phase 평가를 통한 FE 채용 과제 체계적 평가

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Main Skill: fe-evaluate                                  │
│ 1. Confirm experience level (Junior/Mid/Senior/Staff+)  │
│ 2. Execute 6 SubAgents                                  │
│ 3. Collect phase reports                                │
│ 4. Apply experience-level criteria                      │
│ 5. Generate final comprehensive report                  │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    6 SubAgents           │         Experience Criteria
    (Detailed eval)       │         (Pass/Fail standards)
          │               │               │
          ▼               ▼               ▼
    agents/           Scripts/        grading-criteria-
    *-checker.md      Tools           {level}.md
```

## Evaluation Process

### Step 1: Run Analysis Scripts (Optional)

```bash
# Phase 1: 순환 참조 탐지
node skills/fe-evaluate/scripts/detect-circular-deps.js <과제경로>

# Phase 4: 복잡도 분석
node skills/fe-evaluate/scripts/analyze-complexity.js <과제경로>

# Phase 5: any 사용 탐지
node skills/fe-evaluate/scripts/detect-any-usage.js <과제경로>
```

### Step 2: Execute SubAgent Evaluations

| Phase | SubAgent | Focus | Output |
|-------|----------|-------|--------|
| 0 | requirements-checker | 요구사항 충족 | Critical 충족 여부 |
| 1 | structure-analyzer | [COUP], Page First, 순환참조 | 0-100점 |
| 2 | changeability-checker | [GOAL] 변경 용이성 | 0-100점 |
| 3 | abstraction-validator | ACC 추상화 | 0-100점 |
| 4 | readability-checker | [READ], [DECL], [COG7] | 0-100점 |
| 5 | type-analyzer | any, 타입단언, [SSOT] | 0-100점 |

Each SubAgent provides:
- Numerical score (0-100)
- Detailed findings with file:line references
- Prioritized recommendations

### Step 3: Collect Results

```
Total Score = (Phase1 + Phase2 + Phase3 + Phase4 + Phase5) / 5
각 Phase는 20점으로 환산
```

### Step 4: Apply Experience-Level Criteria

| 경력 | 기준 파일 | 합격선 |
|-----|----------|--------|
| Junior | grading-criteria-junior.md | 50% |
| Mid | grading-criteria-mid.md | 60% |
| Senior | grading-criteria-senior.md | 70% |
| Staff+ | grading-criteria-staff.md | 80% |

### Step 5: Generate Final Report

```markdown
# FE 과제 평가 결과

## 지원자 정보
- 경력: X년차
- 적용 기준: [Level]

## 요구사항 (Phase 0)
- Critical: 충족/미충족
- 감점: -XX점

## 코드 품질 (Phase 1-5)
| Phase | 점수 | 주요 이슈 |
|-------|------|----------|
| 1. 구조 | /20 | |
| 2. 변경용이성 | /20 | |
| 3. 추상화 | /20 | |
| 4. 가독성 | /20 | |
| 5. 타입 | /20 | |
| 합계 | /100 | |

## 최종 결과
- 점수: XX/100
- 합격선: XX%
- 결과: 합격/불합격

## 개선 제안
1. ...
2. ...
```

## SubAgent Reference

All SubAgents are located in `agents/`:

| 파일 | Phase | 역할 |
|------|-------|------|
| requirements-checker.md | 0 | 요구사항 검증 |
| structure-analyzer.md | 1 | 구조 분석 |
| changeability-checker.md | 2 | 변경 용이성 |
| abstraction-validator.md | 3 | 추상화 검증 |
| readability-checker.md | 4 | 가독성 검증 |
| type-analyzer.md | 5 | 타입 분석 |

## Tools Reference

| 스크립트 | 용도 | Phase |
|---------|------|-------|
| detect-circular-deps.js | 순환 참조 탐지 | 1 |
| analyze-complexity.js | 복잡도 분석 | 4 |
| detect-any-usage.js | any 사용 탐지 | 5 |

## Design Principles

1. **Separation of Concerns**
   - Scripts: 메트릭 수집
   - SubAgents: 컨텍스트 기반 판단

2. **사용자 철학 반영**
   - [GOAL], [SSOT], [COUP], [READ], [COG7]

3. **Single Source of Truth**
   - 각 SubAgent가 해당 Phase 평가 기준 소유

4. **독립 실행**
   - 모든 Phase는 독립적
   - 병렬 실행 가능

---

**Framework Version:** 1.0
**Total SubAgents:** 6
**Total Scripts:** 3
