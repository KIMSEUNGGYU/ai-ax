# TypeScript/JavaScript Coding Style

## Immutability

Use spread operator for immutable updates:

```typescript
// WRONG: Mutation
function updateUser(user, name) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## Error Handling

Use async/await with try-catch:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## Input Validation

Use Zod for schema-based validation:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Event Handler Naming

이벤트 핸들러는 `handle{TargetName}{EventType}` 형태로 작성한다:

```typescript
// ✅ CORRECT: handle + 대상 + 이벤트타입
const handleFormSubmit = form.handleSubmit(async data => { ... });
const handleBoxClick = () => { ... };
const handleInputFocus = () => { ... };

<Button onClick={handleButtonClick} onFocus={handleButtonFocus} />

// ❌ WRONG: 이벤트 타입이 앞에 오는 경우
const handleClickButton = () => { ... };
const handleFocusInput = () => { ... };

// ❌ WRONG: on* 접두사 (props 전달용이지 핸들러 정의용이 아님)
const onSubmit = form.handleSubmit(...);
const onClick = () => { ... };
```

## @tossteam/is 라이브러리

프로젝트 전체에서 `@tossteam/is` 라이브러리를 boolean 판별에 사용한다. `!` 연산자나 직접 boolean 변환으로 대체하지 않는다.

```typescript
// ✅ CORRECT: is 라이브러리 사용 (프로젝트 컨벤션)
import { is } from '@tossteam/is';

const invalidFile = selected.find(f => is.falsy(ALLOWED_EXTENSIONS.includes(getFileExtension(f.name))));
const removed = files.filter(file => is.truthy(selectedFiles.has(file.downloadUrl)));
onFilesChange(files.filter(file => is.falsy(selectedFiles.has(file.downloadUrl))));

// ❌ WRONG: 직접 boolean 연산 (리뷰에서 제안되어도 거부)
const invalidFile = selected.find(f => !ALLOWED_EXTENSIONS.includes(getFileExtension(f.name)));
const removed = files.filter(file => selectedFiles.has(file.downloadUrl));
```

## Boolean Props

접두어(`is`, `can`, `has`) 없이, 명시적으로 `true`/`false` 전달:

```tsx
// ✅
<TheBox open={true} clickable={false} animate={true} />

// ❌ 접두어 사용
<TheBox isOpen={true} canClick={false} />

// ❌ shorthand 생략
<Something open />
```

## Null 체크

`!= null`로 null/undefined 동시 체크:

```tsx
// ✅
if (something != null) { ... }

// ❌
if (!!something) { ... }
if (something === null || something === undefined) { ... }
```

## 조건부 렌더링

삼항 연산자 사용. `&&` 연산자는 falsy 값(0, '')이 렌더링될 수 있으므로 지양:

```tsx
// ✅ 삼항 연산자
return <section>{title != null ? <h1>{title}</h1> : null}</section>;

// ❌ && 연산자 (boolean이 아닌 값일 때 위험)
return <section>{title && <h1>{title}</h1>}</section>;
```

## 상태 분기

여러 상태값 조합 대신, 하나의 상태값으로 분기:

```tsx
// ✅ 하나의 상태값 기준
const [contentStatus, setContentStatus] = useState(ContentStatus.기본);

<SwitchCase
  value={contentStatus}
  caseBy={{
    ContentStatus.수정중: ...,
    ContentStatus.보류중: ...,
    ContentStatus.기본: ...
  }}
/>

// ❌ 여러 상태값 조합
{!소재보류 && !소재수정 && (...)}
```

## Modal / Dialog

`overlay-kit`의 `overlay.open` 패턴을 사용한다. 컴포넌트 상태(`useState`)로 모달을 제어하지 않는다:

```tsx
import { overlay } from 'overlay-kit';
import { AlertDialog } from 'components/Dialog';

// ✅ overlay.open 패턴
const handleDeleteClick = () => {
  overlay.open(({ isOpen, close }) => (
    <AlertDialog
      isOpen={isOpen}
      close={close}
      title="삭제할까요?"
      description="삭제 후 복구할 수 없어요."
      onConfirm={async () => {
        await deleteMutation.mutateAsync(params);
        close();
      }}
    />
  ));
};

