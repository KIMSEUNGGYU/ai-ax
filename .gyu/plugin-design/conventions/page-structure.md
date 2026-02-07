# 페이지 구조 컨벤션

> 리스트 페이지와 상세 페이지의 조립 패턴

---

## 1. 공통 래핑 구조

### 페이지 컴포넌트 래핑 순서 (바깥 → 안쪽)

```typescript
<ClientOnly>
  <AuthGuard>              {/* 인증 필요 시 */}
    <ContextProvider>      {/* ID 등 전달 필요 시 */}
      <ErrorBoundary>      {/* 필요 시 */}
        <Suspense fallback={<Loading />}>
          <Content />
        </Suspense>
      </ErrorBoundary>
    </ContextProvider>
  </AuthGuard>
</ClientOnly>
```

### getLayout

```typescript
const FeaturePage: NextPageWithLayout<Props> = ({ id }) => {
  return (
    <ClientOnly>
      <Suspense fallback={<Loading />}>
        <Content />
      </Suspense>
    </ClientOnly>
  );
};

FeaturePage.getLayout = (page) => <Layout>{page}</Layout>;
export default FeaturePage;
```

### _app.tsx 프로바이더 계층

```
TDSMobileNextProvider → GlobalErrorBoundary → GlobalQueryClientProvider
→ NuqsAdapter → ToastOverlayProvider → OverlayProvider → {page}
```

---

## 2. 리스트 페이지

### 파일 구조

```
pages/[domain]/
├── index.tsx                    # 리내보내기
└── [domain]-list/
    ├── [Domain]ListPage.tsx     # 페이지 컴포넌트
    ├── components/
    │   ├── Filter.tsx           # 필터 UI
    │   ├── [Domain]Table.tsx    # 테이블 컨테이너
    │   ├── [Domain]TableBody.tsx
    │   ├── [Domain]TableRow.tsx
    │   └── EmptyTable.tsx
    ├── hooks/
    │   └── use[Domain]Filters.ts
    ├── queries/
    │   └── [domain].query.ts
    ├── remotes/
    │   └── [domain].ts
    ├── models/
    │   └── [domain].dto.ts
    └── constants/
        └── columns.ts
```

### 페이지 조립

```typescript
function Content() {
  const { filters } = useDomainFilters();
  const checkboxState = useTableCheckboxState<number>({ resetDeps: [filters] });

  return (
    <>
      <Filter />
      <DomainTable checkboxState={checkboxState} />
      <BulkActionButton checkboxState={checkboxState} />
    </>
  );
}
```

### 필터 패턴 (nuqs)

```typescript
// hooks/useDomainFilters.ts
export function useDomainFilters() {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(''),
    startDate: parseAsDate,
    endDate: parseAsDate,
    status: parseAsArrayOf(parseAsStringLiteral(STATUS_LIST)).withDefault([]),
  });

  const resetFilters = () => setFilters({
    search: null, startDate: null, endDate: null, status: null,
  });

  return { filters, setFilters, resetFilters };
}
```

### 검색 디바운스

```typescript
function Filter() {
  const { filters, setFilters } = useDomainFilters();
  const [localSearch, setLocalSearch] = useState(filters.search);

  const debouncedUpdateSearch = useDebounce(
    (search: string) => setFilters({ search }),
    500,
  );

  return (
    <SearchTextField
      value={localSearch}
      onChange={(e) => {
        setLocalSearch(e.target.value);       // 즉시 UI 반영
        debouncedUpdateSearch(e.target.value); // 지연 후 API
      }}
    />
  );
}
```

### 무한스크롤 테이블

```typescript
function DomainTable({ checkboxState }: Props) {
  const { filters } = useDomainFilters();

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useInfiniteQuery({
      ...domainQueries.infinite({ filters }),
      placeholderData: keepPreviousData,
    });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const allIds = items.map((item) => item.id);

  return (
    <ScrollArea orientation="both" maxHeight="calc(100vh - 252px)">
      <Table.Root
        head={<TableHeader checkboxState={checkboxState} allIds={allIds} />}
        body={
          isLoading ? (
            <TableInfiniteScrollLoader colSpan={COLUMNS.length} />
          ) : (
            <DomainTableBody
              items={items}
              checkboxState={checkboxState}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          )
        }
      />
    </ScrollArea>
  );
}
```

### 체크박스 선택 + 일괄 액션

