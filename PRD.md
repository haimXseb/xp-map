# Dashboard PRD - Project Management Dashboard

**Version**: 1.0  
**Last Updated**: 2025-12-28  
**Status**: Planning

---

## Executive Summary

Dashboard אונליין לניהול הפרויקט Figma Accessibility Plugin. מסך ראשי מרכזי (Home/Master Plan) שמציג תמונת מצב מלאה, עם drill-down לטאבים מפורטים.

**Core Principle**: "Single Source of Truth" - כל הנתונים נגזרים מקבצי Markdown/JSON שהפרויקט מייצר, לא מהדשבורד עצמו.

---

## 1. Architecture Overview

### Data Flow

```
┌─────────────────┐
│  Project Files  │
│  (Source Files) │
└────────┬────────┘
         │
         │ Generated/Updated by:
         │ - Cursor (after tasks)
         │ - Build scripts
         │ - Git hooks
         │
         ▼
┌─────────────────┐
│  Truth Files    │
│  (Markdown/JSON)│
└────────┬────────┘
         │
         │ Read by:
         │ - Dashboard (fetch)
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│   (HTML/JS)     │
└─────────────────┘
```

### Truth Files (Source of Truth)

| File | Format | Purpose | Updated By |
|------|--------|---------|------------|
| `docs/EXECUTION_LOG.json` | JSON | Task status, decisions, blockers | Cursor (after each task) |
| `docs/UI-Map.md` | Markdown | UI state machine, UX flow | Cursor (when UI changes) |
| `docs/Project-plan.md` | Markdown | Master plan with checkboxes | Cursor (when plan updates) |
| `docs/CURRENT_STATUS.md` | Markdown | Active vs Pending rules | Cursor (when rules change) |
| `docs/GIT_STATUS.json` | JSON | Git status snapshot | Script (pre-build hook) |
| `CONTEXT_DUMP.txt` | Text | Last context dump timestamp | Script (context dump) |
| `CHANGELOG.md` | Markdown | Completed tasks history | Cursor (after tasks) |
| `PROMPTS_LOG.json` | JSON | Prompt queue, conflicts | Dashboard (on submit) |

---

## 2. Home Tab - Master Plan View

### 2.1 Header Snapshot

**Location**: Top of Home tab  
**Purpose**: Quick status at a glance

**Components**:

1. **Current Goal**
   - **Source**: `docs/EXECUTION_LOG.json` → `currentGoal`
   - **Display**: "MVP Brain + Visibility tooling + Protocol Safety"
   - **Update**: Cursor updates after phase completion

2. **Build/Run Status**
   - **Source**: `CONTEXT_DUMP.txt` → First line header
   - **Display**: "Last Context Dump: YYYY-MM-DD HH:MM"
   - **Format**: Parse `## Last Dump: 2025-12-28 10:30:00` from file header

3. **Current Phase**
   - **Source**: `docs/EXECUTION_LOG.json` → `currentPhase`
   - **Display**: "Phase 2 / 3 / 4"
   - **Values**: `"phase2"`, `"phase3"`, `"phase4"`

4. **Blockers**
   - **Source**: `docs/EXECUTION_LOG.json` → `blockers[]`
   - **Display**: "Blockers: N" (count)
   - **Details**: Expandable list showing blocker titles

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ 🎯 Current Goal: MVP Brain + Visibility...     │
│ 📅 Last Context Dump: 2025-12-28 10:30         │
│ 🚀 Current Phase: Phase 2                       │
│ ⚠️  Blockers: 2                                │
└─────────────────────────────────────────────────┘
```

### 2.2 Progress Bars

**Location**: Below header  
**Purpose**: Visual progress indicators

**Components**:

1. **Master Plan Completion**
   - **Source**: `docs/Project-plan.md` + `docs/EXECUTION_LOG.json`
   - **Calculation**: 
     - Total: Count all `- [ ]` and `- [x]` in Project-plan.md
     - Completed: Count `- [x]` + items in EXECUTION_LOG with `status: "done"`
     - Percentage: `(completed / total) * 100`
   - **Display**: Progress bar (0-100%) + percentage text
   - **Visual**: SVG progress ring (donut chart)

2. **Rules Coverage**
   - **Source**: `docs/CURRENT_STATUS.md`
   - **Calculation**:
     - Total: Count all rules (TF-01..TF-14, BL-01..BL-05, etc.)
     - Active: Count rules with `status: "implemented"` in CURRENT_STATUS.md
     - Percentage: `(active / total) * 100`
   - **Display**: Progress bar (0-100%) + percentage text
   - **Visual**: SVG progress ring (donut chart)

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Master Plan Completion                          │
│ ████████████████░░░░░░░░ 65%                    │
│                                                 │
│ Rules Coverage                                  │
│ ████████░░░░░░░░░░░░░░░░ 40%                    │
└─────────────────────────────────────────────────┘
```

