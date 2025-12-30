/**
 * Data loading from xp-map repo
 * 
 * Strategy: 
 * 1. Try to fetch from GitHub API (always up-to-date)
 * 2. Fallback to local files (dashboard-sync.json + data/data.json)
 * 3. Fallback to default data
 */

const XP_MAP_REPO = 'haimXseb/xp-map';
const BRANCH = 'main';

export interface ExecutionLog {
  metadata: {
    version: string;
    lastUpdated: string;
    currentPhase: string;
    currentGoal: string;
  };
  blockers: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    created: string;
  }>;
  phases: Array<{
    id: string;
    name: string;
    epics: Array<{
      id: string;
      name: string;
      status: string;
      owner: string;
      evidence: string;
      tasks: Array<{
        id: string;
        name: string;
        status: string;
        owner: string;
        evidence: string;
      }>;
    }>;
  }>;
  logEntries: Array<{
    timestamp: string;
    type: string;
    message: string;
    phase: string;
    files: string[];
  }>;
  reasoning: Array<{
    timestamp: string;
    action: string;
    why: string;
    relatedFiles: string[];
    phase: string;
  }>;
}

export interface ProjectData {
  meta: {
    name: string;
    updated: string;
    mvp: string;
    repo: string;
  };
  truth: {
    note: string;
    docs: Array<{ label: string; path: string }>;
  };
  pipeline: Array<{
    id: string;
    title: string;
    detail: string;
  }>;
  gates: {
    local: { confidence: number; structural: number };
    vision: { enabledByDefault: boolean; role: string };
  };
  build: {
    command: string;
    artifacts: Array<{ path: string; note: string }>;
  };
  storage: Array<{
    key: string;
    type: string;
    purpose: string;
  }>;
  files: {
    mustEdit: Array<{ path: string; why: string }>;
    dontEdit: Array<{ path: string; why: string }>;
  };
  recent: Array<{
    date: string;
    items: string[];
  }>;
  projectTree: {
    groups: Array<{
      title: string;
      nodes: Array<{ path: string; tags?: string[] }>;
    }>;
  };
  ideas: Record<string, string[]>;
  executionLog?: ExecutionLog;
  gitStatus?: {
    branch: string;
    workingTree: string;
    modifiedFiles: string[];
    ahead: number;
    behind: number;
    lastCommit: string;
    lastPush: string;
    timestamp: string;
  };
  progress?: {
    masterPlan: {
      total: number;
      completed: number;
      percentage: number;
    };
    rules: {
      total: number;
      implemented: number;
      percentage: number;
    };
  };
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  sync?: {
    metadata: {
      lastUpdated: string;
      version: string;
    };
    project: {
      name: string;
      mvp: string;
      currentPhase: string;
      currentGoal: string;
    };
    status: {
      blockers: any[];
      buildStatus: string;
      workingTree: string;
      branch: string;
    };
    progress: {
      masterPlan: { total: number; completed: number; percentage: number };
      rules: { total: number; implemented: number; percentage: number };
    };
  };
}

let cachedData: ProjectData | null = null;

