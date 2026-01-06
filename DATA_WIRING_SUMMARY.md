# 📋 סיכום חיווט נתונים - xp-map Dashboard

## ✅ הקבצים שהדשבורד צריך (והנתיבים המדויקים)

| קובץ | מיקום ב-repo | מיקום ב-dist | URL ב-GitHub Pages |
|------|--------------|--------------|-------------------|
| `dashboard-sync.json` | `/dashboard-sync.json` | `/dist/dashboard-sync.json` | `https://haimXseb.github.io/xp-map/dashboard-sync.json` |
| `data/data.json` | `/data/data.json` | `/dist/data/data.json` | `https://haimXseb.github.io/xp-map/data/data.json` |
| `public/dashboard-sync.json` | `/public/dashboard-sync.json` | `/dist/dashboard-sync.json` | (אותו URL) |
| `public/data/data.json` | `/public/data/data.json` | `/dist/data/data.json` | (אותו URL) |

**חשוב:** הקבצים ב-`public/` חייבים להיות מסונכרנים עם המקור האמת (`dashboard-sync.json` ו-`data/data.json`) לפני build.

---

## ⚙️ המלצה חד-משמעית להגדרת GitHub Pages

### הגדרה:
1. **Settings → Pages**
2. **Source:** `GitHub Actions` ✅ (לא "Deploy from a branch")
3. **Branch:** `main` (אוטומטי מה-workflow)
4. **Folder:** `dist/` (מה-artifact)

### מה קורה:
- ה-workflow `.github/workflows/deploy.yml` רץ אוטומטית על כל push ל-`main`
- הוא מעתיק את הקבצים מ-`dashboard-sync.json` ו-`data/data.json` ל-`public/`
- Vite בונה את הפרויקט ל-`dist/` (כולל העתקת `public/`)
- GitHub Pages מגיש את `dist/` מה-artifact
- URL: `https://haimXseb.github.io/xp-map/`

---

## ✅ צ'ק ליסט אימות (3 צעדים)

### 1️⃣ בדוק תאריך commit של קבצי JSON
```bash
# מקומי
git log -1 --format="%ai %s" -- dashboard-sync.json data/data.json

# ב-GitHub
# לך ל: https://github.com/haimXseb/xp-map
# לחץ על dashboard-sync.json → History
# בדוק את התאריך של ה-commit האחרון
```

### 2️⃣ בדוק Console logs בדשבורד
```javascript
// פתח DevTools Console בדשבורד: https://haimXseb.github.io/xp-map/
// תראה:
📡 Fetching data from GitHub API...
✅ Loaded data from GitHub API
```

### 3️⃣ בדוק תאריך "עודכן" בדשבורד
- פתח: https://haimXseb.github.io/xp-map/
- בדוק את התאריך שמופיע ב-"עודכן: YYYY-MM-DD"
- השווה עם תאריך ה-commit של `dashboard-sync.json`

---

## 🔄 Hard Refresh / Cache-Buster

אם הדשבורד לא מתעדכן:
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) או `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) או `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R`

או ב-DevTools → Network tab → סמן "Disable cache" → רענן

---

## 📖 תיעוד מלא

לפרטים נוספים, ראה: `README_GITHUB_PAGES_DATA.md`
