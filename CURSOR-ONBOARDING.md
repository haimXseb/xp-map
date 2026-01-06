# Onboarding: xp-map Dashboard - הוראות ל-Cursor

## מטרה

הדשבורד הזה מציג את הסטטוס וההתקדמות של פרויקט **figma-oz** (Figma Plugin). הנתונים מתעדכנים אוטומטית מ-figma-oz דרך GitHub API.

## איך הנתונים מגיעים

הדשבורד קורא נתונים מ-figma-oz repo בשתי דרכים:

1. **GitHub API** (ברירת מחדל) - תמיד מעודכן
   - `https://raw.githubusercontent.com/haimXseb/figma-oz/main/dashboard-sync/dashboard-sync.json`
   - `https://raw.githubusercontent.com/haimXseb/figma-oz/main/dashboard/data.json`

2. **קבצים מקומיים** (fallback) - אם GitHub API לא זמין
   - `dashboard-sync.json` (בשורש)
   - `data/data.json`

## מבנה הפרויקט

```
xp-map/
├── src/
│   ├── data/
│   │   └── loadData.ts          ← כאן קוראים את הנתונים
│   ├── components/
│   │   ├── HomeTab.tsx          ← המסך הראשי
│   │   ├── TasksTab.tsx
│   │   ├── LogsTab.tsx
│   │   └── ...
│   └── App.tsx                  ← נקודת הכניסה
├── dashboard-sync.json          ← קובץ sync (אם נדחף)
├── data/
│   └── data.json               ← נתונים מלאים (אם נדחף)
└── package.json
```

## איך להריץ

### Development

```bash
npm install
npm run dev
```

פתח: http://localhost:5173/dashboard/

### Build

```bash
npm run build
```

הקובץ נבנה ל-`dist/`

### Preview

```bash
npm run preview
```

פתח: http://localhost:4173/dashboard/

## איך לפרסם ל-GitHub Pages

### דרך 1: GitHub Actions (אוטומטי)

1. ודא שיש קובץ `.github/workflows/deploy.yml`
2. ודא ש-GitHub Pages מופעל ב-repo settings
3. כל push ל-`main` יבנה ויפרסם אוטומטית

### דרך 2: ידני

```bash
npm run build
# העתק את dist/ ל-gh-pages branch או השתמש ב-gh-pages package
```

## עדכון נתונים

הנתונים מתעדכנים אוטומטית מ-figma-oz. אין צורך לעדכן ידנית.

אם צריך לעדכן ידנית:
1. ב-figma-oz: `npm run sync:dashboard`
2. זה ידחוף את הקבצים ל-xp-map
3. הדשבורד יקרא אותם בפעם הבאה

## קבצים חשובים לעריכה

### `src/data/loadData.ts`

זה הקובץ שקורא את הנתונים. הוא מנסה:
1. GitHub API (תמיד מעודכן)
2. קבצים מקומיים (fallback)
3. נתונים ברירת מחדל (אם הכל נכשל)

**אל תשנה את הלוגיקה הזו** - היא עובדת טוב.

### `src/components/HomeTab.tsx`

המסך הראשי. כאן אפשר להוסיף/לשנות UI.

### `vite.config.ts`

הגדרות build. אם צריך לשנות base path ל-GitHub Pages.

## שאלות נפוצות

### Q: הנתונים לא מתעדכנים

**A:** 
1. בדוק את הקונסול - אולי יש שגיאת fetch
2. בדוק ש-figma-oz דחף עדכונים: https://github.com/haimXseb/figma-oz/blob/main/dashboard-sync/dashboard-sync.json
3. נסה refresh (Ctrl+R / Cmd+R)

### Q: איך אני יודע מתי יש עדכון חדש?

**A:** 
- בדוק את `metadata.lastUpdated` ב-`dashboard-sync.json`
- אפשר להוסיף notification בדשבורד כשיש עדכון

### Q: האם אפשר לעדכן את figma-oz מ-xp-map?

**A:** לא. הסינכרון הוא חד-כיווני: figma-oz → xp-map.

### Q: איך אני מוסיף תכונה חדשה?

**A:**
1. ערוך את ה-components ב-`src/components/`
2. הוסף את הנתונים ב-`loadData.ts` אם צריך
3. Build ו-test

## קישורים

- **figma-oz repo:** https://github.com/haimXseb/figma-oz
- **xp-map repo:** https://github.com/1haim/xp-map
- **Dashboard (אחרי deploy):** https://1haim.github.io/xp-map/

## הערות חשובות

⚠️ **אל תמחק את התיקייה xp-map מהפלאגין!**

התיקייה הזו היא עותק מקומי לבדיקה. היא לא משפיעה על הפלאגין, אבל:
- אם תמחק אותה, הדשבורד ימשיך לעבוד (קורא מ-GitHub API)
- אבל לא תוכל לבדוק מקומית

**הדשבורד עצמאי לחלוטין** - הוא לא תלוי בקבצים מהפלאגין בזמן ריצה.

---

**עודכן:** 2025-12-28  
**גרסה:** 1.0

