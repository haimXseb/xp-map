# הוראות Deploy ל-GitHub Pages

## ✅ מה כבר מוכן

1. ✅ Build script - `npm run build` עובד
2. ✅ GitHub Actions workflow - `.github/workflows/deploy.yml`
3. ✅ Data generation - `scripts/generate-dashboard-data.cjs`
4. ✅ Git status script - `scripts/git-status.cjs`

## שלבים ל-Deploy

### 1. הגדרת GitHub Pages

1. לך ל-GitHub repository: https://github.com/haimXseb/figma-oz
2. Settings → Pages
3. Source: בחר **"GitHub Actions"** (לא "Deploy from a branch")
4. שמור

### 2. Push ל-GitHub

```bash
cd "/Users/haim/Figma plugin"
git add dashboard/ docs/EXECUTION_LOG.json docs/UI-Map.md docs/CURRENT_STATUS.md scripts/git-status.cjs scripts/generate-dashboard-data.cjs package.json
git commit -m "Add dashboard with Home tab and truth files"
git push origin main
```

### 3. בדיקת Deployment

1. לך ל-GitHub repository → Actions tab
2. תראה workflow בשם "Deploy Dashboard to GitHub Pages"
3. לחץ עליו כדי לראות את ה-progress
4. אחרי שהסתיים, הדשבורד יהיה זמין ב:
   **https://haimXseb.github.io/figma-oz/dashboard/**

## בדיקה מקומית

```bash
cd dashboard
npm run build
npm run preview
# פתח: http://localhost:4173
```

## עדכון אוטומטי

כל push ל-`main` עם שינויים ב:
- `dashboard/`
- `docs/EXECUTION_LOG.json`
- `docs/GIT_STATUS.json`
- `CHANGELOG.md`

יגרום ל-rebuild ו-deploy אוטומטי.

## הערות

- ה-workflow מריץ `npm ci` (clean install)
- מריץ `scripts/generate-dashboard-data.cjs` לפני build
- מעלה את `dashboard/dist/` ל-GitHub Pages
- הדשבורד קורא מ-`data.json` שנוצר ב-build time