// ❌ useState로 모달 제어
const [isDialogOpen, setIsDialogOpen] = useState(false);
<Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
```

공용 `AlertDialog` (`components/Dialog.tsx`)를 우선 사용하고, 커스텀 모달이 필요한 경우에만 TDS `AlertDialog`를 직접 사용한다.

## A-B-A-B 분산 금지

관련 로직은 반드시 가까이 배치한다. 상태와 핸들러, 조회와 가공이 떨어져 있으면 즉시 모은다:

```tsx
// ❌ A-B-A-B — 관련 로직이 분산
const [month, setMonth] = useState(new Date());     // A: 월 선택
const { data } = useSuspenseQuery(query.list(month)); // B: 데이터 조회
const goPrevMonth = () => setMonth(prev => subMonths(prev, 1)); // A: 월 선택
const filteredData = data.filter(d => d.active);     // B: 데이터 가공

// ✅ 관련된 것끼리 묶음 — 컴포넌트로 추상화
<MonthSelector value={month} onChange={setMonth} />
<ConsumptionList month={month} />  // 내부에서 조회+가공 처리
```

**감지 기준:** 같은 상태/데이터를 다루는 코드가 다른 관심사 코드 사이에 끼어 있으면 A-B-A-B다.

## 분리 ≠ 추상화

커스텀 훅으로 추출했다고 추상화가 아니다. **사용처도 내부도 깔끔해져야** 진짜 추상화:

```tsx
// ❌ 분리만 한 훅 — return 값이 5개 이상이면 추상화 실패 의심
function useConsumptionPage() {
  const [month, setMonth] = useState();
  const { data, isError, refetch } = useQuery(...);
  const goPrevMonth = () => {};
  const goNextMonth = () => {};
  return { month, data, isError, refetch, goPrevMonth, goNextMonth };
}
// 접어놓고 "깔끔하다" → 수정하려면 훅 열어야 함

// ✅ 진짜 추상화 — 사용처가 HTML처럼 읽힘
<MonthSelector value={month} onChange={setMonth} />
const { data } = useSuspenseQuery(consumptionQuery.list(month));
```

**자가 진단:**
1. 훅의 return 값이 5개 이상인가? → 책임 과다, 분리 실패
2. 사용처에서 훅 내부를 알아야 쓸 수 있는가? → 추상화 실패
3. 훅을 제거하고 인라인으로 풀면 오히려 읽기 쉬운가? → 불필요한 분리

## useEffect 기명 함수

useEffect 콜백에는 기명 함수를 사용한다. 목적이 코드에 드러나야 한다:

```tsx
// ✅ 기명 함수 — 목적이 코드에 드러남
useEffect(function syncFormWithQuery() {
  form.reset(data);
}, [data]);

// ❌ 익명 함수 — 목적 파악에 코드 전체를 읽어야 함
useEffect(() => {
  form.reset(data);
}, [data]);
```

## Form 패턴 (react-hook-form)

useForm + handleSubmit + mutateAsync 조합을 사용한다:

```tsx
// ✅ useForm + handleSubmit + mutateAsync
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { name: '' },
});

const handleFormSubmit = form.handleSubmit(async (data) => {
  try {
    await createMutation.mutateAsync(data);
    showSuccessToast('등록 완료');
  } catch (error) {
    showApiErrorToast(error);
  }
});

// ❌ onSubmit에서 form.getValues() 사용
const handleSubmit = () => {
  const data = form.getValues();
  createMutation.mutate(data);
};
```

## TypeScript Enum 금지

enum은 트리셰이킹이 불가능하고 런타임 코드를 생성한다. `as const` 객체 또는 union type을 사용한다:

```typescript
// ❌ enum — 트리셰이킹 불가, 런타임 코드 생성
enum Status { Active = 'active', Inactive = 'inactive' }

// ✅ as const 객체 또는 union type
const Status = { Active: 'active', Inactive: 'inactive' } as const;
type Status = (typeof Status)[keyof typeof Status];
```

## Console.log

- No `console.log` statements in production code
- Use proper logging libraries instead
- See hooks for automatic detection