### 2.3 Quick Cards (4 Cards)

**Location**: Below progress bars  
**Purpose**: "Taste of each tab" - quick preview

**Card 1: Tasks**
- **Source**: `CHANGELOG.md` (completed) + `docs/EXECUTION_LOG.json` (pending)
- **Display**:
  - 3 last completed (from CHANGELOG.md, latest first)
  - 3 next pending (from EXECUTION_LOG.json, `status: "pending"`, sorted by priority)
- **Click**: Navigate to Tasks tab

**Card 2: Logs**
- **Source**: `docs/EXECUTION_LOG.json` → `logEntries[]`
- **Display**: Last 5 log entries
- **Format**: `[YYYY-MM-DD HH:MM] Message`
- **Click**: Navigate to Logs tab

**Card 3: UI States**
- **Source**: `docs/UI-Map.md`
- **Display**: Summary of UI state machine
  - States: `Idle → Analyzing → Review → Results`
  - Current state (if available from last run)
- **Click**: Navigate to Docs tab → UI-Map section

**Card 4: Git Status**
- **Source**: `docs/GIT_STATUS.json`
- **Display**:
  - Working tree: `clean` / `dirty` (with file count)
  - Branch: Current branch name
  - Status: `ahead N` / `behind N` / `up to date`
  - Last push: Timestamp
- **Click**: Show git commands (copy to clipboard)

**Layout**:
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Tasks      │    Logs      │  UI States   │  Git Status  │
│ 3 completed  │ 5 entries    │ Idle→Analyze │ clean, main  │
│ 3 pending    │ [timestamps]│ →Review      │ up to date   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 2.4 Master Plan Tree

**Location**: Main content area  
**Purpose**: Hierarchical view of entire project plan

**Structure**: Phase → Epic → Task

**Source**: `docs/Project-plan.md` + `docs/EXECUTION_LOG.json`

**Hierarchy**:

```
Phase 2: Ops & Visibility
├── EXECUTION_LOG.md
│   ├── Status: DONE / IN PROGRESS / TODO
│   ├── Owner: Cursor / Haim
│   └── Evidence: "docs/EXECUTION_LOG.json line X"
├── context-dump.mjs
│   ├── Status: DONE
│   ├── Owner: Cursor
│   └── Evidence: "scripts/context-dump.mjs exists"
└── UI-Map.md
    ├── Status: DONE
    ├── Owner: Cursor
    └── Evidence: "docs/UI-Map.md exists"

Phase 3: Rules
├── Text Field (TF-01..TF-14)
│   ├── TF-01: Status, Owner, Evidence
│   ├── TF-02: Status, Owner, Evidence
│   └── ...
├── Button (BL-01..BL-05)
│   └── ...
├── Checkbox (CB-01..CB-03)
│   └── ...
└── Select (SC-01..SC-03)
    └── ...

Phase 4: Wiring
├── code.ts wiring
│   ├── Status: IN PROGRESS
│   ├── Owner: Cursor
│   └── Evidence: "src/code.ts has orchestrator, missing rule hooks"
└── schema conformance
    ├── Status: TODO
    ├── Owner: Cursor
    └── Evidence: "src/protocol.ts needs validation"
```

**Display Format**:

Each row shows:
- **Icon**: ✅ (done) / 🔄 (in-progress) / ⏳ (todo)
- **Name**: Phase/Epic/Task name
- **Status Badge**: DONE / IN PROGRESS / TODO
- **Owner**: Cursor / Haim
- **Evidence Link**: Clickable link to verify (file path + line/function)

**Interaction**:
- Click on Phase → Expand/collapse children
- Click on Evidence → Show file content (if available via API) or copy path
- Filter by: Status, Owner, Phase

**Data Structure** (from EXECUTION_LOG.json):

