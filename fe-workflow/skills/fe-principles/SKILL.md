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
| 2 | **SSOT** | 정의 1곳, 사용 여러 곳. 분리 ≠ 추상화 |
| 3 | **SRP** | 변경 이유 하나 |
| 4 | **응집도↑ 결합도↓** | 함께 바뀌는 것끼리, Page First |
| 5 | **선언적** | What 선언, How는 하위로 |
| 6 | **가독성** | 위에서 아래로 읽히는 구조, 뻔한 인터페이스, 조기 반환 |
| 7 | **인지 부하** | 함수≤30줄, 파라미터≤3, 분기≤3 |

→ 상세: [conventions/code-principles.md](../../conventions/code-principles.md)

## 금지 패턴

- 이른 추상화 — 분리만 하고 복잡도는 그대로인 훅/유틸 금지
- 이른 파일 추출 — 재사용 전까지 같은 파일 유지
- 이른 상수 추출 — 여러 곳 사용 전까지 현재 위치 유지
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

→ 상세: [conventions/folder-structure.md](../../conventions/folder-structure.md)

## API 패턴

- 네이밍: `fetch`/`post`/`update`/`delete` + 명사
- 파라미터: 항상 `*Params` 타입 객체 (`PostMerchantParams`, `FetchMerchantDetailParams`)
- httpClient를 통해서만 API 호출 (직접 fetch/ky 금지)
- DTO: 도메인별 단일 파일 (`[domain].dto.ts`), API 엔드포인트별 주석 그룹

→ 상세: [conventions/api-layer.md](../../conventions/api-layer.md)

## React Query

- queryOptions 팩토리 패턴 (`merchantQuery.detail(id)`)
- queryKey: `as const`, 계층적 (`['domain', 'action', params]`)
- list(일반 조회) vs infinite(커서 페이지네이션) queryKey 분리
- staleTime 설정 필수 (기본 0은 포커스마다 refetch)
- normalizeFilters: 배열 필터 캐시 효율
- useSuspenseQuery 기본, useQuery는 특수 케이스만
- mutateAsync + try-catch (mutate 대신)
- invalidateQueries는 mutationOptions.onSuccess에서
- queryClient 직접 import (useQueryClient 아님)

→ 상세: [conventions/api-layer.md](../../conventions/api-layer.md)

## 에러 처리

- Exception(예상 불가) vs Error State(예상 가능, 타입으로 표현) 구분
- 구조적 타입 체크 (instanceof 금지, name 속성으로 판별)
- AppError(범용) + RedirectError(특수 동작) 체계
- ErrorBoundary로 관심사 분리
- AsyncBoundary = ErrorBoundary + Suspense + QueryErrorResetBoundary

→ 상세: [conventions/error-handling.md](../../conventions/error-handling.md)
