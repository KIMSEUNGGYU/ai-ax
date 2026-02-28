---
description: 작업 완료 처리 — archive 저장 + 패턴 질문 + active 삭제 + INDEX 업데이트
allowed-tools: Read, Write, Edit, Glob, Bash, AskUserQuestion
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

### 3. 패턴 질문 (조건부)

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

### 4. active 파일 삭제
- `.ai/active/{파일명}.md` 삭제

### 5. INDEX.md 업데이트
- `.ai/INDEX.md`가 있으면 → "현재 진행 중" 섹션에서 해당 작업 링크 제거
- 없으면 → 생략

## 대화 출력

```
작업 완료: {작업 제목}
→ archive: .ai/archive/{경로}
→ 패턴 저장: {있으면 경로, 없으면 "없음"}
→ active 삭제 완료
```
