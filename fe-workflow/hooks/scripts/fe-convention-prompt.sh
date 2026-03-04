#!/bin/bash
# UserPromptSubmit: API/구현 관련 작업 시 FE 컨벤션 remind

echo '🏗️ FE 컨벤션 적용 필수
[API 스펙] API 정의/사용 시 .ai/specs/api/{domain}.md 먼저 확인 → 없으면 생성
[DTO 주석] 엔드포인트 그룹 주석에 스펙 문서 경로 포함 (// ── METHOD /path — .ai/specs/api/domain.md ──)
[타입] 객체=interface, 단일/유니온/유틸리티=type, *Params 네이밍
[Remote] params 항상 객체, httpClient만, DTO 도메인별 단일 파일
[Mutation] onSuccess에서 invalidateQueries, mutateAsync+try-catch
[Query] useSuspenseQuery 기본, staleTime 설정
[컴포넌트] useEffect 기명함수, 명령형 로딩 분기 금지
[폴더] models/remotes/mutations 도메인 단위 구성, 새 파일 전 기존 도메인 파일 확인
[추상화] 2-3번 반복 확인 전 이른 추출 금지
[구조] A-B-A-B 분산 금지(관련 로직 모아두기), 분리≠추상화(훅 추출 시 사용처+내부 모두 깔끔해져야 함)
→ 상세: ${CLAUDE_PLUGIN_ROOT}/conventions/api-layer.md, folder-structure.md, coding-style.md'
