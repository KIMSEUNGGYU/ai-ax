---
description: 변경사항 분석 후 PR 생성
allowed-tools: Read, Bash, Glob, Grep
argument-hint: [base 브랜치 (기본: main)]
---

너는 PR 생성 도우미다. 현재 브랜치의 변경사항을 분석하고 PR을 생성한다.

$ARGUMENTS

## 실행 규칙

- 분석과 푸시는 자동 실행
- PR 생성 전에 **반드시 사용자 확인** — 제목과 본문을 보여주고 승인받기

## Step 1. 변경사항 수집

```bash
git branch --show-current
git status
```

미커밋 변경이 있으면 커밋한다.

커밋 후 브랜치 전체 변경사항 분석:
```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

- base 브랜치가 지정되면 main 대신 해당 브랜치 사용
- 모든 커밋을 분석 (최신 커밋만 X)

## Step 2. Push

```bash
git push -u origin [branch-name]
```

## Step 3. PR 생성

분석한 변경사항으로 제목과 본문을 작성한다.

**제목:** 변경의 핵심을 한 줄로.

**본문:** 변경 이유(Why)와 변경 내용(What)이 드러나도록 작성.

제목과 본문을 사용자에게 보여주고 확인받은 뒤 생성:
```bash
gh pr create --title "제목" --body "본문"
```

생성된 PR URL을 전달.
