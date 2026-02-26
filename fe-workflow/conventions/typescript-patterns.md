# TypeScript 패턴 컨벤션

> TypeScript/JavaScript 코드 작성 시 타입 안전성과 일관성을 위한 규칙

---

## 1. Boolean 체크

boolean이 아닌 값을 boolean으로 type casting하지 않는다. null/undefined 체크는 `==` 연산자를 사용한다.

```tsx
// ✅
if (something != null) { ... }         // null, undefined 모두 체크
if (is.falsy(message)) return;         // @tossteam/is 라이브러리 활용
if (is.nonEmptyArray(items)) return;

// ❌
if (!!something) { ... }               // 강제 boolean 캐스팅
if (something === null || something === undefined) { ... }  // 중복 체크
if (Boolean(something)) { ... }
```

**@tossteam/is 라이브러리 활용:**

```tsx
import { is } from '@tossteam/is';

function submitMessage() {
  const message = router.query.q as string;
  if (is.falsy(message)) return;
  if (is.nonEmptyArray(messages)) return;
  handlePostChat(message);
}
```

---

## 2. Non-null Assertion

null이 될 수 없는 상황에서는 optional chaining(`?.`) 대신 non-null assertion(`!`)을 사용한다.

```tsx
// ✅ — data가 반드시 있는 컨텍스트 (useSuspenseQuery 등)
const { data } = useData();
const name = data!.contents.name;

// ❌ — null일 수 없는데 optional chaining 사용
const { data } = useData();
const name = data?.contents.name;  // name이 string | undefined가 되어 타입 불정확
```

**언제 `?.` vs `!` 선택:**

| 상황 | 선택 | 이유 |
|------|------|------|
| data가 없을 수 있는 경우 | `?.` | 안전한 접근 |
| useSuspenseQuery, 조건 검증 후 | `!` | null 불가능이 보장됨 |

---

## 3. TypeScript Enum 금지

`enum` 대신 `as const` 객체를 사용한다.

```tsx
// ✅
const ContentStatus = {
  기본: 'DEFAULT',
  수정중: 'EDITING',
  보류중: 'HOLDING',
} as const;

type ContentStatus = typeof ContentStatus[keyof typeof ContentStatus];

// ❌
enum ContentStatus {
  기본 = 'DEFAULT',
  수정중 = 'EDITING',
  보류중 = 'HOLDING',
}
```

**이유:** enum은 트리쉐이킹이 안 되고, `const enum`은 번들러 호환성 문제, 일반 enum은 런타임 객체를 생성해 번들 크기 증가.

---

## 4. Nilable vs Optional Parameter

undefined 허용(`T | undefined`)과 optional parameter(`?`)를 상황에 맞게 구분한다.

```tsx
// ✅ — 선택적 파라미터 (호출 시 생략 가능)
function apply(name?: string) { ... }

// ✅ — 반드시 전달해야 하지만 undefined 허용
function apply(name: string | undefined) { ... }

// ❌ — 무지성 optional (의도 불명확)
function apply(name?: string) { ... }  // 실제론 undefined만 전달할 일이 없는데
```

**구분 기준:**

| 패턴 | 의미 | 사용 케이스 |
|------|------|------------|
| `name?: string` | 호출 시 생략 가능 | 선택적 기능 |
| `name: string \| undefined` | 반드시 전달, undefined 허용 | 값이 없을 수 있음을 명시 |

---

## 5. 고차함수 변수명

`Array.{method}`의 고차함수 변수는 **복수형 ↔ 단수형** 패턴으로 작성한다.

```tsx
// ✅
users.map(user => user.name);
products.filter(product => product.available);
orders.reduce((acc, order) => acc + order.amount, 0);

// ❌
list.map(({ name }) => name);       // 컬렉션 이름과 무관한 변수명
users.map(u => u.name);             // 축약형
users.map(item => item.name);       // generic 변수명
```

---

## 6. reduce 패턴

`Array.prototype.reduce` 사용 시 initialValue를 필수로 넣고, 타입단언하지 않는다.

