---
name: fe-principles
description: 프론트엔드 코드 작성/리뷰/리팩토링 시 적용할 원칙. 코드 관련 작업에 자동 적용
allowed-tools: Read, Grep, Glob, Edit, Write
---

# 프론트엔드 코드 원칙

> 상세 패턴/예시는 `fe-workflow/conventions/` 참조

## 코드 철학

| 우선순위 | 원칙 | 핵심 |
|----------|------|------|
| 1 | **변경 용이성** | 한 종류 변경 = 한 곳에서 끝 |
| 2 | **SSOT** | 정의 1곳, 사용 여러 곳 |
| 3 | **SRP** | 변경 이유 하나 |
| 4 | **응집도↑ 결합도↓** | 함께 바뀌는 것끼리, Page First |
| 5 | **선언적** | What 선언, How는 하위로 |
| 6 | **추상화** | 레벨 일치, 2-3번 반복 후 추상화 |
| 7 | **가독성** | 의도 드러나는 이름, 조기 반환 |

→ 상세: `conventions/code-principles.md`

## 금지 패턴

- 이른 추상화/파일 추출/상수 추출
- any 타입
- useEffect 익명 함수
- 명령형 로딩/에러 분기 (`if (isLoading)`)
- instanceof 에러 판별

## 폴더 구조

- **지역성**: 파일은 사용되는 곳 가까이
- **Page First**: 로컬 → 재사용 시 상위로
- `models/` = 서버 타입(DTO), `types/` = 클라이언트 타입
- `modules/` = UI + 로직 + 상태 묶음 (여러 페이지 재사용)
- `_common/` = 도메인 내 형제 페이지 간 공유

→ 상세: `conventions/folder-structure.md`

## API 패턴

```typescript
// 네이밍: fetch/post/update/delete + 명사
// 파라미터: 항상 객체
fetchUser(params: { id: string })
postUser(params: { name: string })
```

- HttpClient 래퍼로 응답 구조 자동 언래핑
- 타입: 기준 타입(GET 단건) → Omit/Pick으로 확장
- VO 패턴: 복잡한 계산 로직 캡슐화 (선택)

→ 상세: `conventions/api-type-layer.md`

## React Query

```typescript
// queryOptions 패턴
const userQuery = {
  detail: (id: string) => queryOptions({
    queryKey: ['users', id],
    queryFn: () => fetchUser({ id }),
  })
};

// 사용: useSuspenseQuery 기본
const { data } = useSuspenseQuery(userQuery.detail('123'));
```

- staleTime 설정 필수 (기본 0은 포커스마다 refetch)
- normalizeFilters로 캐시 효율 관리
- mutateAsync + try-catch (mutate 대신)
- invalidateQueries는 mutationOptions.onSuccess에서
- useQuery는 placeholderData, 무한스크롤 등 특수 케이스만

## 컴포넌트

- Props는 DTO에서 직접 추출 (SSOT)
- Suspense + useSuspenseQuery 선언적 비동기
- overlay-kit으로 모달 관리
- ts-pattern match로 조건부 렌더링
- useEffect는 **기명 함수** 필수

→ 상세: `conventions/component-design.md`

## 페이지

- 래핑 순서: ClientOnly → AuthGuard → Context → ErrorBoundary → Suspense → Content
- 리스트: nuqs 필터 + useInfiniteQuery + keepPreviousData
- 상세: getServerSideProps 검증 + Context로 ID 전파

→ 상세: `conventions/page-structure.md`

## 에러 처리

```typescript
// 구조적 타입 체크 (instanceof 금지)
function isAppError(error: unknown): error is AppError {
  return error != null &&
    typeof error === 'object' &&
    (error as any)?.name === 'AppError';
}
```

- Exception(예상 불가) vs Error State(예상 가능, 타입으로 표현) 구분
- AppError(범용) + RedirectError(특수 동작) 체계
- ErrorBoundary로 관심사 분리
- AsyncBoundary = ErrorBoundary + Suspense + QueryErrorResetBoundary

→ 상세: `conventions/error-handling.md`

## 인지 부하 제한

| 제한 | 기준 |
|------|------|
| 함수 길이 | ≤ 30줄 |
| 파라미터 수 | ≤ 3개 |
| 분기 깊이 | ≤ 3단계 |