```json
{
  "phases": [
    {
      "id": "phase2",
      "name": "Ops & Visibility",
      "epics": [
        {
          "id": "execution-log",
          "name": "EXECUTION_LOG.md",
          "status": "done",
          "owner": "Cursor",
          "evidence": "docs/EXECUTION_LOG.json",
          "tasks": []
        },
        {
          "id": "rules",
          "name": "Rules Implementation",
          "status": "in-progress",
          "owner": "Cursor",
          "evidence": "src/rules/textField.ts",
          "tasks": [
            {
              "id": "tf-01",
              "name": "TF-01: Field Label",
              "status": "done",
              "owner": "Cursor",
              "evidence": "src/rules/textField.ts:45-67"
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.5 Prompt Queue

**Location**: Bottom of Home tab  
**Purpose**: Manage prompts to prevent spaghetti

**Source**: `PROMPTS_LOG.json`

**Display**:

For each prompt in queue:
- **Prompt Text**: First 100 chars + "..."
- **Tags**: `[code.ts, ui.html, protocol, docs]`
- **Phase**: `2/3/4`
- **Locked**: `true/false` (if locked, show lock icon)
- **Conflicts**: List conflicting prompts (by tags)
- **Created**: Timestamp

**Actions**:
- **"Send to Cursor"**: 
  - Shows normalized prompt version
  - Includes "What's already DONE" context (from EXECUTION_LOG)
  - Prevents duplication
  - **Note**: Doesn't actually send (no API integration), just formats for copy

**Data Structure** (PROMPTS_LOG.json):

```json
{
  "prompts": [
    {
      "id": "prompt-001",
      "text": "Create TF-01 rule...",
      "tags": ["code.ts", "rules"],
      "phase": "phase3",
      "locked": false,
      "conflicts": [],
      "created": "2025-12-28T10:30:00Z",
      "touches": ["src/code.ts", "src/rules/textField.ts"]
    }
  ]
}
```

---

## 3. Existing Tabs (Enhanced)

### 3.1 Tasks Tab

**Current**: Reads CHANGELOG.md + Project-plan.md  
**Enhancement**: 
- Add filter (completed/in-progress/pending)
- Add owner column
- Add evidence links
- Add drill-down to Master Plan Tree

### 3.2 Logs Tab

**Current**: Static display  
**Enhancement**:
- Read from `docs/EXECUTION_LOG.json` → `logEntries[]`
- Filter by date, type, phase
- Search functionality

### 3.3 Files Tab

**Current**: Static list  
**Enhancement**:
- Read from `docs/GIT_STATUS.json` → `modifiedFiles[]`
- Show actual file modification times
- Link to GitHub (if repo available)

### 3.4 Docs Tab

**Current**: Basic links  
**Enhancement**:
- Organized by category (Source of Truth, Project Docs, Research)
- Show last modified date
- Quick preview (first 200 chars)

### 3.5 Reasoning Tab

**Current**: Empty  
**Enhancement**:
- Read from `docs/EXECUTION_LOG.json` → `reasoning[]`
- Each entry shows:
  - Action taken
  - Why (reasoning)
  - Related files
  - Timestamp

### 3.6 New Task Tab

**Current**: Saves to localStorage  
**Enhancement**:
- Save to `PROMPTS_LOG.json` (or append to EXECUTION_LOG.json)
- Auto-detect conflicts (by tags)
- Suggest phase based on task content

---

## 4. Data Files Specification

### 4.1 docs/EXECUTION_LOG.json

**Format**: JSON  
**Purpose**: Single source of truth for task status, decisions, blockers

**Schema**:

```json
{
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2025-12-28T10:30:00Z",
    "currentPhase": "phase3",
    "currentGoal": "MVP Brain + Visibility tooling + Protocol Safety"
  },
  "blockers": [
    {
      "id": "blocker-001",
      "title": "Missing TF-01 implementation",
      "description": "TF-01 rule not implemented in src/rules/textField.ts",
      "severity": "high",
      "created": "2025-12-28T10:00:00Z"
    }
  ],
  "phases": [
    {
      "id": "phase2",
      "name": "Ops & Visibility",
      "epics": [
        {
          "id": "execution-log",
          "name": "EXECUTION_LOG.md",
          "status": "done",
          "owner": "Cursor",
          "evidence": "docs/EXECUTION_LOG.json",
          "tasks": []
        }
      ]
    }
  ],
  "logEntries": [
    {
      "timestamp": "2025-12-28T10:30:00Z",
      "type": "task_completed",
      "message": "Created EXECUTION_LOG.json structure",
      "phase": "phase2",
      "files": ["docs/EXECUTION_LOG.json"]
    }
  ],
  "reasoning": [
    {
      "timestamp": "2025-12-28T10:30:00Z",
      "action": "Created EXECUTION_LOG.json",
      "why": "Need single source of truth for task status",
      "relatedFiles": ["docs/EXECUTION_LOG.json"],
      "phase": "phase2"
    }
  ]
}
```

**Updated By**: Cursor (after each task completion)

### 4.2 docs/UI-Map.md

**Format**: Markdown  
**Purpose**: UI state machine documentation

**Structure**:

```markdown
# UI State Machine

