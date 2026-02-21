# 코드 원칙

> 변경에 용이한 코드 작성을 위한 원칙과 패턴

---

## 최상위 원칙: 변경 용이성

> 한 가지 변경은 한 곳에서만 수정되어야 한다.

### 규칙

- 같은 값(URL, 문자열, 숫자)이 2곳 이상 → 상수/함수로 추출
- API 경로, 라우트 경로 → 한 곳에서 정의하고 import
- 타입 정의는 원본 1곳, 사용처는 원본에서 파생 (`Pick`, `Omit`, `Detail['field']`)
- 매직 넘버/문자열 금지 → 이름 있는 상수로

### 예시

```typescript
// ❌ URL이 3곳에 하드코딩 → 변경 시 3곳 수정
<Link to="/user/detail/123">상세보기</Link>
<Link to="/user/detail/456">편집</Link>
navigate(`/user/detail/${id}`)

// ✅ 한 곳에서 정의 → 변경 시 1곳 수정
export const ROUTES = {
  userDetail: (id: string) => `/user/detail/${id}`,
}

<Link to={ROUTES.userDetail('123')}>상세보기</Link>
navigate(ROUTES.userDetail(id))
```

```typescript
// ❌ 타입을 각각 정의 → 필드 추가 시 여러 곳 수정
interface UserListItem { id: string; name: string; }
interface UserDetail { id: string; name: string; email: string; }

// ✅ 기준 타입에서 파생 → 원본만 수정하면 됨
interface User { id: string; name: string; email: string; }
type UserListItem = Omit<User, 'email'>;
```

---

## 1. SSOT (Single Source of Truth)

> 정의는 한 곳, 사용처는 import/파생으로.

### 규칙

- Props 타입은 DTO에서 직접 추출 (`Detail['field']`, `NonNullable<>`)
- 같은 인터페이스를 여러 파일에서 재정의 금지 → 원본 import
- enum/상수 값은 한 곳에서 정의, 사용처에서 import
- Zod 스키마 → `z.infer<>`로 타입 파생 (타입 별도 정의 금지)
- 비즈니스 로직(계산, 판별)은 한 곳에서 정의, 사용처에서 호출

### 예시

```typescript
// ❌ Props 타입을 직접 정의 → DTO 변경 시 Props도 수정 필요
interface Props {
  id: number;
  name: string;
  vanSettings: VanSetting[];
}

// ✅ DTO에서 직접 추출 → DTO만 수정하면 됨
interface Props {
  van: Van;
  vanSettings: NonNullable<MerchantDetail['vanSettings']>;
}
```

```typescript
// ❌ 비즈니스 로직이 각 사용처에서 중복 정의
function MerchantBadge({ merchant }: Props) {
  const isActive = merchant.status === 'active' && merchant.contractEndDate > new Date();
  return <Badge>{isActive ? '활성' : '비활성'}</Badge>;
}

function MerchantRow({ merchant }: Props) {
  const isActive = merchant.status === 'active' && merchant.contractEndDate > new Date();
  return <TableRow css={{ opacity: isActive ? 1 : 0.5 }}>...</TableRow>;
}

// ✅ 판별 로직을 한 곳에서 정의, 사용처에서 호출
function getIsActiveMerchant(merchant: Merchant): boolean {
  return merchant.status === 'active' && merchant.contractEndDate > new Date();
}

function MerchantBadge({ merchant }: Props) {
  return <Badge>{getIsActiveMerchant(merchant) ? '활성' : '비활성'}</Badge>;
}

function MerchantRow({ merchant }: Props) {
  return <TableRow css={{ opacity: getIsActiveMerchant(merchant) ? 1 : 0.5 }}>...</TableRow>;
}
```

---

## 2. SRP (단일 책임 원칙)

> 모듈은 한 가지 변경 이유만 갖는다.

### 규칙

- 컴포넌트: UI 렌더링만. 데이터 페칭/로딩/에러는 상위(Suspense, ErrorBoundary)로 위임
- 훅: 하나의 관심사만 (필터 관리, 데이터 조회, UI 상태 중 하나)
- remote 함수: 네트워크 호출만. 비즈니스 로직/UI 피드백 포함 금지
- mutationOptions: 캐시 무효화만. toast/네비게이션은 컴포넌트에서 처리

### 예시

```typescript
// ❌ "분리"만 한 훅 — 접어놓고 깔끔하다는 착각
// 월 선택, 데이터 조회, 네비게이션 3가지 책임이 한 훅에
function useConsumptionPage() {
  const [month, setMonth] = useState(new Date());
  const { data, isError, refetch } = useQuery(consumptionQuery.list(month));
  const goPrevMonth = () => setMonth(subMonths(month, 1));
  const goNextMonth = () => setMonth(addMonths(month, 1));
  return { month, data, isError, refetch, goPrevMonth, goNextMonth };
}

// ✅ 관심사별 분리 — 각각 변경 이유가 하나
// 월 선택 UI → MonthSelector 컴포넌트
<MonthSelector value={month} onChange={setMonth} />
// 데이터 조회 → queryOptions
const { data } = useSuspenseQuery(consumptionQuery.list(month));
```

