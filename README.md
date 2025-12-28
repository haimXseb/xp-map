# xp-map Dashboard

Dashboard לפרויקט **figma-oz** - מציג סטטוס, התקדמות, וכל המידע הרלוונטי.

## Quick Start

```bash
npm install
npm run dev
```

פתח: http://localhost:5173/dashboard/

## Build & Deploy

```bash
npm run build
npm run preview  # לבדיקה מקומית
```

ל-GitHub Pages: ראה `CURSOR-ONBOARDING.md`

## איך זה עובד

הדשבורד קורא נתונים מ-figma-oz דרך GitHub API:
- `dashboard-sync/dashboard-sync.json` - metadata מעודכן
- `dashboard/data.json` - כל הנתונים המלאים

ראה `CURSOR-ONBOARDING.md` לפרטים מלאים.

## קישורים

- **figma-oz:** https://github.com/haimXseb/figma-oz
- **Dashboard:** https://haimXseb.github.io/xp-map/dashboard/ (אחרי deploy)
