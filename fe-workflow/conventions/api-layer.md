# API 계층 컨벤션

> API 호출부터 캐싱, 타입 정의까지의 패턴과 규칙

---

## 1. Remotes (API 함수)

> 순수 네트워크 호출만. 비즈니스 로직/UI 피드백 포함 금지.

### 규칙

- API 호출은 httpClient를 통해서만 (직접 fetch/ky 호출 금지)
- 순수 네트워크 호출만. 비즈니스 로직/UI 피드백 포함 금지

### 네이밍

| Prefix | HTTP Method | 예시 |
|--------|-------------|------|
| `fetch` | GET | `fetchMerchantDetail` |
| `post` | POST | `postMerchant` |
| `update` | PUT/PATCH | `updateMerchant` |
| `delete` | DELETE | `deleteTid` |

### 파라미터: 항상 `*Params` 타입 객체

```typescript
// ✅ *Params 타입으로 정의, 항상 객체 파라미터
export const fetchMerchantDetail = (params: FetchMerchantDetailParams) => {
  return httpClient.get<MerchantDetail>(`merchants/${params.merchantId}`);
};

export const updateMerchant = (params: UpdateMerchantParams) => {
  const { merchantId, ...payload } = params;
  return httpClient.patch(`merchants/${merchantId}`, { json: payload });
};

// ❌ 인라인 타입, 개별 인자
export const fetchMerchantDetail = (merchantId: string) => { ... };
```

### 공통 페이지네이션 타입

```typescript
// lib/types/pagination.ts
/** Cursor 기반 무한 스크롤 페이지네이션 파라미터 */
export interface CursorPaginationParams {
  cursor?: number;
  limit?: number;
}

export interface CursorPaginationResponse<T> {
  cursor?: number;
  items: T[];
}
```

### SearchParamsBuilder (GET 리스트)

```typescript
// models/branch.dto.ts
interface FetchBranchListParams extends CursorPaginationParams {
  filters: BranchFilters;
}

// remotes/branch.ts
export const fetchBranchList = (params: FetchBranchListParams) => {
  const { filters, cursor } = params;
  const searchParams = new SearchParamsBuilder()
    .append('search', filters.search ?? '')
    .appendArray('van', filters.van)
    .append('cursor', cursor?.toString() ?? '')
    .build();

  return httpClient.get<CursorPaginationResponse<Branch>>('agencies', { searchParams });
};
```

---

## 2. Queries

> queryOptions 팩토리 패턴. queryKey는 계층적으로 수동 관리.

### queryOptions 패턴

```typescript
// queries/merchant.query.ts
const merchantKeys = {
  all: ['merchant'] as const,
  list: (filters: MerchantFilters) => [...merchantKeys.all, 'list', filters] as const,
  infinite: (filters: MerchantFilters) => [...merchantKeys.all, 'infinite', filters] as const,
  detail: (merchantId: string) => [...merchantKeys.all, 'detail', merchantId] as const,
};

export const merchantQuery = {
  list: (filters: MerchantFilters) =>
    queryOptions({
      queryKey: merchantKeys.list(filters),
      queryFn: () => fetchMerchantList({ filters }),
    }),
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

- `as const`로 타입 보존
- 계층적 구조: `['domain', 'action', params]`
- list: 일반 API 조회, infinite: 커서 기반 페이지네이션 → queryKey 분리하여 독립 invalidate

### staleTime / gcTime

```typescript
// 자주 바뀌지 않는 데이터: staleTime 설정
queryOptions({
  queryKey: merchantKeys.statusList(),
  queryFn: fetchMerchantStatusList,
  staleTime: 24 * 60 * 60 * 1000, // 1일간 fresh
});

// 기본값 (staleTime: 0)은 포커스 이동마다 refetch → 대부분 설정 필요
```

| 옵션 | 역할 |
|------|------|
| staleTime | 데이터 신선도 기준. 이 시간 내엔 refetch 안 함 |
| gcTime | 메모리 캐시 유지 시간. unmount 후에도 캐시 유지 |

### normalizeFilters (배열 필터 캐시 효율)

```typescript
// 배열 필터의 순서 차이로 인한 캐시 미스 방지
queryOptions({
  queryKey: ['tasks', 'list', normalizeFilters(filters, ['status', 'assignee'])],
  queryFn: () => getTaskList(filters),
});
```

- 배열 정렬(`['DONE', 'TODO']` = `['TODO', 'DONE']`) → 중복 캐시 방지

### Suspense 패턴

```typescript
// 기본: useSuspenseQuery (데이터 존재 보장)
function Content() {
  const { data } = useSuspenseQuery(merchantQuery.detail(merchantId));
  return <div>{data.name}</div>; // data는 항상 존재
}

// 상위에서 래핑
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Loading />}>
    <Content />
  </Suspense>
</ErrorBoundary>
```

**useQuery가 필요한 경우:**
- `placeholderData: keepPreviousData` — 페이지 전환 시 깜빡임 방지
- 무한스크롤 — `isFetchingNextPage`로 부분 로딩 표시

---

## 3. Mutations

> mutationOptions에서 캐시 무효화만. toast/네비게이션은 컴포넌트에서.

### mutationOptions 팩토리

```typescript
// mutations/merchant.mutation.ts
import { queryClient } from 'lib/queryClient';

export const merchantMutation = {
  create: () =>
    mutationOptions({
      mutationFn: postMerchant,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.all });
      },
    }),
  update: () =>
    mutationOptions({
      mutationFn: updateMerchant,
      onSuccess: (_, params) => {
        queryClient.invalidateQueries({ queryKey: merchantKeys.detail(params.merchantId) });
      },
    }),
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