```tsx
// ✅ — Generic으로 타입 지정
arr.reduce<Record<string, Item>>((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

// ❌ — 타입단언
arr.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, Item>);

// ❌ — initialValue 기본값 패턴 (타입 불안전)
arr.reduce((acc = {}, curr) => {
  acc[curr.id] = curr;
  return acc;
});
```

**누적 스프레드 금지 (O(n²)):**

```tsx
// ✅ — O(n): mutate
arr.reduce<Record<string, Item>>((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {});

// ❌ — O(n²): 매 iteration마다 새 객체 생성
arr.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});
```

---

## 7. 한글 변수명

영어로 표현이 어렵거나 도메인 맥락이 깊어 한글로 표현할 때 가독성이 좋다면 한글 변수를 사용한다.

```tsx
// ✅ — 도메인 용어가 한글로 더 명확한 경우
const 급여명세서 = '...';
const 시차출퇴근근무제도 = '...';
const 최대_퀴즈_개수 = 3;

// ❌ — 영어로 충분히 표현 가능한 경우
const 유저들 = [];         // → users
const 비활성화인가 = false; // → disabled
const 숫자 = 0;            // → count
```

---

## 8. export default 금지

`export default`는 사용하지 않고 명시적 `export`만 사용한다.

```tsx
// ✅
export { ListItem };
export { MyPage as default } from 'pages/MyPage';  // pages/ 디렉토리 예외

// ❌
export default ListItem;
```

**예외:** Next.js의 `pages/` 디렉토리는 라우팅 요구로 `export default` 허용.

---

## 9. 하드코딩 값은 상수로

매직 넘버/문자열은 의미 있는 이름의 상수로 선언한다.

```tsx
// ✅
const 최대_퀴즈_개수 = 3;
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api/v1';

if (fields.length > 최대_퀴즈_개수) { ... }

// ❌
if (fields.length > 3) { ... }
```

---

## 10. 파일 내 함수/컴포넌트 배치 순서

고수준(상위) → 저수준(하위) 순서로 배치한다. 코드가 위에서 아래로 읽힌다.

```tsx
// ✅ — 주 컴포넌트 먼저, 하위 컴포넌트/유틸 나중
interface Props { ... }

function ChangePasswordPage() {
  return (
    <>
      <FormSection />
      <SubmitButton />
    </>
  );
}

function FormSection() { ... }
function SubmitButton() { ... }
const formStyles = { ... };

// ❌ — 하위 컴포넌트가 먼저 나오면 맥락 파악 후 읽어야 함
function SubmitButton() { ... }
function FormSection() { ... }

function ChangePasswordPage() { ... }
```

---

## 11. 라이브러리 Class 타입 체크

라이브러리 클래스의 타입 체크는 `instanceof` 대신 타입 가드 함수를 사용한다.

```tsx
// ✅ — 구조적 타입 체크
export function isTossPaymentsError(err: unknown): err is TossPaymentsError {
  if (typeof err !== 'object' || err == null) {
    return false;
  }
  return ['message', 'success'].every(prop => prop in err);
}

if (isTossPaymentsError(error)) {
  console.log(error.message);
}

// ❌
import { TossPaymentsError } from '@tosspayments/error';
if (error instanceof TossPaymentsError) { ... }
```

**이유:** 번들 코드 스플리팅, babel transpile, 다중 라이브러리 버전 환경에서 `instanceof`는 실패할 수 있음.

---

## 12. 유틸 라이브러리 활용

es-toolkit, react-simplikit에서 제공하는 타입 세이프한 유틸 함수를 적극 활용한다.

```tsx
// ✅
import { sum, objectEntries, objectValues, groupBy } from 'es-toolkit';
import { useBooleanState, useDebounce } from 'react-simplikit';

// 배열 합계
const total = sum(amounts);

// 객체 순회 (타입 세이프)
objectEntries({ a: 1, b: 2 }).forEach(([key, value]) => { ... });

// boolean 상태 관리
const [isOpen, open, close] = useBooleanState(false);

// ❌ — 직접 구현
const total = amounts.reduce((acc, n) => acc + n, 0);
Object.entries(obj).forEach(([key, value]) => { ... });  // 타입 손실
```

---

## interface vs type

일반 객체 형태는 `interface`, 단일 타입·유니온·추론 타입은 `type`.

