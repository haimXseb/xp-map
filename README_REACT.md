# Dashboard React Setup - הוראות התקנה

## שלב 1: התקנת Dependencies

```bash
cd dashboard
npm install
```

## שלב 2: העתקת הקוד מ-React שקיבלת

הקוד שקיבלת מ-"בונה האפליקציות" צריך להיות ב-`src/App.tsx`.

**מה לעשות:**
1. העתק את כל הקוד מ-React שקיבלת
2. שמור אותו ב-`dashboard/src/App.tsx` (תחליף את הקובץ הנוכחי)
3. ודא שיש import של `loadProjectData` מ-`./data/loadData`

## שלב 3: יצירת Components (shadcn/ui)

הקוד משתמש ב-shadcn/ui components. יש שתי אפשרויות:

### אופציה A: התקנת shadcn/ui (מומלץ)
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button input badge tabs scroll-area separator checkbox
```

### אופציה B: יצירת components פשוטים (ללא shadcn)
אפשר ליצור components פשוטים ב-`src/components/ui/` שמחקים את ה-API של shadcn.

## שלב 4: עדכון הקוד לקריאת Truth Files

הקוד הנוכחי משתמש ב-hardcoded data. צריך:

1. **עדכן `src/data/loadData.ts`**:
   - קרא מ-`docs/EXECUTION_LOG.json`
   - קרא מ-`docs/Project-plan.md`
   - קרא מ-`CHANGELOG.md`
   - קרא מ-`docs/CURRENT_STATUS.md`

2. **צור script `scripts/generate-dashboard-data.cjs`**:
   - קרא את כל ה-truth files
   - צור `dashboard/data.json` עם כל הנתונים
   - הוסף ל-`package.json` → `"build": "... && node scripts/generate-dashboard-data.cjs"`

## שלב 5: הרצה

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## שלב 6: Deploy

### GitHub Pages:
```bash
npm run build
# העלה dist/ ל-gh-pages branch
```

### Vercel:
```bash
vercel
```

## הערות

- הקוד משתמש ב-Tailwind CSS - ודא ש-`tailwind.config.js` מוגדר נכון
- הקוד משתמש ב-recharts לגרפים - ודא ש-`recharts` מותקן
- הקוד משתמש ב-Radix UI (דרך shadcn) - ודא ש-components מותקנים

## בעיות נפוצות

**"Cannot find module '@/components/ui/card'"**
→ התקן shadcn/ui או צור components פשוטים

**"recharts not found"**
→ `npm install recharts`

**"Tailwind classes not working"**
→ ודא ש-`tailwind.config.js` מכיל את ה-paths הנכונים

