const fs = require('fs');
const path = require('path');
const glob = require('glob');

const rootDir = path.resolve(__dirname, 'src');
const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue'];

function resolveImportPath(basePath) {
  for (const ext of extensions) {
    const fullPath = basePath + ext;
    const actualFile = getRealFileCaseInsensitive(fullPath);
    if (actualFile) return path.basename(fullPath);
  }

  // Check for index file inside a folder
  for (const ext of extensions) {
    const fullPath = path.join(basePath, 'index' + ext);
    const actualFile = getRealFileCaseInsensitive(fullPath);
    if (actualFile) return path.basename(basePath) + '/index' + ext;
  }

  return null;
}

function getRealFileCaseInsensitive(filepath) {
  const dir = path.dirname(filepath);
  const base = path.basename(filepath);
  try {
    const files = fs.readdirSync(dir);
    return files.find(f => f.toLowerCase() === base.toLowerCase()) || null;
  } catch (e) {
    return null;
  }
}

function fixFileImports(file) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const importRegex = /(import\s+[^'"]*?\s+from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g;

  content = content.replace(importRegex, (match, p1, importPath, p3) => {
    const fullPath = path.resolve(path.dirname(file), importPath);
    const resolved = resolveImportPath(fullPath);

    if (!resolved) {
      console.warn(`⚠️  Could not find file for import: "${importPath}" in ${file}`);
      return match;
    }

    const importBase = path.basename(importPath);
    const correctedPath = importPath.replace(importBase, resolved);

    if (importBase !== resolved) {
      console.log(`🔧 Fixed in ${file}\n   ${importPath} → ${correctedPath}`);
      changed = true;
      return `${p1}${correctedPath}${p3}`;
    }

    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

function fixAllFiles() {
  console.log("🔍 Looking in folder:", rootDir);
  const files = glob.sync(`${rootDir}/**/*.{js,ts,jsx,tsx,vue}`, { nodir: true });
  console.log(`🔍 Scanning ${files.length} files...`);
  if (files.length === 0) {
    console.warn('⚠️  No matching files found.');
  }
  files.forEach(fixFileImports);
  console.log('✅ Done.');
}

fixAllFiles();