```tsx
// ✅ interface — API 응답, 엔티티, 컴포넌트 Props
interface MerchantDetail {
  id: number;
  name: string;
}

interface Props {
  onClose: VoidFunction;  // 함수 타입은 arrow function 형태
}

// ✅ type — 유니온, 교차, 추론
type TidForm = NiceForm | KisForm;
type AComponentProps = ComponentProps<typeof A>;

// ❌ interface로 함수 타입
interface Props {
  onClose(): void;  // method 형태는 strictFunctionTypes 우회
}
```

---

## 13. any / as 금지

타입 안전성을 포기하는 `any`와 `as` 타입단언을 금지한다.

```tsx
// ✅ — 정확한 타입 정의
interface ApiResponse<T> {
  data: T;
  status: number;
}

function processData(response: ApiResponse<User>) {
  return response.data.name;
}

// ✅ — unknown + 타입 가드로 안전하게
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}

// ❌
const data = response as User;       // as 타입단언
const result: any = fetchData();     // any
function process(data: any) { ... }  // any 파라미터
```

**예외:** DOM 접근, 서드파티 라이브러리 연동 등 불가피한 경우 주석으로 이유 명시.

---

## 14. Discriminated Union

연관된 타입 변형은 판별자(discriminant) 필드를 활용해 관계로 정의한다.

```tsx
// ✅ — 판별자(discriminant)로 타입 관계 정의
type PaymentForm =
  | { method: 'card'; cardNumber: string; expiry: string }
  | { method: 'bank'; bankCode: string; accountNumber: string }
  | { method: 'virtual'; bankCode: string };

function renderForm(form: PaymentForm) {
  switch (form.method) {
    case 'card':
      return <CardForm cardNumber={form.cardNumber} />;  // cardNumber 타입 보장
    case 'bank':
      return <BankForm bankCode={form.bankCode} />;
    case 'virtual':
      return <VirtualForm bankCode={form.bankCode} />;
  }
}

// ✅ — API 응답 상태를 관계로
type OrderStatus =
  | { status: 'pending' }
  | { status: 'processing'; startedAt: string }
  | { status: 'completed'; completedAt: string; invoiceId: string }
  | { status: 'failed'; reason: string };

// ❌ — 독립 boolean 조합으로 불가능한 상태 생성
interface Order {
  isProcessing: boolean;
  isCompleted: boolean;   // isProcessing: true & isCompleted: true 가능?
  isFailed: boolean;
  completedAt?: string;   // 어느 상태에서 값이 있는지 불명확
  reason?: string;
}
```

**이유:** 불가능한 상태를 타입 레벨에서 제거. `switch`에서 exhaustive 체크 가능.

---

## ✅ DO & ❌ DON'T

### ✅ DO
- `!= null`로 null/undefined 체크
- `@tossteam/is` 라이브러리 활용
- null 불가 상황에서 non-null assertion(`!`)
- `as const` 객체로 enum 대체
- 고차함수: 복수→단수 변수명
- reduce: Generic 타입 지정, initialValue 필수, mutate 패턴
- 의미 있는 상수 이름 (한글 포함)
- 명시적 `export`, `export default` 금지
- 고수준 → 저수준 배치 순서
- 라이브러리 클래스: 타입 가드 함수로 체크
- es-toolkit, react-simplikit 적극 활용
- 연관 타입 변형은 Discriminated Union으로 관계 정의
- 타입 불명확 시 정확한 타입 정의 (any/as 대신)

### ❌ DON'T
- `!!something`, `Boolean(something)` 강제 캐스팅
- 중복 null 체크 (`=== null || === undefined`)
- `enum` 키워드 사용
- `any` 사용
- `as` 타입단언 (불가피한 경우 주석 필수)
- reduce에서 `as` 타입단언
- 누적 스프레드 reduce (`{ ...acc, key: val }`)
- `export default` (pages/ 제외)
- 매직 넘버/문자열 하드코딩
- `instanceof`로 라이브러리 클래스 판별
- interface에서 method 형태 함수 타입
- 독립 boolean 여러 개로 연관 상태 표현

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2026-02-26 | TypeScript 패턴 컨벤션 초판 (아이샵케어 컨벤션 기반) |
