# 컴포넌트 설계 컨벤션

> 컴포넌트 분리 기준, Props 설계, 훅, 스타일링 패턴
> 페이지 조립 패턴은 → [`page-structure.md`](./page-structure.md) 참조

---

## 1. 페이지 내 컴포넌트 구조

### Page First 원칙

컴포넌트는 **페이지 폴더 내부에** 정의. 재사용 시에만 `src/components/`로 상향.

```
pages/[domain]/[feature]/
├── [FeaturePage].tsx         # 페이지 컴포넌트 (진입점)
├── components/               # 페이지 전용 컴포넌트
│   ├── SectionA.tsx
│   ├── SectionB.tsx
│   └── SomeModal.tsx
├── hooks/                    # 페이지 전용 훅
│   └── useFeatureFilters.ts
├── contexts/                 # 페이지 전용 Context (필요시)
│   └── FeatureContext.tsx
├── models/                   # 서버 API 타입 (DTO)
├── types/                    # 클라이언트 타입 + Zod 스키마
├── remotes/                  # API 함수
├── queries/                  # queryOptions
└── mutations/                # mutationOptions
```

### 컴포넌트 위치 결정

| 상황 | 위치 |
|------|------|
| 한 페이지에서만 사용 | `pages/[domain]/[feature]/components/` |
| 2개 이상 페이지에서 사용 | `src/components/` |
| 전역 인프라 (AuthGuard, Layout 등) | `src/components/` |

---

## 2. Props 설계

### 타입 정의

```typescript
// ✅ interface Props 사용
interface Props {
  documentTask: DocumentTaskDetail['documentTask'];
  onClose?: () => void;
}

// ✅ DTO에서 직접 추출 (SSOT)
interface Props {
  van: Van;
  vanSettings: NonNullable<MerchantDetail['vanSettings']>;
  devices: NonNullable<MerchantDetail['devices']>;
}

// ✅ 기존 컴포넌트 Props 확장
interface Props extends ModalProps {
  merchantId: string;
}
```

### Props 규칙

| 규칙 | 설명 |
|------|------|
| **SSOT** | 서버 타입에서 직접 추출 (`Detail['field']`) |
| **이벤트** | `onAction` 패턴 (`onClose`, `onSubmit`, `onNavigate`) |
| **선택적** | 불필요한 Props는 `?` 처리 |
| **네이밍** | `interface Props` (파일당 1개일 때) |

### 금지 패턴

```typescript
// ❌ Props를 풀어서 전달
<TaskInfo
  id={data.documentTask.id}
  status={data.documentTask.status}
  assignee={data.documentTask.assignee}
/>

// ✅ 객체로 전달
<TaskInfo documentTask={data.documentTask} />
```

---

## 3. 상태 관리 우선순위

| 순위 | 종류 | 용도 |
|------|------|------|
| 1 | **URL 상태** (nuqs) | 필터, 검색, 페이지네이션 |
| 2 | **Server State** (React Query) | 서버 데이터 조회/변경 |
| 3 | **Context** | prop drilling 방지, 페이지 내 공유 |
| 4 | **useState** | 모달 열림/닫힘, 임시 입력값 |

> 각 상태의 구체적 구현 패턴은 → [`page-structure.md`](./page-structure.md) 참조

---

## 4. 비동기 처리 원칙

### 선언적 (필수)

```typescript
// ✅ Suspense + useSuspenseQuery
<Suspense fallback={<Loading />}>
  <Content />
</Suspense>

function Content() {
  const { data } = useSuspenseQuery(queries.detail(id));
  return <div>{data.name}</div>;
}
```

### 명령형 금지

```typescript
// ❌
function Component() {
  const { data, isLoading, error } = useQuery();
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <div>{data.name}</div>;
}
```

> 래핑 순서, SuspenseQuery 등 구체 패턴은 → [`page-structure.md`](./page-structure.md) 참조

---

## 5. 모달/오버레이 패턴

### overlay-kit 사용

