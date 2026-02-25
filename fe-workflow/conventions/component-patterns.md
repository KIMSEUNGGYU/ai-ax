# 컴포넌트 패턴 컨벤션

> React 컴포넌트 작성 시 일관성과 가독성을 위한 규칙

---

## 1. 빈 렌더링: return null

컴포넌트에서 렌더링할 element가 없을 때 `return null`을 명시한다.

```tsx
// ✅
function Tooltip({ message }: Props) {
  if (message == null) return null;
  return <div>{message}</div>;
}

// ❌
function Tooltip({ message }: Props) {
  if (!message) return <></>;
}
```

---

## 2. 이벤트 핸들러 네이밍

이벤트 핸들러는 `handle{TargetName}{EventType}` 형태로 작성한다.

```tsx
// ✅
<Button onClick={handleButtonClick} onFocus={handleButtonFocus} />
<Input onChange={handleInputChange} onBlur={handleInputBlur} />

// ❌
<Button onClick={onClickButton} />
<Button onClick={clickHandler} />
<Button onClick={handleClick} />
```

**패턴:** `handle` + 대상(TargetName) + 이벤트(EventType)

| 대상 | 이벤트 | 핸들러 이름 |
|------|--------|------------|
| Button | Click | `handleButtonClick` |
| Form | Submit | `handleFormSubmit` |
| Input | Change | `handleInputChange` |
| Modal | Close | `handleModalClose` |

---

## 3. Props 구조분해할당

props를 bypass하는 경우가 아니라면 구조분해할당 한다.

```tsx
// ✅
interface Props { children: ReactNode; className?: string }

function Wrapper({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

// ❌ — props bypass가 필요할 때만 허용
function Wrapper(props: Props) {
  return <div {...props} />;
}
```

---

## 4. Boolean Props

boolean props는 `is`/`can`/`should` 접두어 없이, 명시적으로 `true`/`false` 값을 전달한다.

```tsx
// ✅
<TheBox open={true} clickable={false} animate={true} />
<Something open={true} />

// ❌
<TheBox isOpen={true} canClick={false} shouldAnimate={true} />
<Something open />  // true 생략 금지
```

**이유:** 접두어(`is`, `can`, `should`)는 구현 세부사항. 인터페이스는 HTML처럼 뻔하게.

---

## 5. 조건부 렌더링: 삼항 연산자

boolean이 아닌 값의 조건부 렌더링은 `&&` 대신 삼항 연산자를 사용한다.

```tsx
// ✅
return <section>{title != null ? <h1>{title}</h1> : null}</section>;
return <section>{count > 0 ? <Badge>{count}</Badge> : null}</section>;

// ❌ — 숫자 0, 빈 문자열 등이 의도치 않게 렌더링될 수 있음
return <section>{title && <h1>{title}</h1>}</section>;
return <section>{count && <Badge>{count}</Badge>}</section>;
```

**boolean 값은 `&&` 허용:**

```tsx
// ✅ — isOpen은 진짜 boolean
return <>{isOpen && <Modal />}</>;
```

---

## 6. 단일 상태 분기

복잡한 분기처리에서는 여러 상태값을 조합하지 않고 하나의 상태값만을 기준으로 처리한다.

```tsx
// ✅ — 하나의 status 상태로 분기
const [contentStatus, setContentStatus] = useState(ContentStatus.기본);

<SwitchCase
  value={contentStatus}
  caseBy={{
    [ContentStatus.수정중]: <EditForm />,
    [ContentStatus.보류중]: <HoldView />,
    [ContentStatus.기본]: <DefaultView />,
  }}
/>

// match-ts 패턴
const icon = match(severity)
  .with('success', () => 'icon-check-circle-green')
  .with('warning', () => 'icon-warning-circle')
  .with('error', () => 'icon-warning-circle-red')
  .with('info', () => 'icon-info-circle')
  .exhaustive();

// ❌ — 여러 boolean 조합으로 분기
const [isEditing, setIsEditing] = useBooleanState(false);
const [isHolding, setIsHolding] = useBooleanState(false);

{!isEditing && !isHolding && <DefaultView />}
{isEditing && <EditForm />}
{isHolding && <HoldView />}
```

**이유:** boolean 여러 개의 조합은 2^n 상태를 만들어 불가능한 상태가 생긴다.

---

## ✅ DO & ❌ DON'T

### ✅ DO
- 빈 렌더링은 `return null` 명시
- 이벤트 핸들러: `handle{Target}{Event}` 패턴
- props 구조분해할당 (bypass 제외)
- boolean props: 접두어 없이, `true`/`false` 명시
- 비-boolean 조건부 렌더링: 삼항 연산자
- 복잡한 상태 분기: 단일 상태 + SwitchCase/match

### ❌ DON'T
- `isOpen`, `canClick`, `shouldAnimate` 접두어 props
- `<Something open />` (true 생략)
- `{count && <Badge />}` (숫자/문자열 && 조건부 렌더링)
- 여러 boolean 상태 조합으로 분기
- `onClickButton`, `clickHandler` 등 비표준 핸들러 네이밍

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2026-02-26 | 컴포넌트 패턴 컨벤션 초판 (아이샵케어 컨벤션 기반) |
