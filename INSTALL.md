# הוראות התקנה - Dashboard React

## שלב 1: התקנת Dependencies

```bash
cd dashboard
npm install
```

## שלב 2: העתקת הקוד המלא

הקוד המלא נמצא ב-`src/App_FULL.tsx`. העתק אותו:

```bash
cp src/App_FULL.tsx src/App.tsx
```

או פתח `src/App.tsx` והעתק את התוכן מ-`App_FULL.tsx`.

## שלב 3: בדיקה

```bash
npm run dev
```

פתח `http://localhost:5173` - הדשבורד אמור להופיע.

## שלב 4: Build

```bash
npm run build
```

הפלט יהיה ב-`dashboard/dist/`.

## הערות

- הקוד משתמש ב-components פשוטים שיצרתי (לא shadcn)
- הנתונים נטענים מ-`loadProjectData()` שמחפש `data.json`
- כדי ליצור `data.json`, צריך ליצור script `scripts/generate-dashboard-data.cjs`

## מה עוד חסר?

1. **Home Tab עם Master Plan Tree** - צריך להוסיף טאב חדש עם היררכיה Phase → Epic → Task
2. **קריאת Truth Files** - צריך לעדכן `loadData.ts` לקרוא מ-EXECUTION_LOG.json, Project-plan.md, וכו'
3. **Script ליצירת data.json** - צריך script שיוצר `dashboard/data.json` מ-truth files

## בעיות נפוצות

**"Cannot find module '@/components/ui'"**
→ ודא ש-`tsconfig.json` מכיל `"paths": { "@/*": ["./src/*"] }`

**"recharts not found"**
→ `npm install recharts`

**"Tailwind classes not working"**
→ ודא ש-`tailwind.config.js` נכון ו-`index.css` מכיל `@tailwind` directives