```typescript
// ❌ 훅 이름과 책임 불일치 — 이름은 "상품"인데 선택/필터까지
const { selectedProduct, handleSelectProduct, filterSavingsProducts } =
  useSavingsProducts(savingsProducts, monthlyPayment, term);

// ✅ 이름 = 책임 — 각 훅이 하나의 관심사만
const { filters } = useSavingFilters();
const { selectedProduct, handleSelect } = useProductSelection();
```

---

## 3. 응집도 ↑ 결합도 ↓

> 함께 바뀌는 것끼리 가까이, 외부 의존은 명시적으로.

### 규칙

- 관련 코드끼리 가까이 배치 (A-B-A-B 분산 금지)
- 재사용 전까지 같은 파일 내에 정의 (이른 파일 추출 금지)
- 폴더 구조는 지역성 기반 — 사용되는 곳 가까이 (→ `folder-structure.md` 참조)
- 전역 상태보다 명시적 props 선호 (숨겨진 결합도 방지)

### 예시

```typescript
// ❌ A-B-A-B 패턴 — 관련 로직이 분산
const month = useState(new Date());       // A: 월 선택
const { data } = useQuery(...);           // B: 데이터 조회
const goPrevMonth = () => {};             // A: 월 선택
const isError = data?.error;              // B: 데이터 조회

// ✅ 관련된 것끼리 묶음
<MonthSelector value={month} onChange={setMonth} />       // A: 월 선택 완결
<ConsumptionList month={month} />                         // B: 내부에서 조회 처리
```

```typescript
// ❌ 전역 상태 = 숨겨진 결합도 (어디서 변경되는지 모름)
function useConsumption() {
  const month = useAtom(monthAtom); // 숨겨진 의존성
  return useQuery(consumptionQuery.list(month));
}

// ✅ 명시적 의존 — 의존 관계가 보임
function useConsumption(month: Date) {
  return useQuery(consumptionQuery.list(month));
}
```

---

## 4. 선언적 프로그래밍

> What(무엇을) 선언, How(어떻게)는 하위로 위임.

### 규칙

- 로딩/에러는 Suspense/ErrorBoundary에 위임, 컴포넌트는 데이터 렌더링만
- 조건문은 의도를 드러내는 함수로 추출 (How → What)
- 요구사항이 코드에 그대로 보여야 함

### 예시

```typescript
// ❌ 절차적: 로딩/에러를 직접 처리
function UserProfile() {
  const { data, isLoading, error } = useQuery(...);
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;
  return <div>{data.name}</div>;
}

// ✅ 선언적: 로딩/에러 위임, 데이터만 처리
<ErrorBoundary fallback={<ErrorMessage />}>
  <Suspense fallback={<Spinner />}>
    <UserProfile />
  </Suspense>
</ErrorBoundary>

function UserProfile() {
  const { data } = useSuspenseQuery(...);
  return <div>{data.name}</div>;
}
```

```typescript
// ❌ How: 조건의 구현이 노출됨
if (product.minMonthlyAmount <= monthlyPayment &&
    monthlyPayment <= product.maxMonthlyAmount &&
    product.availableTerms.includes(term)) {
  // ...
}

// ✅ What: 의도만 드러남
if (isEligibleProduct(product, { monthlyPayment, term })) {
  // ...
}
```

```typescript
// ❌ 요구사항 "일자별로 그루핑해서 출력"이 코드에서 안 보임
data.map(item => ({
  date: new Date(item.timestamp).toISOString().split('T')[0],
  ...item
})).reduce((acc, item) => { /* ... */ })

// ✅ 요구사항이 코드에 그대로 보임
const groupedByDate = groupByDate(consumptions);
```

---

## 5. 추상화

> 분리 ≠ 추상화. 리프부터 추상화.

### 규칙

- 한 함수/컴포넌트 안에는 같은 추상화 레벨만 유지
- 추상화 순서: 펼치기 → 관찰 → 리프부터 추상화
- 무지성 커스텀 훅 = 분리일 뿐, 추상화가 아님

### 예시

```typescript
// ❌ 분리만 한 것 — 접어놓고 깔끔하다는 착각
// 수정하려면 훅 열어서 내부를 다 봐야 함
function useConsumptionPage() {
  const [month, setMonth] = useState();
  const { data, isError, refetch } = useQuery(...);
  const goPrevMonth = () => {};
  const goNextMonth = () => {};
  return { month, data, isError, refetch, goPrevMonth, goNextMonth };
}

// ✅ 진짜 추상화 — 사용처도 깔끔, 내부도 깔끔
<MonthSelector value={month} onChange={setMonth} />
```

