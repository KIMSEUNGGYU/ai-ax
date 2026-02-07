# fe-workflow 플러그인 설계

## 개요

FE 개발 워크플로우를 하나의 플러그인으로 통합 관리.
기존 `~/.claude/commands/`, `~/.claude/skills/` 레거시를 대체.

## 배경

### 현재 (레거시)
- `~/.claude/commands/`: architecture, review, recap, organization
- `~/.claude/skills/fe-principles/`: 코드 원칙 (자동 적용)
- 문제: 구현 중 원칙 적용 미흡, 리뷰 깊이 부족

### 목표
- 기존 워크플로우 개선 + 플러그인으로 통합
- 구현 중 원칙이 실제로 적용되도록 강화
- 코드 리뷰 깊이/체계 향상
- MD 기반 문서 관리 (설계, 스펙, 지식 축적)
- 로컬 개발 → 마켓플레이스 배포

---

## 작업 흐름

### Step 1: 코드 컨벤션/철학 정리 ← 현재
> conventions/ 폴더에 영역별로 정리. 이 내용이 플러그인 skill의 소스가 됨.

- [x] API/타입 계층 (`conventions/api-type-layer.md`)
- [~] 컴포넌트 설계 (`conventions/component-design.md`) — 초안 완료, 내용 일부 수정 예정
- [~] 페이지 구조 (`conventions/page-structure.md`) — 초안 완료, 검토 필요
- [~] 폴더 구조 (`conventions/folder-structure.md`) — 초안 완료, 검토 필요
- [ ] (추가 영역은 진행하며 결정)

### Step 2: 플러그인 컴포넌트 설계
> 정리된 컨벤션을 기반으로 플러그인 구성 요소 확정

- [ ] Skills 상세 설계
- [ ] Commands 개선 설계 (architecture, review, recap, organization)
- [ ] Agent/Hook 필요 여부 결정

### Step 3: 플러그인 구현
> 로컬에서 플러그인 생성 및 테스트

- [ ] 플러그인 구조 생성
- [ ] 컴포넌트 구현
- [ ] 검증 및 테스트

### Step 4: 마이그레이션
> 기존 레거시 대체

- [ ] 기존 commands/skills 삭제
- [ ] 마켓플레이스 배포 (GitHub)

---

## 결정 사항

- 플러그인명: `fe-workflow`
- 위치: 로컬 개발 → GitHub 마켓플레이스
- 레거시: 플러그인 완성 후 삭제
- 설계 철학: **ECC (설정 지향, 품질 중심, 개발자 주도)** + OMC 구조 패턴 차용

### 설계 원칙 (ECC vs OMC 분석 기반)

| 원칙 | 선택 | 이유 |
|------|------|------|
| MD 기반 규칙/컨벤션 | ECC | conventions/가 Skill의 소스 |
| 명시적 워크플로우 | ECC | `/architecture → 구현 → /review → /recap` |
| 4컴포넌트 구조 | OMC 차용 | Skill/Command/Agent/Hook 구조는 효과적 |
| 역할 제한 (disallowedTools) | OMC 차용 | review 에이전트 읽기 전용 등 |
| FE 전문 소수 에이전트 | ECC | 5~8개면 충분, 범용 35개 불필요 |
| 자연어 매직 (keyword-detector) | 불필요 | 명시적 `/command`로 충분 |
| 복잡한 상태 관리 (.omc/state/) | 불필요 | 단순 워크플로우에 과도 |

> 상세 분석: `.gyu/plugin-design-study/README.md` 하단 참조

---

## 로그

- 2025-02-05: Step 1 시작 - API/타입 계층 컨벤션 정리 완료
