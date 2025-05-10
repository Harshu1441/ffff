#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(".");
const exts = [".js", ".jsx", ".ts", ".tsx"];
const skipDirs = new Set(["node_modules", ".git", "dist", "build", "out"]);

// Step 1: Recursively walk all paths and collect them (bottom-up)
function walkPaths(dir, all = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (skipDirs.has(entry.name)) continue;

    if (entry.isDirectory()) {
      walkPaths(fullPath, all);
    }
    all.push({ path: fullPath, isDir: entry.isDirectory() });
  }
  return all;
}

// Step 2: Rename all files and folders to lowercase
function renameAllToLowerCase() {
  const items = walkPaths(rootDir);

  // Rename files first, then folders (bottom-up)
  for (const { path: oldPath, isDir } of items.reverse()) {
    const dir = path.dirname(oldPath);
    const newName = path.basename(oldPath).toLowerCase();
    const newPath = path.join(dir, newName);

    if (oldPath !== newPath && fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`🔄 Renamed: ${oldPath} → ${newPath}`);
      } catch (err) {
        console.warn(`⚠️ Could not rename: ${oldPath}`, err.message);
      }
    }
  }
}

// Step 3: Fix imports
function fixImportsInFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");
  let updated = false;

  code = code.replace(
    /(import\s.+?from\s+['"]|require\s*\(\s*['"])([^'"]+)(['"]\)?)/g,
    (match, prefix, importPath, suffix) => {
      if (importPath.startsWith(".")) {
        const fullImportPath = path.resolve(path.dirname(filePath), importPath);
        for (const ext of exts.concat(["", "/index"])) {
          const testPath = fullImportPath + ext;
          const lowerPath = testPath.toLowerCase();

          if (fs.existsSync(lowerPath)) {
            const relative = path
              .relative(path.dirname(filePath), lowerPath)
              .replace(/\\/g, "/");

            updated = true;
            return `${prefix}${relative.startsWith(".") ? relative : "./" + relative}${suffix}`;
          }
        }
      }
      return match;
    }
  );

  if (updated) {
    fs.writeFileSync(filePath, code, "utf8");
    console.log(`🛠️  Fixed imports in: ${filePath}`);
  }
}

function walkAndFixImports(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (skipDirs.has(entry.name)) continue;

    if (entry.isDirectory()) {
      walkAndFixImports(entryPath);
    } else if (exts.includes(path.extname(entry.name))) {
      fixImportsInFile(entryPath);
    }
  }
}

// Run the full script
function run() {
  console.log(`📁 Starting in: ${rootDir}`);
  console.log("🔄 Renaming all files and folders to lowercase...");
  renameAllToLowerCase();

  console.log("🔍 Fixing import paths...");
  walkAndFixImports(rootDir);

  console.log("✅ All done! Files/folders lowercased and imports updated.");
}

run();
