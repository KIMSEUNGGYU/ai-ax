---
description: 현재 브랜치 변경사항 커밋 + PR 자동 생성
allowed-tools: Read, Bash, Glob, Grep
argument-hint: [base 브랜치 (기본: main)]
---

너는 PR 생성 자동화 도우미다. 변경사항을 커밋하고 PR을 생성한다.

$ARGUMENTS

## 실행 규칙

- Step 1~3 (분석 → 커밋 → 푸시)은 **자동 실행** — 확인 요청 금지
- Step 4 (PR 생성) 전에 **반드시 사용자 확인** — 제목과 본문을 보여주고 승인받기

## Step 1. 현재 상태 분석 + 커밋

```bash
git branch --show-current
git status
git diff --cached
git diff
```

브랜치 이름에서 이슈 번호 추출:
- `feat/ISH-1065` → ISH-1065
- `fix/ISH-1066` → ISH-1066
- main/master 브랜치면 에러 출력 후 중단

미커밋 변경사항이 있으면 커밋:
```bash
git add -A
git commit -m "[ISH-XXXX] type: 간결한 설명"
```

- 브랜치 타입(feat/fix/...)을 커밋 타입으로 사용
- 한국어로 작성, 72자 이내
- Claude attribution 절대 금지 (Co-Authored-By, Generated with Claude 등)

## Step 2. 브랜치 전체 변경사항 분석

커밋 완료 후, **main 대비 브랜치 전체**를 분석한다:

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

- 모든 커밋을 분석해서 PR 본문 작성 (최신 커밋만 X)
- 변경 파일별 역할과 변경 이유를 파악

## Step 3. Push

```bash
git push -u origin [branch-name]
```

## Step 4. PR 생성

**제목과 본문을 사용자에게 보여주고 확인받은 뒤** 생성한다.

**제목 형식:**
```
[ISH-XXXX] type(scope): 간결한 설명
```

**본문 형식:**
```bash
gh pr create --title "[ISH-XXXX] type: 간결한 설명" --body "$(cat <<'EOF'
### 왜(Why) PR을 올렸나요?

[변경 이유 설명]

### 무엇(What)이 어떻게(How) 바뀌나요?

- 변경 사항 1
- 변경 사항 2

### 링크(links)

- [ISH-XXXX](https://linear.app/ishopcare/issue/ISH-XXXX)
EOF
)"
```

## Step 5. 결과 보고

```
완료:
- Linear: ISH-XXXX (https://linear.app/ishopcare/issue/ISH-XXXX)
- Branch: [type]/ISH-XXXX
- PR: [PR_URL]
```

## 규칙

### MUST
- 한국어로 작성
- 모든 커밋 내용 반영 (최신 커밋만 X)
- Linear 이슈 링크 포함

### NEVER
- Claude attribution 추가 금지
- 코드 스니펫 포함 금지
- "🤖 Generated with Claude Code" 금지
