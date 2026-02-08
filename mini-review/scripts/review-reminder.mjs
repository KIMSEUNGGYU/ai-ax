/**
 * PreToolUse Hook: 도구 실행 전 리뷰 원칙 리마인더 주입
 *
 * - Read 도구 사용 시: "변경 영향도를 먼저 파악하라"
 * - Task 도구 사용 시: "Agent에게 충분한 컨텍스트를 전달하라"
 */

const input = await new Promise((resolve) => {
  let data = '';
  process.stdin.on('data', (chunk) => (data += chunk));
  process.stdin.on('end', () => resolve(data));
});

let toolName = '';
try {
  const parsed = JSON.parse(input);
  toolName = parsed.toolName || '';
} catch {
  // JSON 파싱 실패 시 무시
}

const reminders = {
  Read: '리뷰 중: 변경 영향도(다른 파일에 미치는 영향)를 함께 파악하라.',
  Task: '리뷰 중: Agent에게 diff 전체와 파일 컨텍스트를 충분히 전달하라.',
  Grep: '리뷰 중: 변경된 함수/변수가 다른 곳에서 사용되는지 확인하라.',
};

const message = reminders[toolName];

if (message) {
  console.log(JSON.stringify({
    continue: true,
    hookSpecificOutput: {
      additionalContext: message,
    },
  }));
} else {
  console.log(JSON.stringify({ continue: true }));
}
