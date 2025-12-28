// This is the FULL React code you received, updated to work with our setup
// Copy this to App.tsx after npm install

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { loadProjectData, ProjectData } from "./data/loadData";
import { HomeTab } from "./components/HomeTab";
import { TasksTab } from "./components/TasksTab";
import { LogsTab } from "./components/LogsTab";
import { FilesTab } from "./components/FilesTab";
import { ReasoningTab } from "./components/ReasoningTab";

// Helper functions
function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "rounded-[28px] border border-white/25 bg-white/35 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]",
        "dark:bg-white/8 dark:border-white/10",
        className
      )}
    >
      {children}
    </Card>
  );
}

function SoftBadge({
  children,
  variant = "secondary",
}: {
  children: React.ReactNode;
  variant?: "secondary" | "outline";
}) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-2xl border-white/25 bg-white/40 text-foreground",
        "dark:bg-white/10 dark:border-white/10"
      )}
    >
      {children}
    </Badge>
  );
}

function ProgressRing({
  value,
  label,
  sub,
}: {
  value: number; // 0..1
  label: string;
  sub?: string;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, value)) * c;
  return (
    <div className="flex items-center gap-4">
      <svg width="86" height="86" viewBox="0 0 86 86" className="shrink-0">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <circle cx="43" cy="43" r={r} stroke="currentColor" strokeOpacity="0.10" strokeWidth="10" fill="none" />
        <circle
          cx="43"
          cy="43"
          r={r}
          stroke="url(#g)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 43 43)"
        />
        <text x="43" y="46" textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="700">
          {pct(value)}
        </text>
      </svg>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-white/20 bg-white/30 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tags.map((t) => (
        <SoftBadge key={t} variant="secondary">
          {t}
        </SoftBadge>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      className={cn(
        "rounded-2xl border border-white/25 bg-white/45 backdrop-blur-xl",
        "hover:bg-white/55 dark:bg-white/10 dark:border-white/10"
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 900);
        } catch {
          // ignore
        }
      }}
    >
      {copied ? "הועתק" : "העתק"}
    </Button>
  );
}

function useLocalChecklist(key: string, ids: string[]) {
  const [state, setState] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return Object.fromEntries(ids.map((id) => [id, false]));
      const parsed = JSON.parse(raw);
      const base = Object.fromEntries(ids.map((id) => [id, false]));
      return { ...base, ...parsed };
    } catch {
      return Object.fromEntries(ids.map((id) => [id, false]));
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return {
    state,
    toggle: (id: string) => setState((s) => ({ ...s, [id]: !s[id] })),
    setAll: (v: boolean) => setState(Object.fromEntries(ids.map((id) => [id, v]))),
  };
}

