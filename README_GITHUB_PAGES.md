# GitHub Pages Setup

## אוטומטי (מומלץ)

הדשבורד מוגדר ל-deploy אוטומטי ל-GitHub Pages דרך GitHub Actions.

**מה קורה:**
1. כל push ל-`main` branch עם שינויים ב-`dashboard/` או ב-truth files
2. GitHub Actions בונה את הדשבורד
3. מעלה ל-GitHub Pages
4. הדשבורד זמין ב: `https://[username].github.io/[repo-name]/dashboard/`

**הגדרה ראשונית:**
1. ב-GitHub: Settings → Pages
2. Source: "GitHub Actions" (לא "Deploy from a branch")
3. זהו! כל push יבנה ויעלה אוטומטית

## ידני

אם אתה רוצה להעלות ידנית:

```bash
cd dashboard
npm run build
# העלה את תיקיית dist/ ל-gh-pages branch
```

## בדיקה מקומית

```bash
cd dashboard
npm run build
npm run preview
# פתח: http://localhost:4173
```

