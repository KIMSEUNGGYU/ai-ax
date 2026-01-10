---
name: fe-principles
description: 프론트엔드 코드 작성/리뷰/리팩토링 시 적용할 원칙. 코드 관련 작업에 자동 적용
allowed-tools: Read, Grep, Glob, Edit, Write
---

# 프론트엔드 코드 원칙

## 최상위 원칙: 변경에 용이한 코드

코드 작성/수정 시 항상 자문:
- "이 변경이 다른 곳에도 영향을 주는가?"
- "한 곳만 수정하면 되는가?"

## 폴더 구조 원칙

### Page First
로컬에서 시작 → 재사용 필요하면 상위로.

```
1단계: 페이지 로컬
src/pages/product-detail/
└── components/
    └── PriceSection.tsx

2단계: 실제 재사용 시 상위로
src/components/
└── PriceSection.tsx
```

### 지역성 (Locality)
함께 바뀌는 것끼리 가까이.

```
❌ components/, hooks/, types/ 왔다갔다
✅ features/user/ 한 폴더에서 완결
```

## API 패턴

### 네이밍
```typescript
// HTTP 메서드별 Prefix
fetch  → GET
post   → POST
update → PUT/PATCH
delete → DELETE

// 매개변수는 params로 통일
fetchUser(params: { id: string })
postUser(params: { name: string })
```

### 타입 정의
단건 조회 응답을 기준으로 정의, 나머지는 확장.

```typescript
interface User { id: string; name: string; email: string; }
type UserListItem = Omit<User, 'email'>;
type CreateUserParams = Pick<User, 'name' | 'email'>;
```

## React Query 패턴

### queryOptions 사용
```typescript
const userQueryOptions = {
  detail: (id: string) => queryOptions({
    queryKey: ['users', id],
    queryFn: () => fetchUser({ id }),
  })
};

// 사용
useQuery(userQueryOptions.detail('123'))
useSuspenseQuery(userQueryOptions.detail('123'))
```

### Suspense 기본
```typescript
// 기본: useSuspenseQuery
const { data } = useSuspenseQuery(...);
return <div>{data.name}</div>; // data 존재 보장

// useQuery는 placeholderData, 무한스크롤 등 특수 케이스만
```

## 에러 처리

### Exception vs Error State 구분
```typescript
// Exception: 예상 불가능 → throw
throw new AppError('Network', '네트워크 오류');

// Error State: 예상 가능 → 타입으로
type LoginResult =
  | { status: 'success'; token: string }
  | { status: 'error'; reason: 'invalid' | 'expired' };
```

### 구조적 타입 체크 (instanceof 대신)
```typescript
function isAppError(error: unknown): error is AppError {
  return error != null &&
         typeof error === 'object' &&
         (error as any)?.name === 'AppError';
}
```

## Form 패턴 (react-hook-form + Zod)

```typescript
// Zod 스키마
const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요')
});

// 타입 추론
type FormData = z.infer<typeof schema>;

// 훅 사용
const form = useForm<FormData>({
  resolver: zodResolver(schema)
});
```

## 추상화 시점

- 패턴이 **2-3번 반복**되었을 때만
- "나중에 필요할 것 같아서"는 **NO**
- 지금은 구체적으로, 패턴 보이면 그때 추상화