```typescript
// useTableCheckboxState 사용
const checkboxState = useTableCheckboxState<number>({ resetDeps: [filters] });

// 헤더 전체선택
<Table.Checkbox
  checked={checkboxState.getHeaderCheckState(allIds.length)}
  onCheckedChange={(checked) => checkboxState.toggleAll(allIds, checked)}
/>

// 행 개별선택
<Table.Checkbox
  checked={checkboxState.isChecked(item.id)}
  onCheckedChange={(checked) => checkboxState.toggleItem(item.id, checked)}
/>

// 일괄 액션
function BulkActionButton({ checkboxState }: Props) {
  const handleClick = () => {
    if (checkboxState.checkedCount === 0) {
      showWarningToast('1개 이상 선택해주세요.');
      return;
    }
    overlay.open(({ isOpen, close }) => (
      <ActionModal checkboxState={checkboxState} isOpen={isOpen} onClose={close} />
    ));
  };

  return <Button onClick={handleClick}>일괄 처리</Button>;
}
```

### 빈 상태

```typescript
function DomainTableBody({ items, ... }: Props) {
  if (is.emptyArray(items)) {
    return <EmptyTable colSpan={COLUMNS.length} title="데이터가 없어요" />;
  }

  return (
    <>
      {items.map((item) => <DomainTableRow key={item.id} item={item} />)}
      {hasNextPage && (
        <tr>
          <Table.Cell colSpan={COLUMNS.length} css={{ padding: 0 }}>
            <InfiniteScrollLoader
              enabled={is.falsy(isFetchingNextPage)}
              callback={fetchNextPage}
            />
          </Table.Cell>
        </tr>
      )}
    </>
  );
}
```

---

## 3. 상세 페이지

### 파일 구조

```
pages/[domain]/
├── [id].tsx                     # 동적 라우트
└── [domain]-detail/
    ├── [Domain]DetailPage.tsx   # getServerSideProps 포함
    ├── components/
    │   ├── SectionA.tsx         # 도메인별 섹션
    │   ├── SectionB.tsx
    │   └── ActionModal.tsx
    ├── contexts/
    │   └── [Domain]IdContext.tsx
    ├── hooks/
    ├── queries/
    ├── remotes/
    └── models/
```

### getServerSideProps

```typescript
interface Props {
  featureId: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params as { id: string };

  if (is.emptyString(id) || is.nan(Number(id))) {
    return { notFound: true };
  }

  return { props: { featureId: id } };
};
```

### Context로 ID 전파

```typescript
// contexts/FeatureIdContext.tsx
const FeatureIdContext = createContext<string>('');

export function FeatureIdProvider({ value, children }: Props) {
  return (
    <FeatureIdContext.Provider value={value}>
      {children}
    </FeatureIdContext.Provider>
  );
}

export function useFeatureId() {
  const context = useContext(FeatureIdContext);
  if (is.nullOrUndefined(context) || is.emptyString(context)) {
    throw new Error('Provider 안에서 사용해 주세요');
  }
  return context;
}
```

### 페이지 조립

```typescript
const DetailPage: NextPageWithLayout<Props> = ({ featureId }) => {
  return (
    <ClientOnly>
      <FeatureIdProvider value={featureId}>
        <Suspense fallback={<Loading />}>
          <Content />
        </Suspense>
      </FeatureIdProvider>
    </ClientOnly>
  );
};

function Content() {
  const featureId = useFeatureId();
  const { data } = useSuspenseQuery(featureQuery.detail(featureId));

  return (
    <>
      <MerchantInfo merchant={data.merchant} />
      <Spacing size={24} />
      <BusinessInfo business={data.business} />
      <Spacing size={24} />
      <DeviceInfo devices={data.devices} />
    </>
  );
}
```

### 섹션 분리 기준

| 기준 | 예시 |
|------|------|
| **도메인** | `MerchantInfo`, `BusinessInfo`, `DeviceInfo` |
| **기능** | 읽기 전용 섹션 vs 수정 가능 섹션 |
| **시각적** | `<Spacing size={24} />`로 구획 분리 |

### 액션 처리

```typescript
// 수정: 네비게이션
<Button onClick={() => router.push(`/merchants/${id}/edit`)}>수정</Button>

// 삭제/등록: 모달
const handleAction = () => {
  overlay.open(({ isOpen, close }) => (
    <ActionModal isOpen={isOpen} onClose={close} featureId={featureId} />
  ));
};
```

---

## ✅ DO & ❌ DON'T

### ✅ DO
- 리스트: `useInfiniteQuery` + `keepPreviousData` + `InfiniteScrollLoader`
- 리스트: 필터 변경 시 체크박스 자동 초기화 (`resetDeps`)
- 리스트: 검색은 로컬 상태 + 디바운스로 처리
- 상세: `getServerSideProps`에서 params 검증 후 `notFound` 처리
- 상세: Context로 ID 전파, 자식에서 `useFeatureId()` 사용
- 상세: 섹션은 도메인 단위로 분리

### ❌ DON'T
- 리스트에서 `useQuery` + 수동 페이지네이션
- 필터를 `useState`로만 관리 (URL 동기화 안 됨)
- 상세 페이지에서 ID를 Props drilling으로 전달
- Content 컴포넌트 없이 페이지에서 직접 데이터 조회

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2025-02-05 | 페이지 구조 컨벤션 초안 |
