#!/bin/bash
# PostToolUse: 파일 수정 후 관련 컨벤션 위반 체크 리마인더

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

  if [[ "$FILE" == *.tsx ]]; then
    cat << 'EOF'
{
  "hookSpecificOutput": {
    "additionalContext": "TSX 컨벤션 체크:\n- useEffect(() => { 익명 금지 → useEffect(function syncData() {\n- if (isLoading) return <Spinner/> 금지 → useSuspenseQuery + Suspense\n- mutate() 금지 → mutateAsync + try-catch\n- 커스텀 훅 return 값 5개 이상이면 추상화 실패 의심\n- A-B-A-B 분산: 관련 상태+핸들러가 떨어져 있으면 모아두기"
  }
}
EOF
    exit 0
  fi

  if [[ "$FILE" == *remote* ]] || [[ "$FILE" == *mutation* ]] || [[ "$FILE" == *query* ]] || [[ "$FILE" == *dto* ]]; then
    cat << 'EOF'
{
  "hookSpecificOutput": {
    "additionalContext": "API 레이어 체크:\n- 파라미터: *Params 객체 타입 (primitive 직접 전달 금지)\n- Remote: httpClient만, 순수 네트워크 호출만\n- DTO: 도메인별 단일 파일, interface 사용\n- Mutation: onSuccess에서 invalidateQueries\n- Query: queryOptions 팩토리 패턴, useSuspenseQuery"
  }
}
EOF
    exit 0
  fi

  if [[ "$FILE" == *.ts ]]; then
    cat << 'EOF'
{
  "hookSpecificOutput": {
    "additionalContext": "TS 컨벤션 체크:\n- 객체 타입 → interface, 유니온/유틸리티 → type\n- any 금지\n- 파일이 올바른 위치에 있는가? (Page First, 지역성)"
  }
}
EOF
    exit 0
  fi
fi

exit 0