```typescript
import { overlay } from 'overlay-kit';

const handleOpenModal = () => {
  overlay.open(({ isOpen, close }) => (
    <RegistrationModal
      isOpen={isOpen}
      onClose={close}
      merchantId={merchantId}
    />
  ));
};
```

### 모달 컴포넌트 구조

```typescript
interface Props {
  isOpen: boolean;
  onClose: () => void;
  // 도메인 Props
  merchantId: string;
}

export function RegistrationModal({ isOpen, onClose, merchantId }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutateAsync } = useMutation(mutation.create());

  const handleSubmit = async (formData: FormData) => {
    try {
      await mutateAsync(formData);
      showSuccessToast('등록 완료');
      onClose();
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* 폼 필드 */}
        </form>
      </FormProvider>
    </Modal>
  );
}
```

---

## 6. 커스텀 훅 패턴

### 분류 및 위치

| 유형 | 위치 | 네이밍 |
|------|------|--------|
| 비즈니스 로직 | 페이지 `hooks/` | `use[Domain]Filters` |
| 데이터 조회 래퍼 | 페이지 `hooks/` | `useFetch[Domain]` |
| UI 상태 | 로컬 또는 `hooks/` | `use[UIState]` |
| 전역 재사용 | `src/hooks/` | `use[Feature]` |

### useEffect 기명 함수 필수

```typescript
// ✅ 기명 함수
useEffect(function syncLocalSearch() {
  setLocalSearch(filters.search);
}, [filters.search]);

// ❌ 익명 함수
useEffect(() => {
  setLocalSearch(filters.search);
}, [filters.search]);
```

---

## 7. 조건부 렌더링

### match 패턴 (ts-pattern)

```typescript
import { match } from 'ts-pattern';

// 상태별 분기
{match(status)
  .with('pending', () => <FixedBottomCTA>업무 시작</FixedBottomCTA>)
  .with('in_progress', () => <TaskNoteSection />)
  .with('completed', () => <TaskLogSection />)
  .exhaustive()}

// VAN별 폼 분기
{match(van)
  .with('NICE 정보통신', '스마트로', () => (
    <>
      <SerialNumberField />
      <TidSelectField />
    </>
  ))
  .exhaustive()}
```

---

## 8. 스타일링

### TDS 컴포넌트 우선

```typescript
// ✅ TDS 컴포넌트
<Flex direction="column" gap={16}>
  <Spacing size={24} />
  <Table.Root>...</Table.Root>
  <Button size="medium">확인</Button>
</Flex>

// ❌ 커스텀 HTML
<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
```

### Emotion 사용 (TDS로 부족할 때만)

```typescript
// css prop
<ScrollArea css={{ padding: '0 40px', flex: 1 }} />

// styled (복잡한 스타일)
const Container = styled.div({
  width: '100%',
  maxWidth: 640,
  padding: '32px 40px',
});
```

---

## ✅ DO & ❌ DON'T

### ✅ DO
- Page First: 컴포넌트는 페이지 폴더 내부에 정의
- Props는 DTO에서 직접 추출 (SSOT)
- Suspense + useSuspenseQuery로 선언적 비동기 처리
- useEffect는 기명 함수로 정의
- overlay-kit으로 모달 관리
- ts-pattern의 match로 조건부 렌더링

### ❌ DON'T
- 명령형 로딩/에러 분기 (`if (isLoading)`)
- Props를 개별 필드로 풀어서 전달
- 페이지 외부에서만 사용하는 컴포넌트를 `src/components/`에 배치
- useEffect에 익명 함수 사용
- TDS 컴포넌트로 가능한 것을 커스텀 HTML로 작성

---

## 버전 히스토리

| 버전 | 날짜 | 변경사항 |
|------|------|----------|
| 1.0.0 | 2025-02-05 | 컴포넌트 설계 컨벤션 초안 |
| 1.1.0 | 2025-02-05 | 페이지 패턴 중복 제거, page-structure.md로 위임 |
