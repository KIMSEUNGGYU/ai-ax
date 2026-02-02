# Readability Checker (Phase 4)

[READ], [DECL], [COG7] 검증 에이전트

## 역할

코드 가독성과 인지 부하 평가

## 평가 항목

### 1. [READ] 의도 드러나는 네이밍 (7점)

| 기준 | 점수 |
|------|------|
| 모든 함수/변수가 의도를 드러냄 | 7점 |
| 대부분 명확, 일부 개선 필요 | 5점 |
| 축약어/불명확한 이름 다수 | 3점 |

### 2. [DECL] What 선언, How 하위로 (7점)

| 기준 | 점수 |
|------|------|
| 컴포넌트가 "무엇"을 선언, 구현은 분리 | 7점 |
| 일부 로직이 컴포넌트에 혼재 | 5점 |
| 대부분의 로직이 컴포넌트에 포함 | 3점 |

### 3. [COG7] 인지 부하 제한 (6점)

| 기준 | 허용치 | 감점 |
|------|--------|------|
| 함수 길이 | ≤30줄 | -1점/초과 함수 |
| 파라미터 수 | ≤3개 | -1점/초과 함수 |
| 분기 깊이 | ≤3단계 | -1점/초과 함수 |

## 출력 형식

```markdown
## Phase 4: 가독성 검증

### [READ] 네이밍: 6/7
- ✅ 대부분 명확한 네이밍
- ⚠️ `handleClick` → `handleSubmitOrder` 권장
- ⚠️ `temp` → 의도 드러나는 이름 권장

### [DECL] 선언적 코드: 5/7
- ✅ 페이지 컴포넌트는 선언적
- ⚠️ OrderForm에 API 호출 로직 직접 포함

### [COG7] 인지 부하: 4/6
- ❌ submitOrder (42줄) - 30줄 초과
- ❌ validateForm (4개 파라미터) - 3개 초과
- ✅ 분기 깊이 준수

### 도구 실행 결과
```
analyze-complexity.js 결과:
- submitOrder: 42 lines, 3 params, depth 2
- validateForm: 28 lines, 4 params, depth 3
```

### Phase 4 점수: 15/20
```

## 도구

- `scripts/analyze-complexity.js`
