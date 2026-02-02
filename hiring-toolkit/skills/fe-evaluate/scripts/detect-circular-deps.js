#!/usr/bin/env node

/**
 * 순환 참조 탐지 스크립트
 * DFS 알고리즘으로 모듈 간 순환 의존성 검출
 *
 * Usage: node detect-circular-deps.js <프로젝트경로>
 */

const fs = require('fs');
const path = require('path');

const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IMPORT_REGEX = /(?:import|export).*from\s+['"]([^'"]+)['"]/g;

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

function extractImports(filePath, baseDir) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = [];
  let match;

  while ((match = IMPORT_REGEX.exec(content)) !== null) {
    const importPath = match[1];

    // 상대 경로만 처리
    if (importPath.startsWith('.')) {
      const resolvedPath = resolveImportPath(filePath, importPath, baseDir);
      if (resolvedPath) {
        imports.push(resolvedPath);
      }
    }
  }

  return imports;
}

function resolveImportPath(fromFile, importPath, baseDir) {
  const dir = path.dirname(fromFile);
  let resolved = path.resolve(dir, importPath);

  // 확장자 추가 시도
  for (const ext of TARGET_EXTENSIONS) {
    if (fs.existsSync(resolved + ext)) {
      return path.relative(baseDir, resolved + ext);
    }
  }

  // index 파일 시도
  for (const ext of TARGET_EXTENSIONS) {
    const indexPath = path.join(resolved, 'index' + ext);
    if (fs.existsSync(indexPath)) {
      return path.relative(baseDir, indexPath);
    }
  }

  return null;
}

function buildDependencyGraph(files, baseDir) {
  const graph = new Map();

  for (const file of files) {
    const relativePath = path.relative(baseDir, file);
    const imports = extractImports(file, baseDir);
    graph.set(relativePath, imports);
  }

  return graph;
}

function findCircularDeps(graph) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();
  const path = [];

  function dfs(node) {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // 순환 발견
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart).concat(neighbor);
        cycles.push(cycle);
      }
    }

    path.pop();
    recursionStack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
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
  const graph = buildDependencyGraph(files, absoluteDir);
  const cycles = findCircularDeps(graph);

  if (cycles.length === 0) {
    console.log('✅ No circular dependencies found');
    console.log(JSON.stringify({ cycles: [], count: 0 }, null, 2));
  } else {
    console.log(`❌ Found ${cycles.length} circular dependency chain(s):\n`);

    cycles.forEach((cycle, index) => {
      console.log(`[${index + 1}] ${cycle.join(' → ')}`);
    });

    console.log('\n' + JSON.stringify({ cycles, count: cycles.length }, null, 2));
  }
}

main();