```typescript
// ❌ 레벨 혼재 — 고수준(UI 조립)과 저수준(필터링 로직)이 섞임
function ProductList({ products, monthlyPayment, term }: Props) {
  const filtered = products
    .filter(p => p.minMonthlyAmount <= monthlyPayment && monthlyPayment <= p.maxMonthlyAmount)
    .filter(p => p.availableTerms.includes(term))
    .sort((a, b) => b.annualRate - a.annualRate);

  return filtered.map(p => <ProductItem key={p.id} product={p} />);
}

// ✅ 같은 레벨 유지 — 비즈니스 로직은 아래로 위임
function ProductList({ products, monthlyPayment, term }: Props) {
  const filtered = filterEligibleProducts(products, { monthlyPayment, term });
  return filtered.map(p => <ProductItem key={p.id} product={p} />);
}
```

---

## 6. 가독성

> 의도가 명확하고, 코드를 읽으면 UI가 그려지는 코드.

### 규칙

- 변수명/함수명이 의도를 드러낸다
- 조기 반환(early return)으로 예외 케이스 먼저 처리
- 컴포넌트 인터페이스는 HTML처럼 뻔하게 (최소 놀람 원칙)
- 코드와 UI가 1:1 매핑 — 코드를 읽으면 화면이 보여야 함
- 위에서 아래로 읽히는 구조 — 고수준(컴포넌트 조립) → 저수준(헬퍼/유틸) 순서

### 예시

```typescript
// ❌ 처음 보는 인터페이스 — Props를 열어봐야 동작 파악
<NavigationSection
  currentMonth={month}
  setCurrentMonth={setMonth}
  goPrevMonth={...}
  goNextMonth={...}
/>

// ✅ HTML처럼 뻔한 인터페이스 — <select>와 동일한 멘탈 모델
<MonthSelector value={month} onChange={(value) => setMonth(value)} />
```

```typescript
// ❌ UI가 코드에서 안 보임 — SavingsCalculatorContents가 뭘 보여주는지 모름
<SavingFilterForm control={form.control} />
<SavingsCalculatorContents targetAmount={targetAmount} monthlyPayment={monthlyPayment} term={term} />

// ✅ UI와 코드 1:1 — 입력 필드, 탭 구조가 코드에서 바로 보임
<CurrencyTextField label="목표 금액" value={targetAmount} onChange={...} />
<CurrencyTextField label="월 납입액" value={monthlyPayment} onChange={...} />
<Tab defaultValue={TAB.products}>
  <Tab.Item value={TAB.products}>적금 상품</Tab.Item>
  <Tab.Item value={TAB.results}>계산 결과</Tab.Item>
</Tab>
```

---

## 7. 의존성

> 재사용 컴포넌트는 특정 라이브러리에 직접 의존하지 않는다.

### 규칙

- 재사용 컴포넌트: 특정 라이브러리(react-hook-form, zustand 등)에 직접 의존 금지 → prop으로 주입
- 페이지/도메인 컴포넌트: 라이브러리 직접 사용 허용 (과도한 래핑 금지)
- 외부 라이브러리 래핑 레이어는 실제 교체가 발생할 때 도입

### 예시

```typescript
// ❌ 재사용 컴포넌트가 react-hook-form에 직접 의존
function FormField({ name }: Props) {
  const { register } = useFormContext();
  return <input {...register(name)} />;
}

// ✅ prop으로 주입 — form 라이브러리와 무관하게 재사용 가능
function FormField({ value, onChange }: Props) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

---

## 8. 인지 부하 제한

> 한 번에 파악할 수 있는 범위를 제한한다. (가이드라인)

| 제한 | 기준 |
|------|------|
| 함수 길이 | ≤ 30줄 |
| 파라미터 수 | ≤ 3개 (넘으면 객체) |
| 분기 깊이 | ≤ 3단계 |

---

## ✅ DO & ❌ DON'T

### ✅ DO
- 한 가지 변경 = 한 곳에서 끝 (SSOT)
- 함께 바뀌는 것끼리 가까이 (응집도)
- What 선언, How 위임 (선언적)
- 의도가 드러나는 이름, 조기 반환 (가독성)
- 분리 ≠ 추상화 — 사용처도 내부도 깔끔해져야 진짜 추상화

### ❌ DON'T
- 이른 추상화/일반화 ("나중에 필요할 것 같아서")
- 이른 파일 추출 (재사용 전까지 같은 파일 유지)
- 성급한 상수 추출 (여러 곳 사용 전까지 현재 위치)
- 과도한 에러 핸들링 (일어나지 않을 시나리오 대비)
- any 타입 사용

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2026-02-08 | 코드 원칙 컨벤션 초판 (best-code 소스 기반) |
