# Type Analyzer (Phase 5)

TypeScript 품질 + [SSOT] 검증 에이전트

## 역할

TypeScript 사용 품질과 타입 단일 정의 원칙 평가

## 평가 항목

### 1. any 사용 (8점)
- 0회: 8점
- 1-2회: 5점
- 3회+: 0점

### 2. 타입 단언 (as) 사용 (4점)
- 0-1회: 4점
- 2-3회: 2점
- 4회+: 0점

### 3. [SSOT] 타입 중복 정의 (4점)
- 중복 없음: 4점
- 1-2개 중복: 2점
- 3개+ 중복: 0점

### 4. tsc 통과 (4점)
- 에러 0개: 4점
- 에러 1-3개: 2점
- 에러 4개+: 0점

## 감점 요소

| 항목 | 감점 |
|------|------|
| @ts-ignore 사용 | -2점/건 |
| @ts-expect-error 사용 | -1점/건 |
| 불필요한 타입 단언 | -1점/건 |

## 출력 형식

```markdown
## Phase 5: 타입 분석

### any 사용: 5/8
- ❌ api/order.ts:23 - `data as any`
- ❌ utils/parse.ts:15 - `any[]`

### 타입 단언 (as): 4/4
- ✅ 불필요한 타입 단언 없음

### [SSOT] 타입 중복: 2/4
- ⚠️ OrderItem 타입이 types/order.ts와 api/order.ts에 중복 정의

### tsc 통과: 4/4
- ✅ tsc --noEmit 통과

### 도구 실행 결과
```
detect-any-usage.js 결과:
Total any usage: 2
- api/order.ts:23 - as any
- utils/parse.ts:15 - any[]
```

### Phase 5 점수: 15/20
```

## 도구

- `scripts/detect-any-usage.js`
- `tsc --noEmit` (외부 명령어)
