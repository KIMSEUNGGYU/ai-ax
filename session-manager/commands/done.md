---
description: 작업 완료 처리 — archive 저장 + 자가학습 + 패턴 질문 + active 삭제 + INDEX 업데이트
allowed-tools: Read, Write, Edit, Glob, Bash, Agent, AskUserQuestion
argument-hint: [작업 파일명 (선택)]
---

작업 완료 시 호출. $ARGUMENTS

## 1. 대상 파일 결정
- 인자 있으면 `.ai/active/{파일명}.md`, 없으면 자동 선택 (1개→바로, 여러개→AskUserQuestion, 0개→종료)

## 2. archive 저장
`.ai/archive/{서비스}/`에 경량 기록: `# 제목` + 완료일/구현/결정 각 한 줄

## 3. 자가학습 (필수 — 스킵 시 반드시 사유 출력)
active 파일에 `## 세션 이력`과 session_id가 있을 때만 실행.

**3-1.** transcript 전처리:
```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/extract-corrections.mjs" ~/.claude/projects/{project-hash}/{session_id}.jsonl
```
`{project-hash}`: cwd를 `-`로 변환. 출력: `{ messages, stats: { correctionHits, extracted } }`

**3-2.** `correctionHits === 0` 또는 `extracted < 3`이면 스킵.

**3-3.** Agent로 서브에이전트 실행. 프롬프트에 messages를 넘기고, 분류 기준([교정/신규/위반/선호])과 카테고리(code→learnings-code.md, thinking→learnings-thinking.md, workflow→learnings-workflow.md, domain→learnings-domain.md, meta→learnings-meta.md)로 JSON 배열 출력 요청. 교정 없으면 빈 배열.

**3-4.** 결과 있으면 AskUserQuestion으로 제안 → 전체/번호선택/스킵

**3-5.** 승인 항목을 `~/.claude/rules/learnings-{category}.md`에 추가. 형식: `- {rule} <!-- learned: {날짜}, task: {작업명} -->`. 중복 금지.

## 4. 패턴 질문
페이지 구현, 공통 UI 조합, 새 도메인 API, 새 상태관리일 때만 `.ai/patterns/` 저장 제안. 버그 수정/단순 변경은 스킵.

## 5. active 삭제 + INDEX 업데이트
`.ai/active/` 파일 삭제, `.ai/INDEX.md` 진행 중 섹션에서 링크 제거.

## 출력
```
작업 완료: {제목}
→ archive: .ai/archive/{경로}
→ 자가학습: {N}건 반영 / 스킵({사유}) / 교정 없음
  사유 예시: "세션 이력 없음", "correctionHits=0", "extracted<3", "사용자 스킵"
→ 패턴 저장: {경로} / 없음
→ active 삭제 완료
```