// Screens
function DashboardScreen({ data }: { data: ProjectData }) {
  const pipelineIds = data.pipeline.map((p) => p.id);
  const checklist = useLocalChecklist("oz.dashboard.pipeline", pipelineIds);

  const completion = useMemo(() => {
    const total = pipelineIds.length;
    const done = pipelineIds.filter((id) => checklist.state[id]).length;
    return total === 0 ? 0 : done / total;
  }, [checklist.state, pipelineIds]);

  const confidenceSeries = useMemo(
    () => [
      { name: "Local", value: Math.round(data.gates.local.confidence * 100) },
      { name: "Structural", value: Math.round(data.gates.local.structural * 100) },
      { name: "Vision", value: data.gates.vision.enabledByDefault ? 100 : 30 },
    ],
    [data]
  );

  const historySeries = useMemo(() => {
    const points = data.recent
      .slice()
      .reverse()
      .map((x, idx) => ({
        date: x.date,
        items: x.items.length,
        score: Math.min(100, 35 + idx * 18 + x.items.length * 5),
      }));
    return points;
  }, [data]);

  return (
    <div className="grid gap-6">
      <GlassCard>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-2xl">{data.meta.name}</CardTitle>
              <div className="mt-1 text-sm text-muted-foreground">
                MVP: <span className="font-medium">{data.meta.mvp}</span> · עודכן: {data.meta.updated}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <SoftBadge variant="outline">Repo: {data.meta.repo}</SoftBadge>
                <SoftBadge>Shift-Left</SoftBadge>
                <SoftBadge>Text Field focus</SoftBadge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProgressRing value={completion} label="התקדמות MVP" sub="Checklist מקומי (לפי השלבים)" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Stat label="Gate מקומי" value={`${pct(data.gates.local.confidence)} + structural ${pct(data.gates.local.structural)}`} hint="Strict gating" />
            <Stat label="AI Vision" value="Opt-in" hint={data.gates.vision.role} />
            <Stat label="Build" value={<span className="font-mono">{data.build.command}</span>} />
            <Stat label="Scope" value="Text Field בלבד" hint="Button/Checkbox/Dropdown – ארכיטקטורה לעתיד" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">שלבי ה-MVP (סמן מה Done אצלך)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {data.pipeline.map((p, idx) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-start gap-3 rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl",
                      "dark:bg-white/7 dark:border-white/10"
                    )}
                  >
                    <Checkbox
                      id={`pipe-${p.id}`}
                      checked={Boolean(checklist.state[p.id])}
                      onCheckedChange={() => checklist.toggle(p.id)}
                    />
                    <label htmlFor={`pipe-${p.id}`} className="w-full cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{idx + 1}. {p.title}</div>
                        <SoftBadge variant="outline">{p.id}</SoftBadge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{p.detail}</div>
                    </label>
                  </div>
                ))}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button className="rounded-2xl" onClick={() => checklist.setAll(true)}>
                    סמן הכל Done
                  </Button>
                  <Button variant="secondary" className="rounded-2xl" onClick={() => checklist.setAll(false)}>
                    איפוס
                  </Button>
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">גרפים</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                  <div className="text-sm font-medium">״דופק״ התקדמות (proxy)</div>
                  <div className="mt-1 text-xs text-muted-foreground">מדד פנימי לפי עושר ה-changelog, רק כדי להמחיש קצב.</div>
                  <div className="mt-3 h-[170px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historySeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeOpacity={0.1} vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={8} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} width={28} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.22)",
                            backdropFilter: "blur(14px)",
                            background: "rgba(255,255,255,0.35)",
                          }}
                          labelStyle={{ fontSize: 12 }}
                        />
                        <Area type="monotone" dataKey="score" stroke="currentColor" fill="currentColor" fillOpacity={0.12} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                  <div className="text-sm font-medium">Gates (סיכום)</div>
                  <div className="mt-2 grid gap-2">
                    {confidenceSeries.map((x) => (
                      <div key={x.name} className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">{x.name}</div>
                        <div className="text-sm font-semibold">{x.value}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">מקור אמת</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="text-sm text-muted-foreground">{data.truth.note}</div>
                <div className="grid gap-2">
                  {data.truth.docs.map((d) => (
                    <div key={d.path} className="flex items-center justify-between gap-3 rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                      <div>
                        <div className="font-medium">{d.label}</div>
                        <div className="text-xs text-muted-foreground font-mono break-all">{d.path}</div>
                      </div>
                      <CopyButton text={d.path} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">Build + artifacts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                  <div>
                    <div className="font-medium">Build</div>
                    <div className="text-xs text-muted-foreground font-mono">{data.build.command}</div>
                  </div>
                  <CopyButton text={data.build.command} />
                </div>

                <div className="grid gap-2">
                  {data.build.artifacts.map((a) => (
                    <div key={a.path} className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono text-sm break-all">{a.path}</div>
                        <CopyButton text={a.path} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{a.note}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GlassCard className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">אחסון מקומי (clientStorage)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {data.storage.map((s) => (
                  <div key={s.key} className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-sm">{s.key}</div>
                      <SoftBadge variant="outline">{s.type}</SoftBadge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.purpose}</div>
                  </div>
                ))}
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="text-base">קבצים חשובים</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div>
                  <div className="text-sm font-semibold">Must-edit</div>
                  <div className="mt-2 grid gap-2">
                    {data.files.mustEdit.map((f) => (
                      <div key={f.path} className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-mono text-xs break-all">{f.path}</div>
                          <CopyButton text={f.path} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{f.why}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="opacity-40" />

                <div>
                  <div className="text-sm font-semibold">לא לערוך</div>
                  <div className="mt-2 grid gap-2">
                    {data.files.dontEdit.map((f) => (
                      <div key={f.path} className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-mono text-xs break-all">{f.path}</div>
                          <CopyButton text={f.path} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{f.why}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </GlassCard>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">שינויים אחרונים (Changelog)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-3">
            {data.recent.map((c) => (
              <div key={c.date} className="rounded-[22px] border border-white/20 bg-white/25 p-4 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{c.date}</div>
                  <SoftBadge variant="outline">{c.items.length} items</SoftBadge>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {c.items.map((it, idx) => (
                    <li key={`${c.date}-${idx}`}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

function TreeNode({ node }: { node: { path: string; tags?: string[] } }) {
  return (
    <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-sm break-all">{node.path}</div>
        <CopyButton text={node.path} />
      </div>
      {node.tags?.length ? <TagRow tags={node.tags} /> : null}
    </div>
  );
}

function IdeasPanel({ area, data }: { area: keyof ProjectData['ideas']; data: ProjectData }) {
  const ideas = data.ideas[area] ?? [];
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-base">רעיונות / TODO – {area}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {ideas.map((i, idx) => (
            <li key={`${area}-${idx}`}>{i}</li>
          ))}
        </ul>
      </CardContent>
    </GlassCard>
  );
}

function ProjectTreeScreen({ data }: { data: ProjectData }) {
  const [activeArea, setActiveArea] = useState<keyof ProjectData['ideas']>("src/code.ts");
  const [search, setSearch] = useState("");

  const flatNodes = useMemo(() => {
    const all = data.projectTree.groups.flatMap((g) =>
      g.nodes.map((n) => ({ group: g.title, ...n }))
    );
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (n) =>
        n.path.toLowerCase().includes(q) ||
        (n.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [search, data]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">עץ הפרויקט</div>
          <div className="text-sm text-muted-foreground">מבנה קבצים + רעיונות לפי אזור</div>
        </div>
        <div className="flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי path / tag"
            className={cn(
              "rounded-2xl border-white/25 bg-white/45 backdrop-blur-xl",
              "dark:bg-white/10 dark:border-white/10"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">קבצים</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[560px] pr-3">
              <div className="grid gap-3">
                {flatNodes.map((n) => (
                  <div key={`${n.group}:${n.path}`}>
                    <div className="mb-2 text-xs text-muted-foreground">{n.group}</div>
                    <TreeNode node={n} />
                    <div className="mt-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </GlassCard>

        <div className="grid gap-4">
          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">אזורים</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {(Object.keys(data.ideas) as Array<keyof ProjectData['ideas']>).map((k) => (
                <Button
                  key={k}
                  variant={activeArea === k ? "default" : "secondary"}
                  className={cn(
                    "justify-start rounded-2xl",
                    activeArea === k
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "border border-white/25 bg-white/45 backdrop-blur-xl hover:bg-white/55 dark:bg-white/10 dark:border-white/10"
                  )}
                  onClick={() => setActiveArea(k)}
                >
                  {k}
                </Button>
              ))}
            </CardContent>
          </GlassCard>

          <IdeasPanel area={activeArea} data={data} />

          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Quick ops</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                <div className="text-sm font-medium">Build</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-muted-foreground">{data.build.command}</div>
                  <CopyButton text={data.build.command} />
                </div>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                <div className="text-sm font-medium">Repo</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-muted-foreground">{data.meta.repo}</div>
                  <CopyButton text={data.meta.repo} />
                </div>
              </div>
            </CardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData().then((loadedData) => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen text-foreground">
      {/* iOS26 soft background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-indigo-50 to-rose-50 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950" />
        <div className="absolute -top-32 -right-24 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-cyan-200/55 to-fuchsia-200/45 blur-3xl dark:from-cyan-500/20 dark:to-fuchsia-500/20" />
        <div className="absolute top-40 -left-28 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-amber-200/50 to-emerald-200/40 blur-3xl dark:from-amber-500/15 dark:to-emerald-500/15" />
        <div className="absolute bottom-[-120px] right-10 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-200/55 to-sky-200/45 blur-3xl dark:from-indigo-500/15 dark:to-sky-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:24px_24px] opacity-30 dark:opacity-10" />
      </div>

      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold">דשבורד הפרויקט</div>
            <div className="text-sm text-muted-foreground">כל מה שצריך לדעת – במקום אחד</div>
          </div>
          <div className="flex items-center gap-2">
            <SoftBadge variant="outline">MVP: {data.meta.mvp}</SoftBadge>
            <SoftBadge>Updated: {data.meta.updated}</SoftBadge>
          </div>
        </div>

        <Separator className="my-6 opacity-40" />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className={cn(
            "rounded-2xl border border-white/20 bg-white/35 backdrop-blur-xl",
            "dark:bg-white/8 dark:border-white/10"
          )}>
            <TabsTrigger value="home" onClick={() => setTab("home")} className="rounded-2xl">בית</TabsTrigger>
            <TabsTrigger value="tasks" onClick={() => setTab("tasks")} className="rounded-2xl">משימות</TabsTrigger>
            <TabsTrigger value="logs" onClick={() => setTab("logs")} className="rounded-2xl">לוגים</TabsTrigger>
            <TabsTrigger value="files" onClick={() => setTab("files")} className="rounded-2xl">קבצים</TabsTrigger>
            <TabsTrigger value="reasoning" onClick={() => setTab("reasoning")} className="rounded-2xl">ריזונינג</TabsTrigger>
            <TabsTrigger value="dashboard" onClick={() => setTab("dashboard")} className="rounded-2xl">דשבורד</TabsTrigger>
            <TabsTrigger value="tree" onClick={() => setTab("tree")} className="rounded-2xl">עץ פרויקט</TabsTrigger>
          </TabsList>
          <TabsContent value="home" activeValue={tab} className="mt-6">
            <HomeTab data={data} />
          </TabsContent>
          <TabsContent value="tasks" activeValue={tab} className="mt-6">
            <TasksTab data={data} />
          </TabsContent>
          <TabsContent value="logs" activeValue={tab} className="mt-6">
            <LogsTab data={data} />
          </TabsContent>
          <TabsContent value="files" activeValue={tab} className="mt-6">
            <FilesTab data={data} />
          </TabsContent>
          <TabsContent value="reasoning" activeValue={tab} className="mt-6">
            <ReasoningTab data={data} />
          </TabsContent>
          <TabsContent value="dashboard" activeValue={tab} className="mt-6">
            <DashboardScreen data={data} />
          </TabsContent>
          <TabsContent value="tree" activeValue={tab} className="mt-6">
            <ProjectTreeScreen data={data} />
          </TabsContent>
        </Tabs>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          הערה: הנתונים נטענים מ-truth files. אם יש שגיאה, ודא ש-`data.json` קיים (נוצר ע"י build script).
        </div>
      </div>
    </div>
  );
}

