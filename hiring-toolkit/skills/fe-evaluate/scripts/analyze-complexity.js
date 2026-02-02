#!/usr/bin/env node

/**
 * 함수/컴포넌트 복잡도 분석 스크립트
 * [COG7] 기준: 함수≤30줄, 파라미터≤3, 분기≤3
 *
 * Usage: node analyze-complexity.js <프로젝트경로>
 */

const fs = require('fs');
const path = require('path');

const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

const COG7_LIMITS = {
  maxLines: 30,
  maxParams: 3,
  maxDepth: 3,
};

// 함수/컴포넌트 시작 패턴
const FUNCTION_PATTERNS = [
  // function declaration
  /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
  // arrow function with const
  /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*[^=]+)?\s*=>/,
  // arrow function with const (no params parens)
  /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(\w+)\s*=>/,
  // class method
  /^\s*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*\{/,
];

// 분기문 패턴
const BRANCH_PATTERNS = [/\bif\s*\(/, /\belse\s+if\s*\(/, /\bswitch\s*\(/, /\bfor\s*\(/, /\bwhile\s*\(/, /\?\s*[^:]+\s*:/];

function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
        findFiles(fullPath, files);
      }
    } else if (TARGET_EXTENSIONS.includes(path.extname(item))) {
      files.push(fullPath);
    }
  }

  return files;
}

function countParams(paramStr) {
  if (!paramStr || paramStr.trim() === '') return 0;
  // 제네릭, 기본값 등 제거 후 쉼표로 분리
  const cleaned = paramStr.replace(/<[^>]+>/g, '').replace(/=[^,]+/g, '');
  return cleaned.split(',').filter((p) => p.trim()).length;
}

function analyzeBranchDepth(lines) {
  let maxDepth = 0;
  let currentDepth = 0;

  for (const line of lines) {
    // 여는 중괄호
    const opens = (line.match(/\{/g) || []).length;
    // 닫는 중괄호
    const closes = (line.match(/\}/g) || []).length;

    // 분기문 체크
    for (const pattern of BRANCH_PATTERNS) {
      if (pattern.test(line)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
        break;
      }
    }

    // 닫는 괄호에서 깊이 감소
    if (closes > opens) {
      currentDepth = Math.max(0, currentDepth - (closes - opens));
    }
  }

  return maxDepth;
}

function extractFunctions(content, filePath, baseDir) {
  const lines = content.split('\n');
  const functions = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    let matched = false;

    for (const pattern of FUNCTION_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1];
        const params = match[2] || '';

        // 함수 범위 찾기 (중괄호 매칭)
        let braceCount = 0;
        let started = false;
        let endLine = i;

        for (let j = i; j < lines.length; j++) {
          const opens = (lines[j].match(/\{/g) || []).length;
          const closes = (lines[j].match(/\}/g) || []).length;

          if (opens > 0) started = true;
          braceCount += opens - closes;

          if (started && braceCount <= 0) {
            endLine = j;
            break;
          }
        }

        const functionLines = lines.slice(i, endLine + 1);
        const lineCount = functionLines.length;
        const paramCount = countParams(params);
        const branchDepth = analyzeBranchDepth(functionLines);

        functions.push({
          file: path.relative(baseDir, filePath),
          name,
          startLine: i + 1,
          endLine: endLine + 1,
          lines: lineCount,
          params: paramCount,
          branchDepth,
          violations: {
            lines: lineCount > COG7_LIMITS.maxLines,
            params: paramCount > COG7_LIMITS.maxParams,
            depth: branchDepth > COG7_LIMITS.maxDepth,
          },
        });

        i = endLine;
        matched = true;
        break;
      }
    }

    i++;
  }

  return functions;
}

function main() {
  const targetDir = process.argv[2] || '.';
  const absoluteDir = path.resolve(targetDir);

  if (!fs.existsSync(absoluteDir)) {
    console.error(`Error: Directory not found: ${absoluteDir}`);
    process.exit(1);
  }

  console.log(`Scanning: ${absoluteDir}\n`);
  console.log(`COG7 Limits: ${COG7_LIMITS.maxLines} lines, ${COG7_LIMITS.maxParams} params, ${COG7_LIMITS.maxDepth} depth\n`);

  const files = findFiles(absoluteDir);
  const allFunctions = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const functions = extractFunctions(content, file, absoluteDir);
    allFunctions.push(...functions);
  }

  // 위반 항목 필터
  const violations = allFunctions.filter((f) => f.violations.lines || f.violations.params || f.violations.depth);

  // 통계
  const stats = {
    totalFunctions: allFunctions.length,
    violations: violations.length,
    byType: {
      lines: violations.filter((f) => f.violations.lines).length,
      params: violations.filter((f) => f.violations.params).length,
      depth: violations.filter((f) => f.violations.depth).length,
    },
  };

  // 출력
  if (violations.length === 0) {
    console.log('✅ All functions comply with COG7 limits');
  } else {
    console.log(`⚠️ Found ${violations.length} function(s) violating COG7 limits:\n`);

    violations.forEach((fn) => {
      const issues = [];
      if (fn.violations.lines) issues.push(`${fn.lines} lines (max ${COG7_LIMITS.maxLines})`);
      if (fn.violations.params) issues.push(`${fn.params} params (max ${COG7_LIMITS.maxParams})`);
      if (fn.violations.depth) issues.push(`depth ${fn.branchDepth} (max ${COG7_LIMITS.maxDepth})`);

      console.log(`  ${fn.file}:${fn.startLine} - ${fn.name}`);
      console.log(`    Issues: ${issues.join(', ')}\n`);
    });
  }

  console.log('\n' + JSON.stringify({ functions: violations, stats }, null, 2));
}

main();
