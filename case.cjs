#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(".");
const exts = [".js", ".jsx", ".ts", ".tsx"];
const skipDirs = new Set(["node_modules", ".git", "dist", "build", "out"]);

function renameAllToLowerCase(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    const newName = entry.name.toLowerCase();
    const newPath = path.join(dir, newName);

    if (skipDirs.has(entry.name)) continue;

    // Recurse first
    if (entry.isDirectory()) {
      renameAllToLowerCase(oldPath);
    }

    // Then rename if necessary
    if (oldPath !== newPath) {
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`🔄 Renamed: ${oldPath} → ${newPath}`);
      } catch (err) {
        console.warn(`⚠️ Could not rename: ${oldPath}`, err.message);
      }
    }
  }
}

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

function run() {
  console.log(`📁 Starting in project directory: ${rootDir}`);
  console.log("🔄 Renaming files/folders to lowercase...");
  renameAllToLowerCase(rootDir);

  console.log("🔍 Fixing import paths...");
  walkAndFixImports(rootDir);

  console.log("✅ All filenames and imports updated.");
}

run();
