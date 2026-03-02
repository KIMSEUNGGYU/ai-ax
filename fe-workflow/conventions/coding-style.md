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

## Console.log

- No `console.log` statements in production code
- Use proper logging libraries instead
- See hooks for automatic detection
