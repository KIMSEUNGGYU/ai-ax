# session-manager v2 설계

> 날짜: 2026-02-21
> 상태: 승인됨

## 목표

세션에서 나온 지식의 유실 방지 + 명확한 저장 체계 확립

## 문제 정의

| 문제 | 현상 |
|------|------|
| 세션 종료 시 context 유실 | current.md를 수동으로 /save해야만 보존됨 |
| 세션 중 지식이 대화에만 남음 | 학습, 분석, 패턴 등이 세션 종료 후 사라짐 |
| 저장 위치 기준 부재 | .ai/notes, obsidian, patterns 등 어디에 뭘 넣을지 모호 |
| 패턴이 기록되지 않음 | 재사용 가능한 패턴이 발견되어도 남기지 않음 |

## 해결 전략

| 문제 | 해결 | 컴포넌트 |
|------|------|----------|
| context 유실 | 자동 저장 | session-end Hook |
| 지식 휘발 | 영속 저장소로 이동 | /note 커맨드 + note 스킬 |
| 저장 위치 모호 | AI 자동 판단 + 명확한 규칙 | 저장 체계 규칙 |
| 패턴 미기록 | /note 시 AI가 패턴 여부 판단 → 제안 | /note 내 패턴 분기 |

## 컴포넌트 전체 (v1 + v2)

| 타입 | 이름 | 버전 | 설명 |
|------|------|------|------|
| Hook | session-start | v1 | current.md 자동 로드 |
| Hook | session-end | **v2** | 세션 종료 시 current.md 자동 업데이트 |
| Command | /save | v1 | current.md 수동 저장 |
| Command | /resume | v1 | current.md 수동 로드 |
| Command | /note | **v2** | 지식 영속 저장 (위치 자동 판단) |
| Skill | note | **v2** | "정리해줘" 자연어 트리거 → /note 동작 |

## 저장 체계

```
세션 대화 (휘발)
    ↓ session-end Hook (자동)
current.md (작업 context, 세션 간 유지)
    ↓ /note (수동 트리거)
영속 저장소:
  ├── .ai/notes/       ← 프로젝트 지식 (설계, 분석, 결정)
  ├── .ai/patterns/    ← 재사용 패턴 (AI 제안 + 사용자 승인)
  └── ~/obsidian-note/ ← 개인 학습 (TIL, 개념, 트러블슈팅)
```

### 저장 위치 판단 기준

| 내용 성격 | 저장 위치 | 예시 |
|----------|----------|------|
| 프로젝트 설계/분석 | .ai/notes/ | API 구조 분석, 아키텍처 결정 |
| 재사용 코드 패턴 | .ai/patterns/ | 커스텀 훅 패턴, 에러 처리 패턴 |
| 개인 학습 | ~/obsidian-note/00_Inbox/ | TIL, 개념 정리, 트러블슈팅 |

## /note 동작 상세

```
사용자: "이거 정리해줘" 또는 /note
    ↓
AI: 내용 분석 → 저장 위치 자동 판단
    ↓
AI: "프로젝트 설계 내용이니 .ai/notes/에 저장할게요" (확인)
    ↓ 또는
AI: "이건 재사용 가능한 패턴이네요. .ai/patterns/에 저장할까요?" (제안)
    ↓
사용자 확인 → 저장 (기존 문서 있으면 업데이트)
```

## session-end Hook 동작

```
세션 종료 감지
    ↓
current.md 존재?
  ├── Yes → 현재 세션 진행 상태로 업데이트 (조용히)
  └── No → 아무것도 안 함
```

- current.md만 자동 업데이트 (패턴/지식 제안 없음)
- 사용자에게 추가 질문하지 않음 (세션 종료 의도 존중)

## /wrap과의 경계

| 역할 | session-manager | session-wrap |
|------|----------------|--------------|
| context 저장/로드 | O | X |
| 지식 영속 저장 | O (/note) | X |
| 패턴 승격 | O (/note 내 분기) | X |
| 세션 분석/회고 | X | O |
| 자동화 제안 | X | O |
| follow-up 제안 | X | O |

> session-manager = "무엇을 남길 것인가"
> session-wrap = "세션을 어떻게 마무리할 것인가"

## 미포함 (YAGNI)

- /promote 별도 커맨드 → /note에 통합
- learning-extractor → 과설계
- session-end 시 패턴/지식 제안 → 방해
- current.md 자동 삭제 → 사용자만 가능 (v1 결정 유지)

## 결정 이력

| 결정 | 이유 |
|------|------|
| /note에 패턴 통합 | 별도 /promote 불필요. AI 자동 판단으로 충분 |
| 패턴은 AI 제안 + 사용자 승인 | 자동 감지는 노이즈, 수동만은 누락 위험 |
| session-end는 current.md만 | 종료 시점에 추가 질문은 방해 |
| note 스킬 추가 | "정리해줘" 자연어 트리거 편의성 |
