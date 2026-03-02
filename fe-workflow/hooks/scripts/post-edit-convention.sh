#!/bin/bash
# PostToolUse: 파일 작성 후 FE 컨벤션 체크

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

  if [[ "$FILE" == *.tsx ]]; then
    cat << 'EOF'
{
  "hookSpecificOutput": {
    "additionalContext": "✅ 컴포넌트 컨벤션 체크\n- useEffect 기명함수?\n- useSuspenseQuery 기본 (if isLoading 금지)?\n- mutateAsync + try-catch?\n- ErrorBoundary/Suspense로 감쌌는가?"
  }
}
EOF
    exit 0
  fi

  if [[ "$FILE" == *.ts ]]; then
    cat << 'EOF'
{
  "hookSpecificOutput": {
    "additionalContext": "✅ API 레이어 컨벤션 체크\n- type → interface?\n- 파라미터 *Params 객체 타입?\n- DTO 도메인별 단일 파일?\n- mutation: onSuccess에서 invalidateQueries?\n- query: staleTime 설정?"
  }
}
EOF
    exit 0
  fi
fi

exit 0
