# 📊 GitHub Pages Data Wiring - מדריך חיווט נתונים

## 🎯 מטרה
הדשבורד ב-`xp-map` קורא נתונים מ-**xp-map repository** עצמו (לא מ-figma-oz). המסמך הזה מסביר איך החיווט עובד ואיך לוודא שהכל מסונכרן.

---

## 📁 מבנה הקבצים

### מקור האמת (Source of Truth)
הקבצים הבאים הם המקור האמת שמתעדכן על ידי סקריפט הסנכרון:

```
xp-map/
├── dashboard-sync.json          ← מקור אמת #1 (בשורש)
├── data/
│   └── data.json                ← מקור אמת #2
└── public/                       ← עותקים ל-build
    ├── dashboard-sync.json      ← עותק מ-dashboard-sync.json
    └── data/
        └── data.json            ← עותק מ-data/data.json
```

**חשוב:** הקבצים ב-`public/` חייבים להיות מסונכרנים עם המקור האמת לפני כל build.

---

## 🔄 איך הדשבורד קורא נתונים

הדשבורד משתמש ב-**3 אסטרטגיות** (בסדר עדיפות):

### 1️⃣ GitHub API (ברירת מחדל) - תמיד מעודכן
```typescript
// src/data/loadData.ts
fetchFromGitHub('dashboard-sync.json')      // ← קורא מ: https://raw.githubusercontent.com/haimXseb/xp-map/main/dashboard-sync.json
fetchFromGitHub('data/data.json')          // ← קורא מ: https://raw.githubusercontent.com/haimXseb/xp-map/main/data/data.json
```

**זה המקור העיקרי** - תמיד מעודכן כי הוא קורא ישירות מה-repository.

### 2️⃣ קבצים מקומיים (Fallback) - אם GitHub API לא זמין
```typescript
// מנסה נתיבים שונים:
'/xp-map/dashboard-sync.json'   // ← GitHub Pages (עם base path)
'/dashboard-sync.json'           // ← GitHub Pages (ללא base path)
'./dashboard-sync.json'          // ← Relative path
```

**זה עובד כי:**
- Vite מעתיק אוטומטית את כל הקבצים מ-`public/` ל-`dist/` בזמן build
- GitHub Pages מגיש את `dist/` (מה-artifact)
- הקבצים ב-`dist/` זמינים דרך HTTP

### 3️⃣ Default Data (Fallback אחרון)
אם כל השאר נכשל, הדשבורד משתמש בנתונים ברירת מחדל מובנים בקוד.

---

## ⚙️ GitHub Pages Configuration

### הגדרה מומלצת:
1. **Settings → Pages**
2. **Source:** `GitHub Actions` (לא "Deploy from a branch")
3. ה-workflow `.github/workflows/deploy.yml` מטפל בהכל

### מה ה-workflow עושה:
```yaml
1. Checkout code
2. Install dependencies (npm ci)
3. Sync data files to public/     ← מעתיק dashboard-sync.json ו-data/data.json ל-public/
4. Build (npm run build)          ← Vite בונה ל-dist/ (כולל העתקת public/)
5. Upload artifact (dist/)         ← מעלה את dist/ כ-artifact
6. Deploy to GitHub Pages          ← GitHub Pages מגיש את dist/
```

### Base Path:
- **Vite config:** `base: '/xp-map/'`
- **URL:** `https://haimXseb.github.io/xp-map/`
- **Assets:** `https://haimXseb.github.io/xp-map/assets/...`
- **Data files:** `https://haimXseb.github.io/xp-map/dashboard-sync.json`

---

## 📋 רשימת הקבצים שהדשבורד צריך

### קבצים נדרשים (חייבים להיות קיימים):

| קובץ | מיקום ב-repo | מיקום ב-dist (אחרי build) | איך מתעדכן |
|------|--------------|---------------------------|-------------|
| `dashboard-sync.json` | `/dashboard-sync.json` (שורש) | `/dist/dashboard-sync.json` | סקריפט סנכרון |
| `data/data.json` | `/data/data.json` | `/dist/data/data.json` | סקריפט סנכרון |
| `public/dashboard-sync.json` | `/public/dashboard-sync.json` | `/dist/dashboard-sync.json` | עותק מ-`/dashboard-sync.json` |
| `public/data/data.json` | `/public/data/data.json` | `/dist/data/data.json` | עותק מ-`/data/data.json` |

**חשוב:** הקבצים ב-`public/` חייבים להיות מסונכרנים עם המקור האמת לפני build.

---

## 🔍 איפה מופיע "Last Updated"

התאריך "עודכן לאחרונה" מופיע ב-3 מקומות:

1. **בדשבורד (UI):**
   - `HomeTab.tsx` - מציג `data.meta.updated`
   - מקור: `dashboard-sync.json` → `metadata.lastUpdated` או `data.json` → `meta.updated`

