# Automation Tools

FE Assignment Grading 플러그인의 자동화 도구 개요입니다.

## 개요

이 플러그인은 **SubAgent + Script** 하이브리드 방식을 사용합니다:
- **SubAgent**: 컨텍스트 기반 판단 (사용자 철학, 트레이드오프)
- **Script**: 자동화된 메트릭 수집 (순환 참조, any 사용, 복잡도)

---

## 자동화 스크립트

### 1. detect-circular-deps.js

**기능**:
- 모듈 순환 참조 탐지
- DFS 알고리즘 사용

**실행**:
```bash
node skills/fe-evaluate/scripts/detect-circular-deps.js <과제경로>
```

**활용**:
- Phase 1: Structure Analyzer

**출력 예시**:
```
Scanning: /path/to/project

❌ Found 1 circular dependency chain(s):

[1] components/Header.tsx → utils/auth.ts → components/Header.tsx

{"cycles": [...], "count": 1}
```

---

### 2. detect-any-usage.js

**기능**:
- any, as any 탐지
- @ts-ignore, @ts-expect-error 탐지
- 파일별 위치 출력

**실행**:
```bash
node skills/fe-evaluate/scripts/detect-any-usage.js <과제경로>
```

**활용**:
- Phase 5: Type Analyzer

**출력 예시**:
```
Scanning: /path/to/project

❌ Found 2 type issue(s):

=== Errors ===
  api/order.ts:23 - as any
    const data = response.data as any

  utils/parse.ts:15 - any[]
    function parse(items: any[]): void

{"issues": [...], "stats": {"total": 2, "errors": 2}}
```

---

### 3. analyze-complexity.js

**기능**:
- [COG7] 원칙 검증
- 함수 길이 (≤30줄)
- 파라미터 수 (≤3개)
- 분기 깊이 (≤3단계)

**실행**:
```bash
node skills/fe-evaluate/scripts/analyze-complexity.js <과제경로>
```

**활용**:
- Phase 4: Readability Checker

**출력 예시**:
```
Scanning: /path/to/project

COG7 Limits: 30 lines, 3 params, 3 depth

⚠️ Found 2 function(s) violating COG7 limits:

  pages/Order.tsx:45 - submitOrder
    Issues: 42 lines (max 30)

  hooks/useForm.ts:12 - validateForm
    Issues: 4 params (max 3)

{"functions": [...], "stats": {"violations": 2}}
```

---

## SubAgent 시스템

### Phase별 자동화 수준

| Phase | 자동화 | Manual Review |
|-------|--------|---------------|
| Phase 0 | 0% | 100% (요구사항 확인) |
| Phase 1 | 70% (스크립트) | 30% (Page First) |
| Phase 2 | 20% | 80% (시나리오 시뮬레이션) |
| Phase 3 | 30% | 70% (ACC 체크리스트) |
| Phase 4 | 60% (스크립트) | 40% (네이밍 판단) |
| Phase 5 | 80% (스크립트) | 20% (SSOT 확인) |

**자동화 가능**:
- any 사용 탐지 (스크립트)
- 순환 참조 (스크립트)
- 함수 복잡도 (스크립트)

**Manual Review 필요**:
- 요구사항 충족 여부
- 변경 용이성 시뮬레이션
- 추상화 적절성
- 네이밍 의도

---

## 주의사항

### 스크립트는 보조 도구
- 자동화는 메트릭 수집만
- 최종 판단은 SubAgent
- False positive 가능

### Context 고려
- 정당한 any 사용 (외부 라이브러리)
- 의도적 순환 참조 (드문 경우)
- 프로젝트 특성

---

**Version**: 1.0