## States
- `IDLE` - No selection
- `IDENTIFYING` - Scanning/vision in progress
- `NEEDS_CONFIRMATION` - ASK flow
- `IDENTIFIED` - Confirmed by user
- `PLAN_READY` - Plan shown
- `EXECUTING` - Applying fixes
- `DONE` - Complete

## Transitions
IDLE → IDENTIFYING (on selection + "Accessible it" click)
IDENTIFYING → NEEDS_CONFIRMATION (if confidence < 0.90)
IDENTIFYING → IDENTIFIED (if confidence >= 0.90)
...
```

**Updated By**: Cursor (when UI state machine changes)

### 4.3 docs/CURRENT_STATUS.md

**Format**: Markdown  
**Purpose**: Active vs Pending rules

**Structure**:

```markdown
# Current Rules Status

## Text Field Rules
- TF-01: Field Label - ✅ Implemented (src/rules/textField.ts:45)
- TF-02: Field Required - ⏳ Pending
- TF-03: Field Validation - ✅ Implemented
...

## Button Rules
- BL-01: Button Roles - ✅ Implemented
- BL-02: Button Labeling - ⏳ Pending
...
```

**Updated By**: Cursor (when rules are implemented)

### 4.4 docs/GIT_STATUS.json

**Format**: JSON  
**Purpose**: Git status snapshot

**Schema**:

```json
{
  "branch": "main",
  "workingTree": "clean",
  "modifiedFiles": [],
  "ahead": 0,
  "behind": 0,
  "lastPush": "2025-12-27T14:20:00Z",
  "lastCommit": "2025-12-28T10:30:00Z",
  "timestamp": "2025-12-28T10:30:00Z"
}
```

**Updated By**: Script (pre-build hook) - `scripts/git-status.cjs`

### 4.5 CONTEXT_DUMP.txt

**Format**: Text with header  
**Purpose**: Last context dump timestamp

**Structure**:

```
## Last Dump: 2025-12-28 10:30:00
## Generated by: scripts/context-dump.mjs

[Context content...]
```

**Updated By**: Script (context dump script)

### 4.6 PROMPTS_LOG.json

**Format**: JSON  
**Purpose**: Prompt queue management

**Schema**:

```json
{
  "prompts": [
    {
      "id": "prompt-001",
      "text": "Full prompt text...",
      "tags": ["code.ts", "ui.html"],
      "phase": "phase3",
      "locked": false,
      "conflicts": ["prompt-002"],
      "created": "2025-12-28T10:30:00Z",
      "touches": ["src/code.ts", "ui/ui.html"],
      "status": "pending"
    }
  ]
}
```

**Updated By**: Dashboard (on prompt submit)

---

## 5. Implementation Details

### 5.1 File Reading Strategy

**Static HTML Limitation**: Cannot read files directly from filesystem

**Solution**: 
- **Option A**: GitHub Pages + Raw GitHub URLs
  - Read files via: `https://raw.githubusercontent.com/[user]/[repo]/main/docs/EXECUTION_LOG.json`
  - **Pros**: Simple, no server needed
  - **Cons**: Requires public repo, CORS issues

- **Option B**: Vercel/Netlify + API endpoints
  - API endpoint: `/api/files.js` reads files from project
  - **Pros**: Works with private repos, no CORS
  - **Cons**: Requires serverless function

- **Option C**: Build-time generation
  - Script generates `dashboard/data.json` with all data
  - Dashboard reads single JSON file
  - **Pros**: Fast, no API needed
  - **Cons**: Requires rebuild on every change

