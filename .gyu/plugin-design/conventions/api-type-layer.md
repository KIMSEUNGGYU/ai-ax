# API/타입 계층 컨벤션

> 서버 통신부터 타입 정의까지의 계층 구조와 컨벤션

---

## 페이지 내 폴더 구조

```
pages/[page]/
├── models/              # 서버 API 타입 (DTO)
│   └── [domain].dto.ts
├── types/               # 클라이언트 타입 + Zod 스키마
│   ├── [domain].ts
│   └── [domain].schema.ts
├── remotes/             # API 함수
│   └── [domain].ts
├── queries/             # React Query 조회
│   └── [domain].query.ts
├── mutations/           # React Query 변경
│   └── [domain].mutation.ts
├── hooks/
│   └── use[Action].ts
├── components/
└── constants/
```

### 폴더 역할

| 폴더 | 역할 | 파일명 |
|------|------|--------|
| `models/` | 서버 API 타입 (DTO) | `[domain].dto.ts` |
| `types/` | 클라이언트 타입 | `[domain].ts` |
| `types/` | Zod 검증 스키마 | `[domain].schema.ts` |
| `remotes/` | API 함수 (순수 네트워크) | `[domain].ts` |
| `queries/` | queryOptions 정의 | `[domain].query.ts` |
| `mutations/` | mutationOptions 정의 | `[domain].mutation.ts` |

---

## 1. Remotes (API 함수)

### 네이밍

| Prefix | HTTP Method | 예시 |
|--------|-------------|------|
| `fetch` | GET | `fetchMerchantDetail` |
| `post` | POST | `postMerchant` |
| `update` | PUT/PATCH | `updateMerchant` |
| `delete` | DELETE | `deleteTid` |

### 파라미터: 항상 객체

```typescript
// ✅ Good: 항상 객체 파라미터
export const fetchMerchantDetail = (params: { merchantId: string }) => {
  return httpClient.get<MerchantDetail>(`merchants/${params.merchantId}`);
};

export const updateMerchant = (params: UpdateMerchantParam) => {
  const { merchantId, ...payload } = params;
  return httpClient.patch(`merchants/${merchantId}`, { json: payload });
};

// ❌ Bad: 개별 인자
export const fetchMerchantDetail = (merchantId: string) => { ... };
```

### HttpClient 래퍼 사용

```typescript
// httpClient는 ApiResponse<T> 언래핑을 자동 처리
const data = await httpClient.get<MerchantDetail>('merchants/123');
// data는 이미 MerchantDetail 타입 (success 필드 추출됨)
```

---

## 2. Queries

### queryOptions 패턴

```typescript
// queries/merchant.query.ts
import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { fetchMerchantDetail, fetchMerchantList } from '../remotes/merchant';

const merchantKeys = {
  all: ['merchant'] as const,
  list: (filters: MerchantFilters) => [...merchantKeys.all, 'list', filters] as const,
  infinite: (filters: MerchantFilters) => [...merchantKeys.all, 'infinite', filters] as const,
  detail: (merchantId: string) => [...merchantKeys.all, 'detail', merchantId] as const,
};

export const merchantQuery = {
  // list: 일반 리스트 조회
  list: (filters: MerchantFilters) =>
    queryOptions({
      queryKey: merchantKeys.list(filters),
      queryFn: () => fetchMerchantList({ filters }),
    }),
  // infinite: 무한스크롤용
  infinite: (filters: MerchantFilters) =>
    infiniteQueryOptions({
      queryKey: merchantKeys.infinite(filters),
      queryFn: ({ pageParam }) =>
        fetchMerchantList({ filters, cursor: pageParam }),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) => lastPage?.cursor,
    }),
  detail: (merchantId: string) =>
    queryOptions({
      queryKey: merchantKeys.detail(merchantId),
      queryFn: () => fetchMerchantDetail({ merchantId }),
    }),
};
```

### queryKey 규칙

- **수동 관리** (`as const`로 타입 보존)
- **위치**: 페이지 전용이면 query 파일에 같이, 여러 페이지에서 공유하면 `shared/queryKey.ts`
- **구조**: 계층적 (`['domain', 'action', params]`)
- **list vs infinite**: 같은 API라도 queryKey를 분리하여 독립적으로 invalidate 가능

### 사용

```typescript
// useSuspenseQuery 기본
const { data } = useSuspenseQuery(merchantQuery.detail(merchantId));

// 무한스크롤
const { data, fetchNextPage } = useSuspenseInfiniteQuery(merchantQuery.infinite(filters));

// useQuery는 placeholderData 등 특수 케이스만
```

---

## 3. Mutations

### mutationOptions 팩토리 (객체 패턴)