2. **בקוד:**
   ```typescript
   // src/data/loadData.ts
   meta: {
     updated: syncData.metadata?.lastUpdated?.split('T')[0] || fullData.meta.updated
   }
   ```

3. **בקבצי JSON:**
   - `dashboard-sync.json` → `metadata.lastUpdated` (ISO 8601: `2026-01-06T01:49:26.300Z`)
   - `data/data.json` → `meta.updated` (תאריך: `2025-12-30`)

---

## 🔄 Hard Refresh / Cache-Buster

### בעיית Cache:
לפעמים הדפדפן משתמש ב-cache ישן. הפתרונות:

### 1. Hard Refresh בדפדפן:
- **Chrome/Edge:** `Ctrl+Shift+R` (Windows) או `Cmd+Shift+R` (Mac)
- **Firefox:** `Ctrl+F5` (Windows) או `Cmd+Shift+R` (Mac)
- **Safari:** `Cmd+Option+R`

### 2. Cache-Buster (אם צריך):
אפשר להוסיף query parameter:
```typescript
// src/data/loadData.ts
const url = `https://raw.githubusercontent.com/${XP_MAP_REPO}/${BRANCH}/${path}?v=${Date.now()}`;
```

**לא מומלץ** - זה יגרום ל-reload מיותר. עדיף להשתמש ב-Hard Refresh.

### 3. DevTools:
- פתח DevTools (`F12`)
- Network tab → סמן "Disable cache"
- רענן את הדף

---

## ✅ איך לוודא שהסנכרון הגיע

### צ'ק ליסט אימות (3 צעדים):

#### 1️⃣ בדוק את תאריך ה-commit של קבצי JSON:
```bash
# מקומי
git log -1 --format="%ai %s" -- dashboard-sync.json data/data.json

# ב-GitHub
# לך ל: https://github.com/haimXseb/xp-map
# לחץ על dashboard-sync.json → History
# בדוק את התאריך של ה-commit האחרון
```

#### 2️⃣ בדוק שהדשבורד קורא את הקבצים הנכונים:
```javascript
// פתח DevTools Console בדשבורד
// תראה הודעות:
📡 Fetching data from GitHub API...
✅ Loaded data from GitHub API

// או:
⚠️  Failed to fetch from GitHub API, trying local files...
✅ Loaded data from local files
```

#### 3️⃣ בדוק את תאריך "עודכן" בדשבורד:
- פתח את הדשבורד: https://haimXseb.github.io/xp-map/
- בדוק את התאריך שמופיע ב-"עודכן: YYYY-MM-DD"
- השווה עם תאריך ה-commit של `dashboard-sync.json`

---

## 🛠️ פתרון בעיות

### בעיה: הדשבורד לא מתעדכן

**פתרון:**
1. בדוק שהקבצים ב-`public/` מסונכרנים:
   ```bash
   diff dashboard-sync.json public/dashboard-sync.json
   diff data/data.json public/data/data.json
   ```
2. אם שונים, סנכרן:
   ```bash
   cp dashboard-sync.json public/dashboard-sync.json
   cp data/data.json public/data/data.json
   ```
3. Commit ו-push:
   ```bash
   git add public/
   git commit -m "Sync public/ data files"
   git push origin main
   ```

### בעיה: 404 על קבצי JSON

**פתרון:**
1. בדוק שהקבצים קיימים ב-`dist/` אחרי build:
   ```bash
   npm run build
   ls -la dist/dashboard-sync.json dist/data/data.json
   ```
2. בדוק שה-workflow רץ בהצלחה:
   - לך ל: https://github.com/haimXseb/xp-map/actions
   - בדוק שה-last workflow run הצליח

### בעיה: נתונים ישנים

**פתרון:**
1. Hard Refresh (ראה למעלה)
2. בדוק את תאריך ה-commit (ראה למעלה)
3. אם עדיין ישן, בדוק שהסנכרון רץ:
   - בדוק ב-figma-oz repo שהסקריפט `sync:dashboard` רץ
   - בדוק שהקבצים נדחפו ל-xp-map

---

## 📝 סיכום

### הקבצים שהדשבורד צריך:
1. ✅ `dashboard-sync.json` (בשורש) - מקור אמת
2. ✅ `data/data.json` (בתיקיית data) - מקור אמת
3. ✅ `public/dashboard-sync.json` - עותק ל-build
4. ✅ `public/data/data.json` - עותק ל-build

### הגדרת GitHub Pages:
- **Source:** `GitHub Actions`
- **Branch:** `main` (אוטומטי מה-workflow)
- **Folder:** `dist/` (מה-artifact)
- **URL:** `https://haimXseb.github.io/xp-map/`

### צ'ק ליסט אימות:
1. ✅ בדוק תאריך commit של קבצי JSON
2. ✅ בדוק Console logs בדשבורד
3. ✅ בדוק תאריך "עודכן" בדשבורד

---

**עודכן לאחרונה:** 2026-01-06
