import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, 'src');

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
    const actualFile = getRealFileCaseInsensitive(fullPath);

    if (!actualFile) {
      console.warn(`⚠️  Could not find file for import: "${importPath}" in ${file}`);
      return match;
    }

    const importBase = path.basename(importPath);
    if (importBase !== actualFile) {
      const correctedPath = importPath.replace(importBase, actualFile);
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
  const files = glob.sync(`${rootDir}/**/*.{js,ts,vue}`, { nodir: true });
  console.log(`🔍 Scanning ${files.length} files...`);
  files.forEach(fixFileImports);
  console.log('✅ Done.');
}

fixAllFiles();