async function fetchFromGitHub(path: string): Promise<any> {
  const url = `https://raw.githubusercontent.com/${XP_MAP_REPO}/${BRANCH}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.json();
}

async function loadLocalFiles(): Promise<{ sync?: any; data?: ProjectData }> {
  try {
    // Try to load from local files (if they exist from sync)
    // Use fetch instead of import to avoid build-time errors if files don't exist
    // Try multiple possible paths (with and without base path)
    const possibleSyncPaths = [
      '/xp-map/dashboard-sync.json',
      '/dashboard-sync.json',
      './dashboard-sync.json',
      '../dashboard-sync.json'
    ];
    const possibleDataPaths = [
      '/xp-map/data/data.json',
      '/data/data.json',
      './data/data.json',
      '../data/data.json'
    ];
    
    // Try all possible paths for sync file
    let sync: any = null;
    for (const path of possibleSyncPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          sync = await response.json();
          break;
        }
      } catch {
        // Continue to next path
      }
    }
    
    // Try all possible paths for data file
    let data: ProjectData | null = null;
    for (const path of possibleDataPaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          data = await response.json();
          break;
        }
      } catch {
        // Continue to next path
      }
    }
    
    if (!sync && !data) {
      return {};
    }
    
    return {
      sync: sync || undefined,
      data: data || undefined
    };
  } catch (error) {
    console.warn('Failed to load local files:', error);
    return {};
  }
}

export async function loadProjectData(): Promise<ProjectData> {
  if (cachedData) {
    return cachedData;
  }

  // Strategy 1: Try GitHub API (always up-to-date)
  try {
    console.log('📡 Fetching data from GitHub API...');
    const [syncData, fullData] = await Promise.all([
      fetchFromGitHub('dashboard-sync.json'),
      fetchFromGitHub('data/data.json')
    ]);
    
    // Merge sync data into full data
    const mergedData: ProjectData = {
      ...fullData,
      sync: syncData,
      // Override with sync data if available
      meta: {
        ...fullData.meta,
        updated: syncData.metadata?.lastUpdated?.split('T')[0] || fullData.meta.updated
      },
      executionLog: {
        ...fullData.executionLog,
        metadata: {
          ...fullData.executionLog?.metadata,
          ...syncData.project,
          lastUpdated: syncData.metadata?.lastUpdated || fullData.executionLog?.metadata?.lastUpdated
        },
        blockers: syncData.status?.blockers || fullData.executionLog?.blockers || []
      },
      progress: syncData.progress || fullData.progress,
      notifications: syncData.notifications || []
    };
    
    cachedData = mergedData;
    console.log('✅ Loaded data from GitHub API');
    return mergedData;
  } catch (error) {
    console.warn('⚠️  Failed to fetch from GitHub API, trying local files...', error);
  }

  // Strategy 2: Try local files (from sync)
  try {
    const local = await loadLocalFiles();
    if (local.data) {
      cachedData = {
        ...local.data,
        sync: local.sync
      };
      console.log('✅ Loaded data from local files');
      return cachedData;
    }
  } catch (error) {
    console.warn('⚠️  Failed to load local files, using fallback...', error);
  }

  // Strategy 3: Fallback to default data
  console.warn('⚠️  Using fallback default data');
  return getDefaultData();
}

function getDefaultData(): ProjectData {
  return {
    meta: {
      name: "OZ – Design-Time Accessibility Assistant",
      updated: new Date().toISOString().split('T')[0],
      mvp: "Text Field – E2E",
      repo: "github.com/haimXseb/xp-map",
    },
    truth: {
      note: "Source of truth: Foundations + MVP rule pack. שאר המסמכים תומכים בלבד.",
      docs: [
        { label: "Foundations – engine logic", path: "docs/01-foundations/foundations-engine-logic.docx" },
        { label: "MVP rule pack", path: "docs/03-components/mvp-rule-pack.docx" },
      ],
    },
    pipeline: [
      { id: "select", title: "בחירה", detail: "המעצב בוחר נוד ב-Figma" },
      { id: "preview", title: "תצוגה מקדימה", detail: "PNG בגודל טבעי עם רקע שקוף" },
      { id: "type", title: "זיהוי סוג קומפוננטה", detail: "חוקים מקומיים עם Gate קשיח" },
      { id: "intent", title: "Intent/Label", detail: "ברירת מחדל: Unknown. Auto-resolve עד 3 הורים" },
      { id: "checks", title: "בדיקות", detail: "TF-01…TF-14 (WARN בלבד ב-MVP)" },
      { id: "fix", title: "אוטו-פיקס", detail: "רק Safe autofixes לפי קריטריונים" },
      { id: "handoff", title: "Handoff", detail: "פלט מובנה לדיזיין + Dev" },
    ],
    gates: {
      local: { confidence: 0.85, structural: 0.35 },
      vision: { enabledByDefault: false, role: "Boost + sanity check (לא dependency)" },
    },
    build: {
      command: "npm run build",
      artifacts: [
        { path: "dist/src/code.js", note: "Main plugin bundle" },
        { path: "dist/ui.html", note: "UI bundle" },
        { path: "src/ui-inline.ts", note: "Generated – לא לערוך" },
      ],
    },
    storage: [
      { key: "aims.log", type: "Array<JobLog>", purpose: "היסטוריית הרצות (UNDO)" },
      { key: "ams-settings", type: "Settings", purpose: "העדפות משתמש (provider/model/keys)" },
      { key: "OPENAI_API_KEY", type: "string", purpose: "מפתח AI Vision" },
    ],
    files: {
      mustEdit: [
        { path: "src/code.ts", why: "לוגיקה: orchestrator + detectors + gates" },
        { path: "ui/ui.html", why: "UI + state machine" },
        { path: "src/protocol.ts", why: "פרוטוקול הודעות" },
      ],
      dontEdit: [
        { path: "src/ui-inline.ts", why: "Generated" },
        { path: "dist/*", why: "Build output" },
      ],
    },
    recent: [],
    projectTree: {
      groups: [],
    },
    ideas: {},
  } as ProjectData;
}
