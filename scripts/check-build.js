#!/usr/bin/env node

/**
 * Build verification script
 * Checks if the build output contains proper environment variable replacements
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "..", "dist");
const indexPath = path.join(distPath, "index.html");

console.log("🔍 Checking build output...\n");

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ dist folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error("❌ dist/index.html not found.");
  process.exit(1);
}

console.log("✅ dist folder exists");
console.log("✅ index.html exists");

// Read index.html
const indexContent = fs.readFileSync(indexPath, "utf-8");

// Check for module script
if (indexContent.includes('type="module"')) {
  console.log('✅ Script tag has type="module"');
} else {
  console.warn('⚠️  Script tag missing type="module"');
}

// Find all JS files in dist/assets
const assetsPath = path.join(distPath, "assets");
if (fs.existsSync(assetsPath)) {
  const jsFiles = fs.readdirSync(assetsPath).filter((f) => f.endsWith(".js"));

  console.log(`\n📦 Found ${jsFiles.length} JavaScript files`);

  let hasImportMeta = false;
  let hasViteEnv = false;

  for (const file of jsFiles) {
    const filePath = path.join(assetsPath, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // Check for unreplaced import.meta
    if (content.includes("import.meta.env.VITE_")) {
      hasViteEnv = true;
      console.warn(`⚠️  ${file} contains unreplaced VITE_ variables`);
    }

    if (
      content.includes("import.meta") &&
      !content.includes("import.meta.hot")
    ) {
      hasImportMeta = true;
    }
  }

  if (!hasViteEnv) {
    console.log("✅ All VITE_ variables properly replaced");
  } else {
    console.error("\n❌ Build contains unreplaced environment variables!");
    console.error(
      "This means environment variables were not set during build.",
    );
    console.error("\nFor GitHub Actions, ensure secrets are set:");
    console.error("  - VITE_API_BASE_URL");
    console.error("  - VITE_APP_NAME");
    console.error("  - VITE_APP_VERSION");
    process.exit(1);
  }

  if (hasImportMeta) {
    console.log("ℹ️  Some import.meta usage found (may be normal for HMR)");
  }
}

// Check file sizes
const stats = fs.statSync(indexPath);
console.log(`\n📊 index.html size: ${(stats.size / 1024).toFixed(2)} KB`);

console.log("\n✅ Build verification complete!");
console.log("\n💡 To test locally:");
console.log("   npm run preview");
console.log("   Open http://localhost:4173");