**Recommendation**: Start with Option C (build-time), migrate to Option B if needed.

### 5.2 Git Status Script

**File**: `scripts/git-status.cjs`

**Purpose**: Generate `docs/GIT_STATUS.json` before build

**Implementation**:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitStatus() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const modifiedFiles = status.split('\n')
      .filter(line => line.trim())
      .map(line => line.substring(3).trim());
    
    const ahead = execSync('git rev-list --count HEAD..@{upstream} 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();
    const behind = execSync('git rev-list --count @{upstream}..HEAD 2>/dev/null || echo 0', { encoding: 'utf8' }).trim();
    
    const lastCommit = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    
    return {
      branch,
      workingTree: modifiedFiles.length > 0 ? 'dirty' : 'clean',
      modifiedFiles,
      ahead: parseInt(ahead) || 0,
      behind: parseInt(behind) || 0,
      lastCommit,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      branch: 'unknown',
      workingTree: 'unknown',
      modifiedFiles: [],
      ahead: 0,
      behind: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

const status = getGitStatus();
const outputPath = path.resolve(__dirname, '..', 'docs', 'GIT_STATUS.json');
fs.writeFileSync(outputPath, JSON.stringify(status, null, 2));
console.log('✅ GIT_STATUS.json updated');
```

**Hook**: Add to `package.json` → `"prebuild": "node scripts/git-status.cjs"`

### 5.3 Context Dump Script

**File**: `scripts/context-dump.mjs` (or `.cjs`)

**Purpose**: Generate `CONTEXT_DUMP.txt` with timestamp header

**Implementation**:

```javascript
const fs = require('fs');
const path = require('path');

const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
const header = `## Last Dump: ${timestamp}\n## Generated by: scripts/context-dump.mjs\n\n`;

// Generate context (file structure, recent changes, etc.)
const context = generateContext(); // Implementation depends on what context you want

const outputPath = path.resolve(__dirname, '..', 'CONTEXT_DUMP.txt');
fs.writeFileSync(outputPath, header + context);
console.log('✅ CONTEXT_DUMP.txt updated');
```

---

## 6. Dashboard Features Matrix

| Feature | Tab | Source File | Update Frequency | Updated By |
|---------|-----|-------------|------------------|------------|
| Current Goal | Home | EXECUTION_LOG.json | On phase change | Cursor |
| Last Context Dump | Home | CONTEXT_DUMP.txt | On context dump | Script |
| Current Phase | Home | EXECUTION_LOG.json | On phase change | Cursor |
| Blockers | Home | EXECUTION_LOG.json | On blocker add/remove | Cursor |
| Master Plan Progress | Home | Project-plan.md + EXECUTION_LOG.json | On task completion | Cursor |
| Rules Coverage | Home | CURRENT_STATUS.md | On rule implementation | Cursor |
| Recent Tasks | Home → Tasks | CHANGELOG.md + EXECUTION_LOG.json | On task completion | Cursor |
| Recent Logs | Home → Logs | EXECUTION_LOG.json | On log entry | Cursor |
| UI States | Home → Docs | UI-Map.md | On UI change | Cursor |
| Git Status | Home | GIT_STATUS.json | Pre-build | Script |
| Master Plan Tree | Home | Project-plan.md + EXECUTION_LOG.json | On task/phase change | Cursor |
| Prompt Queue | Home | PROMPTS_LOG.json | On prompt submit | Dashboard |
| All Tasks | Tasks | CHANGELOG.md + EXECUTION_LOG.json | On task completion | Cursor |
| All Logs | Logs | EXECUTION_LOG.json | On log entry | Cursor |
| Recent Files | Files | GIT_STATUS.json | Pre-build | Script |
| Documentation | Docs | File system | On doc update | Cursor |
| Reasoning | Reasoning | EXECUTION_LOG.json | On action | Cursor |
| New Task | New Task | PROMPTS_LOG.json | On submit | Dashboard |

---

## 7. User Flows

### 7.1 View Project Status

1. User opens dashboard
2. Dashboard loads Home tab (default)
3. Dashboard fetches:
   - `docs/EXECUTION_LOG.json` (status, blockers, phases)
   - `docs/Project-plan.md` (master plan)
   - `docs/CURRENT_STATUS.md` (rules)
   - `docs/GIT_STATUS.json` (git status)
   - `CONTEXT_DUMP.txt` (last dump)
4. Dashboard renders:
   - Header snapshot
   - Progress bars
   - Quick cards
   - Master Plan Tree
   - Prompt Queue
5. User can:
   - Click on any item to drill down
   - Navigate to specific tabs
   - Filter/search

### 7.2 Create New Task

1. User navigates to "New Task" tab
2. User fills form:
   - Title
   - Description
   - Status (pending/in-progress/completed)
3. User submits
4. Dashboard:
   - Checks for conflicts (by tags)
   - Shows conflicts if any
   - Saves to `PROMPTS_LOG.json`
   - Updates display
5. User clicks "Send to Cursor"
6. Dashboard shows normalized prompt with:
   - What's already DONE (from EXECUTION_LOG)
   - Context about related files
   - Formatted for copy-paste

### 7.3 View Master Plan Tree

1. User on Home tab
2. User sees hierarchical tree
3. User clicks on Phase → Expands/collapses
4. User clicks on Epic → Shows tasks
5. User clicks on Evidence link → Shows file path (or content if API available)
6. User can filter by:
   - Status (DONE/IN PROGRESS/TODO)
   - Owner (Cursor/Haim)
   - Phase

---

## 8. Technical Implementation

### 8.1 File Reading (Client-Side)

**Challenge**: Browser cannot read local files directly

**Solution A**: GitHub Pages + Raw URLs

```javascript
async function loadExecutionLog() {
  const repo = 'your-username/your-repo'; // From config
  const url = `https://raw.githubusercontent.com/${repo}/main/docs/EXECUTION_LOG.json`;
  const response = await fetch(url);
  return await response.json();
}
```

**Solution B**: Vercel API

```javascript
async function loadExecutionLog() {
  const response = await fetch('/api/files?file=docs/EXECUTION_LOG.json');
  return await response.json();
}
```

**Solution C**: Build-time data bundle

```javascript
// scripts/generate-dashboard-data.cjs
const data = {
  executionLog: require('../docs/EXECUTION_LOG.json'),
  gitStatus: require('../docs/GIT_STATUS.json'),
  // ... other data
};
fs.writeFileSync('dashboard/data.json', JSON.stringify(data));
```

```javascript
// dashboard/index.html
const data = await fetch('data.json').then(r => r.json());
```

### 8.2 Progress Ring (SVG)

**Implementation** (no libraries):

```html
<svg width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="50" fill="none" stroke="#2a3f5f" stroke-width="10"/>
  <circle cx="60" cy="60" r="50" fill="none" stroke="#4a9eff" stroke-width="10"
          stroke-dasharray="314" stroke-dashoffset="110" transform="rotate(-90 60 60)"/>
  <text x="60" y="65" text-anchor="middle" fill="#4a9eff" font-size="20" font-weight="bold">65%</text>
</svg>
```

**Calculation**: `stroke-dashoffset = circumference * (1 - percentage/100)`

### 8.3 Master Plan Tree Rendering

**Data Structure**: Nested JSON from EXECUTION_LOG.json

**Rendering**: Recursive component

```javascript
function renderPhase(phase) {
  return `
    <div class="phase">
      <div class="phase-header" onclick="togglePhase('${phase.id}')">
        <span class="icon">${getStatusIcon(phase.status)}</span>
        <span class="name">${phase.name}</span>
        <span class="badge">${phase.status}</span>
      </div>
      <div class="phase-children" id="phase-${phase.id}">
        ${phase.epics.map(epic => renderEpic(epic)).join('')}
      </div>
    </div>
  `;
}
```

---

## 9. Future Enhancements

### 9.1 Real-time Updates

**Current**: Manual refresh  
**Future**: WebSocket or Server-Sent Events for live updates

### 9.2 Cursor Integration

**Current**: Manual copy-paste  
**Future**: API endpoint that Cursor can call to update EXECUTION_LOG.json

### 9.3 Task Dependencies

**Future**: Show task dependencies in Master Plan Tree

### 9.4 Time Tracking

**Future**: Track time spent on tasks

### 9.5 Automated Testing

**Future**: Show test results in dashboard

### 9.6 Performance Metrics

**Future**: Build time, bundle size, etc.

---

## 10. Deployment Checklist

- [ ] Create `docs/EXECUTION_LOG.json` with initial structure
- [ ] Create `docs/UI-Map.md` with UI state machine
- [ ] Create `docs/CURRENT_STATUS.md` with rules status
- [ ] Create `scripts/git-status.cjs` for Git status
- [ ] Create `scripts/context-dump.mjs` for context dumps
- [ ] Update `package.json` with pre-build hook
- [ ] Implement Home tab with all sections
- [ ] Implement file reading (choose strategy)
- [ ] Test with real data
- [ ] Deploy to GitHub Pages / Vercel
- [ ] Document usage in `dashboard/README.md`

---

## 11. Success Metrics

- **Single Source of Truth**: All data comes from truth files, not dashboard
- **Drill-down**: User can go from Home → specific tab → specific item
- **Real-time**: Data reflects current project state
- **No Duplication**: Prompt queue prevents duplicate work
- **Evidence-based**: Every task has evidence link for verification

---

## 12. Enhancement Proposals (Beyond Current Plan)

### 12.1 AI-Powered Insights

**Idea**: Use AI to analyze project state and suggest next actions

**Features**:
- **Bottleneck Detection**: Identify phases/tasks that are blocking progress
- **Resource Allocation**: Suggest which tasks should be prioritized based on dependencies
- **Risk Assessment**: Flag potential blockers before they become critical
- **Completion Prediction**: Estimate time to completion based on historical data

**Implementation**:
- Analyze EXECUTION_LOG.json patterns
- Use OpenAI API (if available) or local LLM
- Generate insights daily/weekly

**Value**: Proactive project management, not just reactive tracking

---

### 12.2 Visual Timeline

**Idea**: Gantt chart or timeline view of project phases

**Features**:
- **Phase Timeline**: Visual representation of Phase 2/3/4 with dependencies
- **Milestone Tracking**: Mark major milestones (MVP, Beta, Release)
- **Burndown Chart**: Track progress over time
- **Velocity Metrics**: Tasks completed per week/month

**Implementation**:
- Use SVG or Canvas for rendering
- Data from EXECUTION_LOG.json timestamps
- Interactive: Click to zoom, filter by phase

**Value**: Better understanding of project timeline and progress

---

### 12.3 Code Coverage Dashboard

**Idea**: Show code coverage for rules implementation

**Features**:
- **Rule Coverage Map**: Visual map showing which rules are implemented
- **File Coverage**: Which files have tests, which don't
- **Test Results**: Pass/fail status for each rule test
- **Coverage Trends**: How coverage changes over time

**Implementation**:
- Parse test files (`src/rules/**/*.test.ts`)
- Track coverage from test runners
- Visual heatmap of coverage

**Value**: Ensure all rules are tested and working

---

### 12.4 Dependency Graph

**Idea**: Visual graph of task/rule dependencies

**Features**:
- **Task Dependencies**: Show which tasks depend on others
- **Rule Dependencies**: Show which rules depend on other rules
- **Critical Path**: Highlight tasks that block others
- **Impact Analysis**: Show what breaks if a task is delayed

**Implementation**:
- Build dependency graph from EXECUTION_LOG.json
- Use D3.js or similar for visualization
- Interactive: Click to see dependencies

**Value**: Better planning, avoid blocking tasks

---

### 12.5 Automated Status Reports

**Idea**: Generate weekly/monthly status reports automatically

**Features**:
- **Weekly Summary**: What was completed, what's in progress, blockers
- **Monthly Review**: Phase progress, velocity, trends
- **Stakeholder Report**: High-level summary for non-technical stakeholders
- **Export Options**: PDF, Markdown, Email

**Implementation**:
- Template-based report generation
- Data from EXECUTION_LOG.json
- Scheduled generation (cron job or GitHub Actions)

**Value**: Save time on status updates, consistent reporting

---

### 12.6 Integration with External Tools

**Idea**: Connect dashboard with external project management tools

**Features**:
- **GitHub Issues Sync**: Sync tasks with GitHub Issues
- **Notion Integration**: Export to Notion database
- **Slack Notifications**: Send updates to Slack channel
- **Calendar Integration**: Add milestones to calendar

**Implementation**:
- API integrations
- Webhook support
- OAuth for authentication

**Value**: Single dashboard, multiple tools

---

### 12.7 Search & Filtering

**Idea**: Advanced search and filtering capabilities

**Features**:
- **Full-text Search**: Search across all tasks, logs, docs
- **Advanced Filters**: Filter by date, owner, phase, status, tags
- **Saved Filters**: Save common filter combinations
- **Search History**: Remember recent searches

**Implementation**:
- Client-side search (for small datasets)
- Server-side search (for large datasets)
- Indexing for performance

**Value**: Find information quickly

---

### 12.8 Mobile Responsive

**Idea**: Optimize dashboard for mobile devices

**Features**:
- **Responsive Layout**: Works on phone/tablet
- **Touch-friendly**: Large buttons, swipe gestures
- **Offline Mode**: Cache data for offline viewing
- **Push Notifications**: Get notified of important updates

**Implementation**:
- CSS media queries
- Progressive Web App (PWA)
- Service worker for offline

**Value**: Check status on the go

---

### 12.9 Collaborative Features

**Idea**: Enable collaboration between team members

**Features**:
- **Comments**: Add comments to tasks/logs
- **Assignments**: Assign tasks to team members
- **Activity Feed**: See what others are working on
- **Notifications**: Get notified of changes

**Implementation**:
- Backend API for comments/assignments
- Real-time updates (WebSocket)
- User authentication

**Value**: Better team coordination

---

### 12.10 Analytics & Metrics

**Idea**: Deep analytics on project progress

**Features**:
- **Velocity Tracking**: Tasks completed per sprint/week
- **Cycle Time**: Time from task creation to completion
- **Blocker Frequency**: How often blockers occur
- **Phase Duration**: How long each phase takes
- **Predictive Analytics**: Predict completion dates

**Implementation**:
- Data analysis from EXECUTION_LOG.json
- Charts/graphs for visualization
- Statistical analysis

**Value**: Data-driven project management

---

### 12.11 Automated Testing Integration

**Idea**: Show test results in dashboard

**Features**:
- **Test Status**: Pass/fail for each rule test
- **Coverage Metrics**: Code coverage per rule
- **Test History**: Historical test results
- **Failure Analysis**: Why tests are failing

**Implementation**:
- Parse test output
- Integrate with test runners
- Visual test results

**Value**: Ensure quality, catch regressions early

---

### 12.12 Documentation Generator

**Idea**: Auto-generate documentation from project state

**Features**:
- **API Documentation**: Generate from code comments
- **Architecture Diagrams**: Generate from code structure
- **Change Log**: Auto-generate from EXECUTION_LOG.json
- **User Guides**: Generate from UI-Map.md

**Implementation**:
- Parse code comments
- Generate Markdown/HTML
- Template-based generation

**Value**: Always up-to-date documentation

---

### 12.13 Performance Monitoring

**Idea**: Track plugin performance metrics

**Features**:
- **Build Time**: How long builds take
- **Bundle Size**: Plugin bundle size over time
- **Runtime Performance**: Plugin execution time
- **Memory Usage**: Memory consumption

**Implementation**:
- Collect metrics during build
- Store in metrics file
- Visualize in dashboard

**Value**: Optimize performance, catch regressions

---

### 12.14 Export & Backup

**Idea**: Export dashboard data for backup/analysis

**Features**:
- **Export JSON**: Export all data as JSON
- **Export PDF**: Generate PDF report
- **Backup**: Automatic backups to cloud storage
- **Version History**: Track changes to truth files

**Implementation**:
- Export functionality
- Cloud storage integration (S3, Google Drive)
- Version control for truth files

**Value**: Data safety, historical analysis

---

### 12.15 Customizable Dashboard

**Idea**: Let users customize dashboard layout

**Features**:
- **Widgets**: Add/remove/reorder widgets
- **Themes**: Dark/light mode, custom colors
- **Layouts**: Choose layout (grid, list, etc.)
- **Preferences**: Save user preferences

**Implementation**:
- LocalStorage for preferences
- Drag-and-drop for widgets
- Theme system

**Value**: Personalized experience

---

## 13. Priority Ranking

**High Priority** (Implement First):
1. ✅ Home tab with Master Plan Tree (current plan)
2. ✅ Truth files structure (EXECUTION_LOG.json, etc.)
3. ✅ Git status integration
4. ✅ Prompt queue

**Medium Priority** (Next Phase):
1. Visual Timeline
2. Code Coverage Dashboard
3. Search & Filtering
4. Automated Status Reports

**Low Priority** (Future):
1. AI-Powered Insights
2. Integration with External Tools
3. Mobile Responsive
4. Collaborative Features

---

**End of PRD**

