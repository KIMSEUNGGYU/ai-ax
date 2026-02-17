#!/bin/bash
# SessionStart Hook: 이전 작업 컨텍스트 로드

# JSON 입력 파싱
INPUT=$(cat)
PROJECT_DIR=$(echo "$INPUT" | jq -r '.cwd // empty')

# 프로젝트명 추출
PROJECT_NAME=""
if [ -n "$PROJECT_DIR" ]; then
  PROJECT_NAME=$(basename "$PROJECT_DIR")
fi

ADDITIONAL_CONTEXT=""

# 1. 최근 컨텍스트 파일 로드
CONTEXT_DIR="$PROJECT_DIR/.ai/context"
if [ -d "$CONTEXT_DIR" ]; then
  CONTEXT_FILE=$(ls -t "$CONTEXT_DIR"/*.md 2>/dev/null | head -1)
  if [ -f "$CONTEXT_FILE" ]; then
    CONTEXT=$(head -50 "$CONTEXT_FILE")
    ADDITIONAL_CONTEXT="# [$PROJECT_NAME] 이전 작업 컨텍스트\n\n$CONTEXT"
  fi
fi

# 2. 패턴 파일명 목록 로드 (~100 토큰)
PATTERNS_DIR="$PROJECT_DIR/.ai/patterns"
if [ -d "$PATTERNS_DIR" ]; then
  PATTERNS=$(ls "$PATTERNS_DIR"/*.md 2>/dev/null | xargs -I{} basename {} .md | tr '\n' ', ')
  if [ -n "$PATTERNS" ]; then
    ADDITIONAL_CONTEXT="$ADDITIONAL_CONTEXT\n\n# 등록된 패턴: $PATTERNS"
  fi
fi

# 컨텍스트 있으면 출력
if [ -n "$ADDITIONAL_CONTEXT" ]; then
  ESCAPED=$(echo -e "$ADDITIONAL_CONTEXT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')
  cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": $ESCAPED
  }
}
EOF
  exit 0
fi

echo '{"status": "success"}'
