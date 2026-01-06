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
import { loadProjectData, ProjectData } from "./data/loadData";
import { HomeTab } from "./components/HomeTab";
// Commander components
import { CommanderOverview } from "./components/CommanderOverview";
import { CommanderPhasesTab } from "./components/CommanderPhasesTab";
import { CommanderComponentsTab } from "./components/CommanderComponentsTab";
import { CommanderFixHandoffTab } from "./components/CommanderFixHandoffTab";
import { CommanderUsabilityTab } from "./components/CommanderUsabilityTab";
import { CommanderBadgesTab } from "./components/CommanderBadgesTab";
import { CommanderProgressGraph } from "./components/CommanderProgressGraph";
import { ThemeToggle } from "./components/ThemeToggle";

// Helper functions
function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
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


// Screens

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
              <CardTitle className="text-base">פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                <div className="text-sm font-medium">בנייה</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="font-mono text-xs text-muted-foreground">{data.build.command}</div>
                  <CopyButton text={data.build.command} />
                </div>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/25 p-3 backdrop-blur-xl dark:bg-white/7 dark:border-white/10">
                <div className="text-sm font-medium">מאגר</div>
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
  const [tab, setTab] = useState("commander-overview");
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData().then((loadedData) => {
      setData(loadedData);
      setLoading(false);
    });
  }, []);

  // Listen for navigation events from CommanderOverview
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      setTab(e.detail);
    };
    window.addEventListener('navigate-tab', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate-tab', handleNavigate as EventListener);
    };
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SoftBadge variant="outline">MVP: {data.meta.mvp}</SoftBadge>
            <SoftBadge>עודכן: {data.meta.updated}</SoftBadge>
          </div>
        </div>

        <Separator className="my-6 opacity-40" />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className={cn(
            "rounded-2xl border border-white/20 bg-white/35 backdrop-blur-xl",
            "dark:bg-white/8 dark:border-white/10"
          )}>
            <TabsTrigger value="commander-overview" onClick={() => setTab("commander-overview")} className="rounded-2xl">Overview</TabsTrigger>
            <TabsTrigger value="commander-phases" onClick={() => setTab("commander-phases")} className="rounded-2xl">Phases</TabsTrigger>
            <TabsTrigger value="commander-components" onClick={() => setTab("commander-components")} className="rounded-2xl">Components & Checks</TabsTrigger>
            <TabsTrigger value="commander-fix" onClick={() => setTab("commander-fix")} className="rounded-2xl">Fix & Handoff</TabsTrigger>
            <TabsTrigger value="commander-usability" onClick={() => setTab("commander-usability")} className="rounded-2xl">Usability & Feedback</TabsTrigger>
            <TabsTrigger value="commander-badges" onClick={() => setTab("commander-badges")} className="rounded-2xl">Badges</TabsTrigger>
            {/* Legacy tabs */}
            <TabsTrigger value="home" onClick={() => setTab("home")} className="rounded-2xl">בית (Legacy)</TabsTrigger>
            <TabsTrigger value="tree" onClick={() => setTab("tree")} className="rounded-2xl">עץ פרויקט</TabsTrigger>
          </TabsList>
          {/* Commander tabs */}
          <TabsContent value="commander-overview" activeValue={tab} className="mt-6">
            <div className="grid gap-6">
              <CommanderOverview data={data} />
              <CommanderProgressGraph data={data} />
            </div>
          </TabsContent>
          <TabsContent value="commander-phases" activeValue={tab} className="mt-6">
            <CommanderPhasesTab data={data} />
          </TabsContent>
          <TabsContent value="commander-components" activeValue={tab} className="mt-6">
            <CommanderComponentsTab data={data} />
          </TabsContent>
          <TabsContent value="commander-fix" activeValue={tab} className="mt-6">
            <CommanderFixHandoffTab data={data} />
          </TabsContent>
          <TabsContent value="commander-usability" activeValue={tab} className="mt-6">
            <CommanderUsabilityTab data={data} />
          </TabsContent>
          <TabsContent value="commander-badges" activeValue={tab} className="mt-6">
            <CommanderBadgesTab data={data} />
          </TabsContent>
          {/* Legacy tabs */}
          <TabsContent value="home" activeValue={tab} className="mt-6">
            <HomeTab data={data} />
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

