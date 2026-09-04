import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Building2,
  Trophy,
  Target,
  X,
  Download,
  AlertCircle,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadGrades,
  loadMode,
  loadWeights,
  loadActiveWeight,
  saveActiveWeight,
  CLUSTER_COUNT,
  type ClusterWeights,
  type MatchMode,
} from "@/lib/edupath-store";
import { meanPoints, calculateAll23Clusters, getProgrammeCluster, bestFour, bestSeven, weightedCluster, type Programme, type MatchResult } from "@/lib/kcse";
import { downloadReport } from "@/lib/edupath-pdf";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Course Intelligence Results — EduPath AI" },
      {
        name: "description",
        content:
          "Every Kenyan university degree programme you qualify for, based on your KCSE grades.",
      },
      { property: "og:title", content: "Your Course Matches — EduPath AI" },
      {
        property: "og:description",
        content: "See every eligible degree programme, cut-off, and admission chance in seconds.",
      },
    ],
  }),
  component: ResultsPage,
});

type ChanceFilter = "all" | "high" | "moderate" | "competitive";
type SortOption = "cutoff-desc" | "cutoff-asc" | "name-asc" | "uni-asc";

function chanceFromDelta(cluster: number | null, cutoff: number | null): MatchResult["chance"] {
  if (cluster == null || cutoff == null) return "moderate";
  if (cluster >= cutoff + 3) return "high";
  if (cluster >= cutoff) return "moderate";
  if (cluster >= cutoff - 2) return "competitive";
  return "unlikely";
}

function ResultsPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<MatchMode>("estimate");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [weights, setWeights] = useState<ClusterWeights>({});
  const [activeCluster, setActiveCluster] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [uniFilter, setUniFilter] = useState<string>("all");
  const [chanceFilter, setChanceFilter] = useState<ChanceFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "public" | "private">("all");
  const [sortOption, setSortOption] = useState<SortOption>("cutoff-desc");
  const [selected, setSelected] = useState<MatchResult | null>(null);

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("edupath_saved_programmes");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const toggleSave = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("edupath_saved_programmes", JSON.stringify(Array.from(next)));
      } catch {
        // storage ignored
      }
      return next;
    });
  };

  useEffect(() => {
    const m = loadMode() ?? "estimate";
    setMode(m);
    if (m === "official") {
      const w = loadWeights();
      if (!Object.keys(w.weights || {}).length) {
        navigate({ to: "/weights" });
        return;
      }
      setWeights(w.weights);
      setName(w.name || "");
      const savedCluster = loadActiveWeight();
      setActiveCluster(savedCluster ?? Object.keys(w.weights).map(Number)[0] ?? null);
    } else {
      const loaded = loadGrades();
      let activeGrades = loaded.grades;
      if (!activeGrades || Object.keys(activeGrades).length === 0) {
        activeGrades = {};
      }
      setGrades(activeGrades);
      setName(loaded.name || "");
    }
    setReady(true);
  }, [navigate]);

  const { data: programmes = [], isLoading } = useQuery<Programme[]>({
    queryKey: ["programmes"],
    queryFn: async () => {
      // Fetch all programmes from Supabase database in parallel chunks
      const [res1, res2, res3] = await Promise.all([
        supabase
          .from("programmes")
          .select(`id, code, name, category, cutoff_2023, cutoff_2022, requirements, university:universities ( id, name, short_name, is_private, county, logo_url )`)
          .order("name", { ascending: true })
          .range(0, 999),
        supabase
          .from("programmes")
          .select(`id, code, name, category, cutoff_2023, cutoff_2022, requirements, university:universities ( id, name, short_name, is_private, county, logo_url )`)
          .order("name", { ascending: true })
          .range(1000, 1999),
        supabase
          .from("programmes")
          .select(`id, code, name, category, cutoff_2023, cutoff_2022, requirements, university:universities ( id, name, short_name, is_private, county, logo_url )`)
          .order("name", { ascending: true })
          .range(2000, 2999),
      ]);

      const all = [
        ...(res1.data || []),
        ...(res2.data || []),
        ...(res3.data || []),
      ];

      return (all as unknown as Programme[]) ?? [];
    },
    staleTime: 1000 * 60 * 30,
  });

  const matches: MatchResult[] = useMemo(() => {
    if (!ready || programmes.length === 0) return [];

    const validSubjectGrades = Object.fromEntries(
      Object.entries(grades).filter(([k]) => k !== "_meta_candidate_name")
    );

    if (mode !== "official" && Object.keys(validSubjectGrades).length === 0) {
      return [];
    }

    // Calculate all 23 clusters for the candidate
    const calculatedClusters = calculateAll23Clusters(validSubjectGrades);
    const fallbackCluster = weightedCluster(bestFour(validSubjectGrades), bestSeven(validSubjectGrades));

    return programmes.map((p) => {
      const clusterNo = getProgrammeCluster(p);

      let userPoints = 0;
      if (mode === "official") {
        userPoints = weights[clusterNo] ?? calculatedClusters[clusterNo] ?? fallbackCluster;
      } else {
        userPoints = calculatedClusters[clusterNo] || fallbackCluster;
      }

      if (!userPoints || Number.isNaN(userPoints)) {
        userPoints = fallbackCluster || 35.0;
      }

      const cutoff = p.cutoff_2023 ?? p.cutoff_2022 ?? 20.0;
      const delta = +(userPoints - cutoff).toFixed(3);
      const chance =
        userPoints >= cutoff + 3
          ? "high"
          : userPoints >= cutoff
            ? "moderate"
            : userPoints >= cutoff - 2
              ? "competitive"
              : "unlikely";

      const meetsRequirements = !p.requirements?.length || p.requirements.every((req: any) => {
        if (!req || !req.subject || !req.grade) return true;
        const candidateGrade = validSubjectGrades[req.subject];
        if (!candidateGrade) return false;
        const GRADE_ORDER = ['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','E'];
        return GRADE_ORDER.indexOf(candidateGrade) <= GRADE_ORDER.indexOf(req.grade);
      });
      const qualified = meetsRequirements && userPoints > 0;

      return {
        programme: p,
        clusterPoints: +(userPoints.toFixed(3)),
        rawClusterSum: +(userPoints.toFixed(3)),
        bestSevenTotal: bestSeven(validSubjectGrades),
        meetsRequirements,
        qualified,
        delta,
        cutoff,
        chance,
        failedSubjects: [],
      };
    });
  }, [ready, programmes, mode, weights, grades, activeCluster]);

  const filtered = useMemo(() => {
    return matches
      .filter((m) => {
        if (showSavedOnly && !savedIds.has(m.programme.id)) return false;
        if (chanceFilter !== "all" && m.chance !== chanceFilter) return false;
        if (typeFilter !== "all") {
          const uType = m.programme.university?.is_private ? "private" : "public";
          if (uType !== typeFilter) return false;
        }
        if (uniFilter !== "all" && m.programme.university?.name !== uniFilter) return false;
        if (query) {
          const q = query.toLowerCase();
          const pName = m.programme.name.toLowerCase();
          const uName = (m.programme.university?.name ?? "").toLowerCase();
          const code = (m.programme.code ?? "").toLowerCase();
          if (!pName.includes(q) && !uName.includes(q) && !code.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "cutoff-desc") {
          const cutA = a.programme.cutoff_2023 ?? 0;
          const cutB = b.programme.cutoff_2023 ?? 0;
          return cutB - cutA;
        }
        if (sortOption === "cutoff-asc") {
          const cutA = a.programme.cutoff_2023 ?? 999;
          const cutB = b.programme.cutoff_2023 ?? 999;
          return cutA - cutB;
        }
        if (sortOption === "name-asc") {
          return a.programme.name.localeCompare(b.programme.name);
        }
        if (sortOption === "uni-asc") {
          return (a.programme.university?.name ?? "").localeCompare(
            b.programme.university?.name ?? ""
          );
        }
        return 0;
      });
  }, [matches, chanceFilter, typeFilter, uniFilter, query, sortOption, showSavedOnly, savedIds]);

  const universities = useMemo(() => {
    const set = new Set<string>();
    for (const m of matches) {
      if (m.programme.university?.name) set.add(m.programme.university.name);
    }
    return Array.from(set).sort();
  }, [matches]);

  const stats = useMemo(() => {
    const high = matches.filter((m) => m.chance === "high").length;
    const moderate = matches.filter((m) => m.chance === "moderate").length;
    const competitive = matches.filter((m) => m.chance === "competitive").length;
    const unis = new Set(matches.map((m) => m.programme.university?.name)).size;
    const best = matches[0] ?? null;
    return { high, moderate, competitive, unis, total: matches.length, best };
  }, [matches]);

  const handleDownload = () => {
    downloadReport({
      name: name || grades._meta_candidate_name || "KCSE Candidate",
      grades,
      matches: filtered,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-[#0B0F19] antialiased pb-24">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <Link to="/" className="flex items-center">
            <EduPathLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              to={mode === "official" ? "/weights" : "/match"}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Adjust Grades
            </Link>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold btn-primary-tech"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 space-y-8">
        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3 py-1 text-xs font-bold mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#0F52FF]" />
              <span>
                {mode === "official"
                  ? "Official KUCCPS Weighted Placement"
                  : "KCSE Grade Match Intelligence"}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0F19]">
              Your Course <span className="text-[#0F52FF]">Matches</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {name ? `Candidate: ${name} · ` : ""}
              Full access to all eligible Kenyan university and college degree programmes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold btn-primary-tech"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Placement Report (PDF)</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Trophy}
            label="Qualified Programmes"
            value={matches.length.toLocaleString()}
            highlight
          />
          <StatCard icon={Building2} label="Universities Matched" value={stats.unis} />
          <StatCard icon={Target} label="High Chance Options" value={stats.high} />
          <StatCard
            icon={TrendingUp}
            label="Competitive Horizons"
            value={stats.competitive}
          />
        </div>

        {/* Filter Sidebar + Results List */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Sidebar Filters */}
          <aside className="lg:sticky lg:top-6 lg:h-fit lg:col-span-4 space-y-6">
            <div className="edupath-card bg-white p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0B0F19]">
                  <SlidersHorizontal className="h-4 w-4 text-[#0F52FF]" /> Filter & Sort
                </div>
                {(chanceFilter !== "all" ||
                  uniFilter !== "all" ||
                  typeFilter !== "all" ||
                  query ||
                  showSavedOnly ||
                  sortOption !== "cutoff-desc") && (
                  <button
                    onClick={() => {
                      setChanceFilter("all");
                      setTypeFilter("all");
                      setUniFilter("all");
                      setShowSavedOnly(false);
                      setQuery("");
                      setSortOption("cutoff-desc");
                    }}
                    className="text-xs text-[#0F52FF] font-bold hover:underline"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Saved Filter Pill */}
              <div className="p-3 rounded-2xl bg-[#FAFAFB] border border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B0F19]">
                  <Bookmark className="h-4 w-4 text-[#0F52FF]" />
                  <span>Saved Options ({savedIds.size})</span>
                </div>
                <button
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition ${
                    showSavedOnly
                      ? "bg-[#0F52FF] text-white shadow-sm"
                      : "bg-white border border-border text-[#64748B] hover:text-[#0B0F19]"
                  }`}
                >
                  {showSavedOnly ? "Active" : "View"}
                </button>
              </div>

              {/* Admission Chance Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                  Admission Chance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "all", label: "All Chances" },
                    { key: "high", label: "High" },
                    { key: "moderate", label: "Moderate" },
                    { key: "competitive", label: "Competitive" },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setChanceFilter(c.key as ChanceFilter)}
                      className={`rounded-xl py-2 px-3 text-xs font-bold transition text-center ${
                        chanceFilter === c.key
                          ? "bg-[#0F52FF] text-white shadow-sm"
                          : "bg-[#FAFAFB] border border-border text-[#0B0F19] hover:bg-white"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* University Type Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                  Institution Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "all", label: "All" },
                    { key: "public", label: "Public" },
                    { key: "private", label: "Private" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTypeFilter(t.key as "all" | "public" | "private")}
                      className={`rounded-xl py-1.5 px-2 text-xs font-bold transition text-center ${
                        typeFilter === t.key
                          ? "bg-[#0F52FF] text-white"
                          : "bg-[#FAFAFB] border border-border text-[#64748B] hover:bg-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific University Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  University ({universities.length})
                </label>
                <select
                  value={uniFilter}
                  onChange={(e) => setUniFilter(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#FAFAFB] px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F52FF]/20"
                >
                  <option value="all">All Universities ({universities.length})</option>
                  {universities.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting Order */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Sort Order
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-border bg-[#FAFAFB] px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F52FF]/20"
                >
                  <option value="cutoff-desc">Highest Cut-off First</option>
                  <option value="cutoff-asc">Lowest Cut-off First</option>
                  <option value="name-asc">Programme Name (A–Z)</option>
                  <option value="uni-asc">University Name (A–Z)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Right Main Results List */}
          <div className="space-y-4 lg:col-span-8">
            {/* Search Input Bar */}
            <div className="edupath-card bg-white sticky top-4 z-10 p-3 shadow-subtle flex items-center gap-2">
              <Search className="ml-2 h-4 w-4 text-[#64748B] shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search programme name, university, or course code…"
                className="flex-1 bg-transparent px-2 py-1 text-sm font-medium outline-none text-[#0B0F19] placeholder:text-[#64748B]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-lg p-1 text-[#64748B] hover:text-[#0B0F19] hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results State */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-3xl edupath-card bg-white" />
                ))}
              </div>
            ) : mode !== "official" && Object.keys(grades).filter((k) => k !== "_meta_candidate_name").length === 0 ? (
              <div className="edupath-card bg-white rounded-3xl p-12 text-center shadow-subtle">
                <AlertCircle className="mx-auto h-10 w-10 text-[#64748B] mb-3" />
                <h3 className="font-display font-bold text-lg text-[#0B0F19]">
                  No grades entered
                </h3>
                <p className="mt-1 text-xs text-[#64748B] max-w-md mx-auto">
                  Please enter your KCSE grades to see your course matches and eligibility.
                </p>
                <Link
                  to="/match"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold btn-primary-tech"
                >
                  Enter KCSE Grades
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="edupath-card bg-white rounded-3xl p-12 text-center shadow-subtle">
                <AlertCircle className="mx-auto h-10 w-10 text-[#64748B] mb-3" />
                <h3 className="font-display font-bold text-lg text-[#0B0F19]">
                  No courses match your criteria
                </h3>
                <p className="mt-1 text-xs text-[#64748B] max-w-md mx-auto">
                  Try adjusting your search query, clearing filters, or switching between cluster
                  weights.
                </p>
                <button
                  onClick={() => {
                    setChanceFilter("all");
                    setTypeFilter("all");
                    setUniFilter("all");
                    setQuery("");
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold btn-primary-tech"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#64748B] font-semibold px-2">
                  <span>
                    Showing {filtered.length.toLocaleString()} of {matches.length.toLocaleString()}{" "}
                    qualified courses
                  </span>
                  <span>Click any card for full details</span>
                </div>

                {/* All Courses Unlocked & Interactive */}
                {filtered.slice(0, 200).map((m) => (
                  <button
                    key={m.programme.id}
                    onClick={() => setSelected(m)}
                    className="group block w-full text-left"
                  >
                    <ProgrammeCard
                      match={m}
                      mode={mode}
                      isSaved={savedIds.has(m.programme.id)}
                      onToggleSave={(e) => toggleSave(m.programme.id, e)}
                    />
                  </button>
                ))}

                {filtered.length > 200 && (
                  <p className="py-4 text-center text-xs text-[#64748B]">
                    Showing top 200 matches — refine with search or filters to narrow down further.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Detail Drawer Modal */}
      {selected && (
        <DetailDrawer
          match={selected}
          mode={mode}
          isSaved={savedIds.has(selected.programme.id)}
          onToggleSave={() => toggleSave(selected.programme.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="edupath-card bg-white rounded-3xl p-5 shadow-subtle">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#0F52FF] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div
        className={`mt-3 font-display text-2xl sm:text-3xl font-extrabold ${
          highlight ? "text-[#0F52FF]" : "text-[#0B0F19]"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-[#64748B] truncate">{label}</div>
    </div>
  );
}

function ChanceBadge({ chance }: { chance: MatchResult["chance"] }) {
  const map: Record<MatchResult["chance"], { bg: string; label: string }> = {
    high: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "High Chance",
    },
    moderate: {
      bg: "bg-[#EEF4FF] text-[#0F52FF] border-[#0F52FF]/20",
      label: "Moderate Chance",
    },
    competitive: {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      label: "Competitive",
    },
    unlikely: {
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      label: "Longshot",
    },
  };
  const conf = map[chance] ?? map.moderate;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${conf.bg}`}
    >
      {conf.label}
    </span>
  );
}

function ProgrammeCard({
  match,
  mode,
  isSaved,
  onToggleSave,
}: {
  match: MatchResult;
  mode: MatchMode;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  const p = match.programme;
  const cutoff = p.cutoff_2023 ?? p.cutoff_2022;
  const diff = match.delta;

  return (
    <div className="edupath-card bg-white p-5 sm:p-6 transition hover:border-[#0F52FF]/40 hover:shadow-card group relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#FAFAFB] px-2 py-0.5 font-mono text-[10px] font-bold text-[#64748B] border border-border">
              {p.code ?? "DEGREE"}
            </span>
            <ChanceBadge chance={match.chance} />
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#0B0F19] group-hover:text-[#0F52FF] transition">
            {p.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
            <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
            <span>{p.university?.name ?? "Chartered University"}</span>
            {p.university?.county && (
              <>
                <span>•</span>
                <span>{p.university.county}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-border shrink-0">
          <div className="text-left sm:text-right">
            <div className="text-[10px] uppercase font-bold text-[#64748B]">Your Points</div>
            <div className="font-display font-extrabold text-lg text-[#0F52FF]">
              {match.clusterPoints.toFixed(2)}
            </div>
          </div>
          {cutoff != null && (
            <div className="text-right text-[11px] text-[#64748B] mt-0.5">
              Cut-off: <strong>{cutoff.toFixed(2)}</strong> (
              <span className={diff >= 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
              </span>
              )
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onToggleSave}
        className="absolute top-5 right-5 p-2 rounded-xl text-[#64748B] hover:text-[#0F52FF] hover:bg-[#EEF4FF] transition"
        title={isSaved ? "Saved" : "Save Programme"}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-[#0F52FF] text-[#0F52FF]" : ""}`} />
      </button>
    </div>
  );
}

function DetailDrawer({
  match,
  mode,
  isSaved,
  onToggleSave,
  onClose,
}: {
  match: MatchResult;
  mode: MatchMode;
  isSaved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}) {
  const p = match.programme;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <span className="rounded-md bg-[#EEF4FF] text-[#0F52FF] px-2.5 py-0.5 font-mono text-[10px] font-bold">
                {p.code ?? "DEGREE"}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0B0F19] mt-2">
                {p.name}
              </h2>
              <div className="text-xs text-[#64748B] mt-1 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>{p.university?.name}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-[#64748B] hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="text-[10px] font-bold uppercase text-[#64748B]">Your Score</div>
              <div className="font-display font-extrabold text-2xl text-[#0F52FF] mt-1">
                {match.clusterPoints.toFixed(2)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFB] border border-border">
              <div className="text-[10px] font-bold uppercase text-[#64748B]">2023 Cut-off</div>
              <div className="font-display font-extrabold text-2xl text-[#0B0F19] mt-1">
                {p.cutoff_2023?.toFixed(2) ?? "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[#0B0F19]">Cut-off Benchmarks</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#FAFAFB] border border-border">
                <div className="text-[10px] font-bold text-[#64748B]">2022 Cut-off</div>
                <div className="font-extrabold text-[#0B0F19] mt-0.5">
                  {p.cutoff_2022 ? p.cutoff_2022.toFixed(2) : "—"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAFB] border border-border">
                <div className="text-[10px] font-bold text-[#64748B]">2023 Cut-off</div>
                <div className="font-extrabold text-[#0B0F19] mt-0.5">
                  {p.cutoff_2023 ? p.cutoff_2023.toFixed(2) : "—"}
                </div>
              </div>
            </div>
          </div>

          {p.requirements && (
            <div className="space-y-2">
              <h4 className="font-display font-bold text-sm text-[#0B0F19]">Subject Requirements</h4>
              <div className="p-4 rounded-2xl bg-[#FAFAFB] border border-border text-xs text-[#64748B] leading-relaxed">
                {Array.isArray(p.requirements)
                  ? p.requirements.map((r: any, idx: number) => (
                      <div key={idx}>• {r.subjects?.join(" / ")} ≥ {r.min_grade}</div>
                    ))
                  : typeof p.requirements === "string"
                    ? p.requirements
                    : JSON.stringify(p.requirements)}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
          <button
            onClick={onToggleSave}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition ${
              isSaved
                ? "bg-[#EEF4FF] border-[#0F52FF] text-[#0F52FF]"
                : "bg-white border-border text-[#0B0F19] hover:bg-[#FAFAFB]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-[#0F52FF]" : ""}`} />
            <span>{isSaved ? "Saved to List" : "Save Course"}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold btn-primary-tech"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
