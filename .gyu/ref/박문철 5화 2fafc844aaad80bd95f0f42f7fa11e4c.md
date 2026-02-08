# 박문철 5화

- https://www.youtube.com/live/H-yfpOaPR4g

# **코드 리뷰 핵심 원칙**

> 출처: 박문철 TV 코드 리뷰 세션 (토스 내부 교육) 리뷰어: 박서진
> 

---

## **핵심 마인드셋**

### **1. 코드 보기 전 먼저 생각하기**

```
❌ 바로 코드 보기 → 끌려들어감 → 납득 → 리뷰할 게 없음
✅ "나라면 어떻게?" 먼저 생각 → 비교하며 리뷰

```

### **2. use 훅은 콘센트다**

```
use로 시작하는 것들(useState, useQuery)은 제약이 많음
→ 방 공사할 때 콘센트 위치 먼저 고민하듯
→ 상태 위치를 먼저 설계해야 나중에 대공사 안 함

```

---

## **컴포넌트 설계 원칙**

### **최소 놀람의 원칙 (Principle of Least Surprise)**

```tsx
// ❌ 처음 보는 인터페이스
<NavigationSection
  currentMonth={month}
  setCurrentMonth={setMonth}
  goPrevMonth={...}
  goNextMonth={...}
/>

// ✅ HTML처럼 뻔한 인터페이스
<MonthSelector value={month} onChange={setMonth} />

```

**기준**: `<select>`, `<input>`처럼 누구나 아는 패턴 따라가기

### **A-B-A-B 패턴 (안티패턴)**

```tsx
// ❌ 사용처와 정의가 분산됨
const month = useState(...)       // A
const data = useQuery(...)        // B
const goNextMonth = () => {}      // A
const isError = ...               // B

// ✅ 관련된 것끼리 묶음
<MonthSelector value={month} onChange={setMonth} />
<ConsumptionList month={month} />  // 내부에서 쿼리 처리

```

**발견 즉시 분리** - A-B-C-D-B-C-A 되기 전에

---

## **추상화 vs 분리**

### **분리 ≠ 추상화**

```tsx
// ❌ 분리만 함 (도망친 것)
function useConsumptionPage() {
  const [month, setMonth] = useState()
  const { data, isError, refetch } = useQuery(...)
  const goPrevMonth = () => {}
  const goNextMonth = () => {}
  return { month, data, isError, refetch, goPrevMonth, goNextMonth }
}
// 접어놓고 "깔끔하다" → 수정하려면 여기저기 다 고쳐야 함

// ✅ 진짜 추상화
<MonthSelector value={month} onChange={setMonth} />
// 사용처가 깔끔해지고, 내부도 깔끔해짐

```

---

## **요구사항이 코드에 보여야 함**

```tsx
// 요구사항: "일자별로 그루핑해서 출력"

// ❌ 복잡한 로직
data.map(item => ({
  date: new Date(item.timestamp).toISOString().split('T')[0],
  ...item
})).reduce((acc, item) => { /* ... */ })

// ✅ 요구사항 그대로
const 일자별_그루핑 = groupByDate(consumptions)

```

---

## **디자이너 머릿속 따라가기**

```
요구사항: 카드, 계좌, 기타, 환불 4가지 카테고리

```

```tsx
// ❌ 천재적 추상화
<StyledTextRow isExcluded={...} category={...} />

// ✅ 디자이너 사고방식 = 변경 단위
<CardConsumptionRow />
<AccountConsumptionRow />
<EtcConsumptionRow />
<RefundConsumptionRow />

```

**이유**: 변경 요청이 "카드만 버튼 추가해주세요"로 오면 CardConsumptionRow만 수정

---

## **상태 관리 우선순위**

| 순위 | 종류 | 사용 시점 |
| --- | --- | --- |
| 1 | 지역 상태 | 기본값. 최대한 버티기 |
| 2 | 서버 상태 | 데이터 페칭 (React Query) |
| 3 | 전역 상태 | 정말 필요할 때만 |

### **전역 상태의 위험**

```tsx
// ❌ 암묵적 결합도 발생
function useConsumption() {
  const month = useAtom(monthAtom)  // 숨겨진 의존성
  // 무해해 보이지만 어디서 터질지 모름
}

// ✅ 명시적 의존
function useConsumption(month: number) {
  // 의존 관계가 보임 → 냄새가 남 → 치울 수 있음
}

```

**문제점**:

- 냄새가 안 남 (숨겨져서)
- 깨지기 쉬움 (의존하는 곳 다 영향)
- 디버깅 어려움

---

## **핵심 요약 10가지**

1. **코드 보기 전 설계 먼저**
2. **HTML처럼 뻔한 인터페이스**
3. **A-B-A-B 패턴 → 즉시 분리**
4. **분리 ≠ 추상화** (진짜 깔끔해졌는지 확인)
5. **요구사항이 코드에 그대로 보여야 함**
6. **전역 상태는 최후의 수단**
7. **디자이너 사고방식 따라가기**
8. **Magic Number 금지** (의미있는 상수 사용)
9. **Suspense + ErrorBoundary로 에러/로딩 분리**
10. **나중에 합치는 건 쉬움, 꼬인 걸 푸는 건 어려움**

---

## **용어 정리**

| 용어 | 설명 |
| --- | --- |
| A-B-A-B 패턴 | 관련 로직이 분산되어 있는 안티패턴 |
| 최소 놀람의 원칙 | 컴포넌트가 예상대로 동작해야 함 |
| 암묵적 결합도 | 숨겨진 의존성 → 버그/테스트 어려움 |
| Props Drilling | 불필요한 데이터 전달 체인 |
| Magic Number | 의미 없는 숫자 리터럴 |