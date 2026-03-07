---
description: 작업 완료 처리 — archive 저장 + 자가학습 + 패턴 질문 + active 삭제 + INDEX 업데이트
allowed-tools: Read, Write, Edit, Glob, Bash, Agent, AskUserQuestion
argument-hint: [작업 파일명 (선택)]
---

기능(스펙) 단위 작업이 완료되었을 때 호출. active 파일을 archive로 이동하고 정리한다.

$ARGUMENTS

## 동작

### 1. 대상 파일 결정
- 인자로 파일명 주어지면 → `.ai/active/{파일명}.md`
- 인자 없으면:
  - 파일 1개 → 그 파일
  - 여러 개 → AskUserQuestion으로 선택
  - 없으면 → "완료할 활성 작업이 없습니다." 출력 후 종료

### 2. archive 저장
- `.ai/archive/{서비스}/` 폴더에 경량 기록 저장
- 서비스 판별이 어려우면 `.ai/archive/` 루트에 저장

```markdown
# {작업 제목}
- 완료: {오늘 날짜}
- 구현: {주요 구현 내용 한 줄}
- 결정: {핵심 기술 결정}
```

### 3. 자가학습 (교정 패턴 분석)

active 파일에 `## 세션 이력` 섹션이 있고, session_id가 1개 이상이면 실행. 없으면 스킵.

#### Step 1: transcript 전처리
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract-corrections.mjs" <transcript_path1> [<transcript_path2> ...]
```
- transcript 경로: `~/.claude/projects/{project-hash}/{session_id}.jsonl`
  - `{project-hash}`는 현재 프로젝트의 cwd를 `-`로 변환 (예: `-Users-isc010252-work-ishopcare-frontend`)
- 세션 이력의 모든 session_id에 대해 transcript 경로를 인자로 전달
- 출력: `{ messages: string[], stats: { total, extracted, correctionHits } }`

#### Step 2: 교정 판단
- `stats.correctionHits === 0`이면 → "교정 패턴 없음, 자가학습 스킵" 출력 후 Step 5로
- `stats.extracted < 3`이면 → 짧은 세션, 스킵

#### Step 3: 서브에이전트 분석
Agent 도구로 서브에이전트 실행 (Haiku 모델 권장):

**프롬프트:**
```
아래는 AI 코딩 어시스턴트와 작업 중 사용자가 보낸 메시지들이다.
사용자가 AI의 행동을 교정하거나 선호를 표현한 부분을 찾아 분류하라.

## 사용자 메시지
{messages를 번호 매겨서 나열}

## 분류 기준
- [교정] 사용자가 AI 출력을 수정 요청
- [신규] 기존 규칙에 없는 새 패턴
- [위반] 기존 규칙을 AI가 놓침
- [선호] 작업 방식/스타일 선호

## 카테고리 (저장 위치)
- code: 코드 컨벤션 → ~/.claude/rules/learnings-code.md
- thinking: 사고방식/의사결정 → ~/.claude/rules/learnings-thinking.md
- workflow: 작업 방식/도구 사용 → ~/.claude/rules/learnings-workflow.md
- domain: 도메인/업무 지식 → ~/.claude/rules/learnings-domain.md
- meta: 자가학습 시스템 자체 → ~/.claude/rules/learnings-meta.md

## 출력 형식 (JSON)
[
  {
    "type": "교정|신규|위반|선호",
    "category": "code|thinking|workflow|domain|meta",
    "rule": "한 줄 규칙 요약",
    "evidence": "근거 메시지 번호"
  }
]

교정이나 선호가 없으면 빈 배열 [] 반환.
```

#### Step 4: 사용자 제안
분석 결과가 있으면 AskUserQuestion으로 제안:

```
## 자가학습 결과 ({작업명}, 세션 {N}개)

1. [{type}/{category}] {rule}
   → {저장 위치}

2. ...

반영할까요? (전체 / 번호 선택 / 스킵)
```

- "전체" → 모든 항목 반영
- 번호 선택 (예: "1,3") → 해당 항목만 반영
- "스킵" → 반영 안 함

#### Step 5: 학습 반영
승인된 항목을 해당 learnings 파일에 추가:
- 파일이 없으면 생성 (헤더 포함)
- 각 규칙은 `- {rule} <!-- learned: {YYYY-MM-DD}, task: {task_name} -->` 형식
- 중복 규칙은 추가하지 않음

### 4. 패턴 질문 (조건부)

아래 경우에만 AskUserQuestion으로 질문:

**질문하는 경우:**
- 페이지 단위 구현 (list, detail, form)
- 공통 UI 조합 (테이블+필터, 폼+밸리데이션)
- API 연동 패턴 (새 도메인 CRUD)
- 상태관리 패턴 (새 store 구조)

**질문 안 하는 경우:**
- 버그 수정
- 단순 스타일 변경
- 기존 패턴 내 구현

질문 예시: "이 작업에서 재사용할 수 있는 패턴이 있어요. `.ai/patterns/`에 저장할까요?"
- "예" → `.ai/patterns/{패턴명}.md` 생성/업데이트
- "아니오" → 생략

### 5. active 파일 삭제
- `.ai/active/{파일명}.md` 삭제

### 6. INDEX.md 업데이트
- `.ai/INDEX.md`가 있으면 → "현재 진행 중" 섹션에서 해당 작업 링크 제거
- 없으면 → 생략

## 대화 출력

```
작업 완료: {작업 제목}
→ archive: .ai/archive/{경로}
→ 자가학습: {N}건 반영 (또는 "스킵" 또는 "교정 없음")
→ 패턴 저장: {있으면 경로, 없으면 "없음"}
→ active 삭제 완료
```
