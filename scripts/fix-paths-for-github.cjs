#!/usr/bin/env node

/**
 * Fix asset paths in index.html for GitHub Pages
 * Replaces /dashboard/ with /[repo-name]/dashboard/
 */

const fs = require('fs');
const path = require('path');

const repoName = process.env.GITHUB_REPOSITORY 
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : 'figma-oz'; // fallback

const indexPath = path.resolve(__dirname, '..', 'dist', 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('⚠️  index.html not found, skipping path fix');
  process.exit(0);
}

let content = fs.readFileSync(indexPath, 'utf8');

// First, ensure we're starting from /dashboard/ (not already /repo/dashboard/)
// Replace any existing repo paths back to /dashboard/
content = content.replace(new RegExp(`/${repoName}/dashboard/`, 'g'), '/dashboard/');

// Now replace /dashboard/ with /[repo-name]/dashboard/ for GitHub Pages
content = content.replace(/\/dashboard\//g, `/${repoName}/dashboard/`);

fs.writeFileSync(indexPath, content, 'utf8');
console.log(`✅ Fixed paths in index.html for GitHub Pages (repo: ${repoName})`);

