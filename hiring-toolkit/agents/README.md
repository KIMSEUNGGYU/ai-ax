# FE Assignment Grading SubAgents

6개 Phase로 구성된 SubAgent 기반 평가 시스템입니다.

## SubAgent 목록

### Phase 0: Requirements Checker (Optional)
**파일**: [requirements-checker.md](requirements-checker.md)

**목적**: 과제 명세 대비 구현 완성도

**평가 항목**:
- Critical 요구사항 (미충족 시 즉시 불합격)
- High 요구사항 (-15점/항목)
- Medium 요구사항 (-10점/항목)

**출력**: Critical 충족 여부 + 감점 내역

---

### Phase 1: Structure Analyzer
**파일**: [structure-analyzer.md](structure-analyzer.md)

**목적**: 폴더/파일 구조 평가

**평가 항목**:
- [COUP] 응집도 - 함께 바뀌는 것끼리 가까이
- Page First 구조 - 로컬 → 재사용시 상위로
- 순환 참조 탐지

**도구**:
- `detect-circular-deps.js` 스크립트

**출력**: 0-100점 + 구조 위반 목록

---

### Phase 2: Changeability Checker
**파일**: [changeability-checker.md](changeability-checker.md)

**목적**: [GOAL] 변경 용이성 평가

**시나리오**:
1. 새 페이지 추가 시 → 수정 파일 몇 개?
2. 새 필드 추가 시 → 수정 파일 몇 개?
3. API 변경 시 → 영향 범위?

**평가**:
- 1곳만 수정: 90-100점
- 2-3곳 수정: 70-89점
- 4곳 이상: 50점 이하

**출력**: 0-100점 + 시나리오별 분석

---

### Phase 3: Abstraction Validator
**파일**: [abstraction-validator.md](abstraction-validator.md)

**목적**: ACC 추상화 원칙 검증

**평가 항목**:
1. 고객 언어 사용? (구현 중심 조건문 없음)
2. UI와 1:1 매핑? (숨겨진 UI 구조 없음)
3. 무지성 분리 아님? (불필요한 Hook/Context)
4. 리프부터 시작? (작은 단위 → 큰 단위)

**안티패턴**:
- 복잡한 커스텀 훅 (인자 3+, 반환값 불일치)
- 숨겨진 UI 구조 (FormInputs, Contents 등)

**출력**: 0-100점 + 추상화 위반 목록

---

### Phase 4: Readability Checker
**파일**: [readability-checker.md](readability-checker.md)

**목적**: [READ], [DECL], [COG7] 검증

**평가 항목**:
- [READ] 의도 드러나는 네이밍
- [DECL] What 선언, How 하위로
- [COG7] 함수≤30줄, 파라미터≤3, 분기≤3

**도구**:
- `analyze-complexity.js` 스크립트

**출력**: 0-100점 + 가독성 위반 목록

---

### Phase 5: Type Analyzer
**파일**: [type-analyzer.md](type-analyzer.md)

**목적**: TypeScript 품질 + [SSOT]

**평가 항목**:
- any 사용 횟수 (0회 필수)
- 타입 단언 (as) 횟수
- [SSOT] 타입 중복 정의
- tsc --noEmit 통과

**도구**:
- `detect-any-usage.js` 스크립트

**출력**: 0-100점 + 타입 이슈 목록

---

## SubAgent 실행 방법

### 1. Task Tool로 실행
```
Task tool:
- subagent_type: "general-purpose"
- prompt: "Phase 1 Structure Analyzer 실행.
          명세: agents/structure-analyzer.md
          과제 경로: [project-path]
          스크립트 결과: [detect-circular-deps.js 출력]"
```

### 2. Agent가 자동으로:
- 해당 Phase 명세 읽기 (structure-analyzer.md)
- 도구 실행 (스크립트, bash)
- 결과 분석
- 점수 산출 (0-100점)

### 3. 출력 형식
```markdown
## Phase 1: Structure Analyzer

### Score: 85/100

### Findings:
- [COUP] 응집도: 7/8 ✅
- Page First: 준수 ✅
- 순환 참조: 1건 발견 (감점 -5)

### Recommendations:
- components/Header → utils/auth 순환참조 해결
```

---

## SubAgent 설계 원칙

### 1. 독립 실행 가능
각 Phase는 독립적으로 실행 가능하며, 다른 Phase 결과에 의존하지 않음

### 2. 명확한 입출력
- Input: 프로젝트 경로 + 스크립트 결과 (해당시)
- Output: 0-100점 + 분석 결과 + 개선 제안

### 3. 도구 활용
- 자동화 스크립트 우선
- Bash 명령어 보조

### 4. 사용자 철학 반영
- [GOAL] 변경 용이성
- [SSOT] 단일 진실
- [COUP] 응집도
- [READ] 가독성
- [COG7] 인지 부하

---

## 전체 평가 프로세스

### Step 1: 경력 레벨 확인
사용자에게 경력 물어보고 criteria 파일 선택:
- Junior → grading-criteria-junior.md (합격선 50%)
- Mid → grading-criteria-mid.md (합격선 60%)
- Senior → grading-criteria-senior.md (합격선 70%)
- Staff+ → grading-criteria-staff.md (합격선 80%)

### Step 2: Phase 0-5 실행
```
Phase 0 (Requirements Checker) → Critical 충족 여부
Phase 1 (Structure Analyzer) → 85/100
Phase 2 (Changeability Checker) → 90/100
Phase 3 (Abstraction Validator) → 75/100
Phase 4 (Readability Checker) → 80/100
Phase 5 (Type Analyzer) → 95/100
```

### Step 3: 최종 리포트
```markdown
# FE 과제 평가 결과

## 지원자 정보
- 경력: Mid (3-4년차)
- 적용 기준: Senior

## 요구사항 (Phase 0)
- Critical: ✅ 충족
- High 미충족: 1개 (-15점)

## 코드 품질 (Phase 1-5)
| Phase | 점수 | 주요 이슈 |
|-------|------|----------|
| 1. 구조 | 17/20 | 순환참조 1건 |
| 2. 변경용이성 | 18/20 | - |
| 3. 추상화 | 15/20 | 복잡한 훅 1개 |
| 4. 가독성 | 16/20 | 35줄 함수 1개 |
| 5. 타입 | 19/20 | - |
| **합계** | 85/100 | |

## 최종 결과
- 점수: 85/100
- 합격선: 60%
- 결과: **합격**

## 개선 제안
1. 순환참조 해결
2. useOrderForm 훅 분리
```

---

## 커스터마이징

### Threshold 조정
각 criteria 파일에서 점수 기준 조정 가능

### SubAgent 추가
새 Phase 추가 시:
1. `agents/new-phase.md` 작성
2. SKILL.md에 Phase 추가
3. Criteria 파일에 반영

### 스크립트 수정
`skills/fe-evaluate/scripts/` 디렉토리에서 탐지 로직 조정 가능

---

**Version**: 1.0
