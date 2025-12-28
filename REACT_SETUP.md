# Dashboard React Setup

## Overview
הדשבורד החדש משתמש ב-React + Vite עם עיצוב iOS26 (glass morphism).

## Setup

### 1. יצירת React App חדש
```bash
cd dashboard
npm create vite@latest . -- --template react-ts
npm install
```

### 2. התקנת Dependencies
```bash
npm install recharts
npm install @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-separator
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. shadcn/ui (אופציונלי - אפשר להמיר ל-components פשוטים)
```bash
npx shadcn-ui@latest init
```

## Structure
```
dashboard/
├── src/
│   ├── App.tsx (הקוד שקיבלת)
│   ├── components/
│   │   └── ui/ (shadcn components)
│   ├── data/
│   │   └── loadData.ts (קריאת truth files)
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
└── package.json
```

## Data Loading
הקוד הנוכחי משתמש ב-hardcoded data. צריך לעדכן ל:
- קריאת `docs/EXECUTION_LOG.json`
- קריאת `docs/Project-plan.md`
- קריאת `CHANGELOG.md`
- קריאת `docs/CURRENT_STATUS.md`

## Build
```bash
npm run build
# Output: dashboard/dist/
```

## Deploy
- GitHub Pages: העלה `dist/` ל-gh-pages branch
- Vercel: `vercel` (אוטומטי)

