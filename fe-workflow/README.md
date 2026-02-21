# fe-workflow

FE 컨벤션 기반 개발 워크플로우 플러그인.
설계 → 개발 → 리뷰 전 과정을 커맨드로 자동화.

> 세션 관리는 [session-manager](../session-manager/) 플러그인으로 분리됨.

## 설치

```bash
# 개발 중 (임시)
claude --plugin-dir /path/to/fe-workflow

# 정식 적용
/plugin marketplace add /path/to/ai-ax
/plugin install fe-workflow@claude-plugins
```

## 워크플로우

```
/architecture 기능명     →  설계
       ↓
대화로 구현 요청          →  개발
       ↓
/review                  →  리뷰
```

### 1. 설계 — `/architecture`

새 기능 시작 시 사용. 요구사항을 전달하면 architect agent가 컨벤션 기반 설계 문서를 생성한다.

```
/architecture 주문 상세 페이지
```

**진행:**
1. 요구사항이 부족하면 질문 (5개 이내)
2. architect agent가 코드베이스 분석 + conventions 적용
3. 구현 지시서를 md 파일로 저장

**산출물:**
- 결정사항 (왜 이렇게 설계했는지)
- 구현 지시서 (파일 트리, 각 파일 책임, 주요 타입, 구현 단계, 테스트 포인트)

### 2. 개발 — 일반 대화

저장된 구현 지시서를 참고하면서 Claude에게 구현을 요청한다.

```
"구현 지시서 읽고 Step 1 구현해줘"
"Step 2 진행"
```

### 3. 리뷰 — `/review`

구현이 끝나면 코드 리뷰를 요청한다.

```
/review
/review src/pages/order-detail
```

**산출물:**
- 5개 영역 점수 (코드 원칙 / 폴더 구조 / API 패턴 / 에러 처리 / 추상화)
- Must Fix / Should Fix / Nit 목록
- 승인 여부: Approve 또는 Request Changes

## 구조

```
fe-workflow/
├── .claude-plugin/
│   └── plugin.json          ← 플러그인 메타데이터 (v0.4.0)
├── agents/
│   ├── architect.md          ← 설계 에이전트 (opus)
│   └── code-reviewer.md      ← 리뷰 에이전트 (sonnet)
├── commands/
│   ├── architecture.md       ← /architecture 커맨드
│   └── review.md             ← /review 커맨드
├── conventions/
│   ├── code-principles.md    ← 코드 원칙
│   ├── folder-structure.md   ← 폴더 구조
│   ├── api-layer.md          ← API 레이어
│   └── error-handling.md     ← 에러 처리
└── skills/
    └── fe-principles/        ← FE 원칙 스킬
```

## 커맨드 요약

| 커맨드 | 역할 | Agent |
|--------|------|-------|
| `/architecture` | 컨벤션 기반 설계 → 구현 지시서 생성 | architect (opus) |
| `/review` | 컨벤션 기반 코드 리뷰 → 점수/피드백 | code-reviewer (sonnet) |
