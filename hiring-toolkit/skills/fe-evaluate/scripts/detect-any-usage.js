#!/usr/bin/env node

/**
 * any 사용 및 타입 관련 문제 탐지 스크립트
 * any, as any, @ts-ignore, @ts-expect-error 탐지
 *
 * Usage: node detect-any-usage.js <프로젝트경로>
 */

const fs = require('fs');
const path = require('path');

const TARGET_EXTENSIONS = ['.ts', '.tsx'];

const PATTERNS = [
  { name: 'any', regex: /:\s*any\b/g, severity: 'error' },
  { name: 'any[]', regex: /:\s*any\[\]/g, severity: 'error' },
  { name: 'as any', regex: /as\s+any\b/g, severity: 'error' },
  { name: '<any>', regex: /<any>/g, severity: 'error' },
  { name: '@ts-ignore', regex: /@ts-ignore/g, severity: 'warning' },
  { name: '@ts-expect-error', regex: /@ts-expect-error/g, severity: 'warning' },
  { name: 'as unknown as', regex: /as\s+unknown\s+as/g, severity: 'warning' },
];

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

function analyzeFile(filePath, baseDir) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // 주석 라인은 @ts-ignore, @ts-expect-error만 체크
    const isComment = line.trim().startsWith('//') || line.trim().startsWith('*');

    for (const pattern of PATTERNS) {
      // any 관련 패턴은 주석 내 체크 안 함
      if (isComment && !pattern.name.startsWith('@ts-')) {
        continue;
      }

      const matches = line.match(pattern.regex);
      if (matches) {
        issues.push({
          file: path.relative(baseDir, filePath),
          line: index + 1,
          pattern: pattern.name,
          severity: pattern.severity,
          content: line.trim(),
        });
      }
    }
  });

  return issues;
}

function main() {
  const targetDir = process.argv[2] || '.';
  const absoluteDir = path.resolve(targetDir);

  if (!fs.existsSync(absoluteDir)) {
    console.error(`Error: Directory not found: ${absoluteDir}`);
    process.exit(1);
  }

  console.log(`Scanning: ${absoluteDir}\n`);

  const files = findFiles(absoluteDir);
  const allIssues = [];

  for (const file of files) {
    const issues = analyzeFile(file, absoluteDir);
    allIssues.push(...issues);
  }

  // 통계
  const stats = {
    total: allIssues.length,
    errors: allIssues.filter((i) => i.severity === 'error').length,
    warnings: allIssues.filter((i) => i.severity === 'warning').length,
    byPattern: {},
  };

  for (const issue of allIssues) {
    stats.byPattern[issue.pattern] = (stats.byPattern[issue.pattern] || 0) + 1;
  }

  // 출력
  if (allIssues.length === 0) {
    console.log('✅ No type issues found');
  } else {
    console.log(`❌ Found ${stats.total} type issue(s):\n`);

    // 에러 먼저
    const errors = allIssues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
      console.log('=== Errors ===');
      errors.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
        console.log(`    ${issue.content}\n`);
      });
    }

    // 경고
    const warnings = allIssues.filter((i) => i.severity === 'warning');
    if (warnings.length > 0) {
      console.log('=== Warnings ===');
      warnings.forEach((issue) => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.pattern}`);
      });
    }
  }

  console.log('\n' + JSON.stringify({ issues: allIssues, stats }, null, 2));
}

main();