- **mutateAsync 선호** — mutate는 콜백 패턴(`onSuccess`/`onError`)으로 가독성 저하
- **invalidateQueries**: mutationOptions의 `onSuccess`에서 처리
- **에러 처리**: 컴포넌트의 try-catch에서 처리
- **UI 피드백** (toast 등): 컴포넌트에서 처리

---

## 4. 타입 정의

> 서버 타입(models/)과 클라이언트 타입(types/)을 분리한다.

### interface vs type

- **interface 기본**: API 응답, 엔티티, 파라미터, 객체 형태
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

**파일 단위:** 도메인별 한 파일 (`[domain].dto.ts`)

**파일 내 순서:** 공통 타입 → API 엔드포인트별 그룹 (주석 구분)

```typescript
// models/merchant.dto.ts

// ── 공통 ──
type MerchantStatus = 'active' | 'inactive';

// ── GET /merchants (리스트) ──
interface FetchMerchantListParams extends CursorPaginationParams {
  filters: MerchantFilters;
}

interface MerchantListItem {
  id: number;
  name: string;
  status: MerchantStatus;
}

interface MerchantListResponse extends CursorPaginationResponse<MerchantListItem> {
  totalCount: number;
}

// ── GET /merchants/:id (상세) ──
interface FetchMerchantDetailParams {
  merchantId: string;
}

interface MerchantDetail {
  id: number;
  name: string;
  businessNumber: string;
  van: Van;
}

// ── POST /merchants (생성) ──
interface CreateMerchantParams {
  name: string;
  businessNumber: string;
}

// ── PUT /merchants/:id (수정) ──
interface UpdateMerchantParams {
  merchantId: string;
  name?: string;
}
```

### 파생 규칙

- 스키마가 겹치면 → `Omit`/`Pick`/`NonNullable`로 파생
- 스키마가 다르면 (List ≠ Detail) → 각각 독립 정의

```typescript
// ✅ 스키마 겹침 → 파생
type MerchantListItem = Pick<MerchantDetail, 'id' | 'name' | 'van'>;
type VanSetting = NonNullable<MerchantDetail['vanSettings']>[number];

// ✅ 스키마 다름 → 독립 정의
interface MerchantListItem { ... }   // List API 전용 스키마
interface MerchantDetail { ... }     // Detail API 전용 스키마
```

### 네이밍

| 용도 | 패턴 | 예시 |
|------|------|------|
| 조회 요청 | `Fetch*Params` | `FetchMerchantDetailParams` |
| POST | `Post*Params` | `PostMerchantParams` |
| PUT/PATCH | `Update*Params` | `UpdateMerchantParams` |
| DELETE | `Delete*Params` | `DeleteTidParams` |
| 응답 | `*Response` | `MerchantListResponse` |
| 엔티티 | 명사 | `MerchantDetail`, `MerchantListItem` |

> `*Params` 타입은 remotes 네이밍을 따른다. Queries/Mutations 팩토리 **메서드명**만 유의미한 이름 사용 가능 (예: `create`, `update`).

### Zod 스키마 (types/)

```typescript
// types/merchant.schema.ts
const businessNumberSchema = z.string().length(10, '사업자번호 10자리');

export const createMerchantSchema = z.object({
  name: z.string().min(1, '필수'),
  businessNumber: businessNumberSchema,
});

// 타입은 스키마에서 파생 (별도 정의 금지)
export type CreateMerchantFormData = z.infer<typeof createMerchantSchema>;
```

### 유틸리티 타입 활용

```typescript
// 서버 응답에서 파생
type VanSetting = NonNullable<MerchantDetail['vanSettings']>[number];

// Pick/Omit
type MerchantListItem = Pick<MerchantDetail, 'id' | 'name' | 'van'>;
```

---

## 5. 개발 순서

API 관련 코드 작성 시 아래 순서로 정의한다.

```
1. models/   → DTO 타입 정의 (Request/Response)
2. remotes/  → API 함수 정의 (httpClient 사용)
3. queries/  → queryOptions 정의 (조회)
   mutations/ → mutationOptions 정의 (변경)
4. types/    → 클라이언트 타입 + Zod 스키마 (필요 시)
```

---

## ✅ DO & ❌ DON'T

### ✅ DO
- remote 함수 파라미터는 항상 객체로 받기
- queryKey는 `as const`로 타입 보존
- mutationOptions의 onSuccess에서 invalidateQueries 처리
- mutateAsync + try-catch로 에러 처리
- 서버 타입(DTO)과 클라이언트 타입 분리
- staleTime 설정으로 불필요한 refetch 방지
- normalizeFilters로 캐시 효율 관리
- useSuspenseQuery 기본 사용

### ❌ DON'T
- remote 함수에서 개별 인자 받기
- queryKey를 문자열 하드코딩하기
- 컴포넌트에서 직접 queryClient.invalidateQueries 호출하기
- mutate + onSuccess/onError 콜백 패턴 사용하기
- 서버 응답 타입에 클라이언트 전용 필드 추가하기
- staleTime 없이 기본값(0) 사용 (포커스마다 refetch)

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2025-02-05 | API/타입 계층 컨벤션 초안 |
| 2.0.0 | 2026-02-08 | HttpClient 래퍼, staleTime, normalizeFilters, Suspense 추가 |
| 2.1.0 | 2026-02-08 | 톤 정리 — 폴더 구조 중복 제거, HttpClient 구현→규칙 축소, VO/SSR 제거, SearchParamsBuilder 추가, mutations 실제 패턴 반영 |