```typescript
// mutations/merchant.mutation.ts
import { mutationOptions, useQueryClient } from '@tanstack/react-query';
import { postMerchant, updateMerchant, deleteMerchant } from '../remotes/merchant';

export const merchantMutation = {
  create: () => {
    const queryClient = useQueryClient();
    return mutationOptions({
      mutationFn: postMerchant,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.all });
      },
    });
  },
  update: () => {
    const queryClient = useQueryClient();
    return mutationOptions({
      mutationFn: updateMerchant,
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.detail(params.merchantId) });
      },
    });
  },
};
```

### 컴포넌트에서 사용: mutateAsync + try-catch

```typescript
const { mutateAsync: createMerchant } = useMutation(merchantMutation.create());

const handleSubmit = async (formData: CreateMerchantFormData) => {
  try {
    await createMerchant(formData);
    showSuccessToast('등록 완료');
  } catch (error) {
    showErrorToast(error);
  }
};
```

### 규칙

- **mutateAsync 선호** (mutate 대신)
- **invalidateQueries**: mutationOptions의 `onSuccess`에서 처리
- **에러 처리**: 컴포넌트의 try-catch에서 처리
- **UI 피드백** (toast 등): 컴포넌트에서 처리

---

## 4. 타입 정의

### interface vs type

- **interface 기본**: API 응답, 엔티티, 파라미터
- **type**: union, intersection 필요할 때만

```typescript
// ✅ interface: 서버 DTO, 엔티티
interface MerchantDetail {
  id: number;
  name: string;
  van: Van;
}

// ✅ type: 판별 유니온
type TidRegistrationForm =
  | { van: 'NICE'; data: TidOnlyForm }
  | { van: 'KIS'; data: KisForm };
```

### 서버 타입 (models/)

```typescript
// models/merchant.dto.ts
// 서버 API 응답/요청 타입

interface MerchantDetailResponse {
  id: number;
  name: string;
  businessNumber: string;
}

interface MerchantListResponse {
  cursor?: number;
  totalCount: number;
  items: MerchantDetailResponse[];
}

interface CreateMerchantParam {
  name: string;
  businessNumber: string;
}

interface UpdateMerchantParam {
  merchantId: string;
  name: string;
}
```

### 네이밍

| 용도 | 접미사 | 예시 |
|------|--------|------|
| API 응답 | `Response` | `MerchantListResponse` |
| API 요청 | `Param` | `CreateMerchantParam` |
| 엔티티 | 명사 | `Merchant`, `User` |
| 폼 데이터 | `FormData` | `TidRegistrationFormData` |

### 클라이언트 타입 (types/)

```typescript
// types/merchant.ts
// 클라이언트에서만 사용하는 타입

type MerchantStatus = 'active' | 'inactive' | 'pending';

interface MerchantFilters {
  search: string;
  status: MerchantStatus[];
}
```

### Zod 스키마 (types/)

```typescript
// types/merchant.schema.ts
// 클라이언트 validate 시 사용 (주로 Form)

import { z } from 'zod';

const businessNumberSchema = z.string().length(10, '사업자번호 10자리');

export const createMerchantSchema = z.object({
  name: z.string().min(1, '필수'),
  businessNumber: businessNumberSchema,
});

export type CreateMerchantFormData = z.infer<typeof createMerchantSchema>;
```

### 유틸리티 타입 활용

```typescript
// 서버 응답에서 파생
type VanSetting = NonNullable<MerchantDetail['vanSettings']>[number];

// Pick/Omit
type MerchantListItem = Pick<MerchantDetail, 'id' | 'name' | 'van'>;

// transformer가 필요한 경우 (클라이언트-서버 형태가 많이 다를 때)
// types/merchant.transformer.ts 또는 해당 파일 내에서 처리
```

---

## 5. 데이터 흐름 요약

```
[서버] ← remotes/ (fetch/post/update/delete)
           ↓
       models/ (DTO 타입 정의)
           ↓
       queries/ (queryOptions) ←→ mutations/ (mutationOptions)
           ↓                          ↓
       hooks/ (비즈니스 로직)
           ↓
       components/ (UI)
           ↑
       types/ (클라이언트 타입 + Zod 스키마)
```

---

## ✅ DO & ❌ DON'T

### ✅ DO
- remote 함수 파라미터는 항상 객체로 받기
- queryKey는 `as const`로 타입 보존
- mutationOptions의 onSuccess에서 invalidateQueries 처리
- mutateAsync + try-catch로 에러 처리
- 서버 타입(DTO)과 클라이언트 타입 분리

### ❌ DON'T
- remote 함수에서 개별 인자 받기
- queryKey를 문자열 하드코딩하기
- 컴포넌트에서 직접 queryClient.invalidateQueries 호출하기
- mutate + onSuccess/onError 콜백 패턴 사용하기
- 서버 응답 타입에 클라이언트 전용 필드 추가하기

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2025-02-05 | API/타입 계층 컨벤션 초안 |
