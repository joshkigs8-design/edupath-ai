import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Calculator,
  Award,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { loadGrades } from "@/lib/edupath-store";
import {
  KCSE_SUBJECTS,
  GRADE_POINTS,
  meanPoints,
  bestFour,
  bestSeven,
  weightedCluster,
  type Grade,
  type Grades,
} from "@/lib/kcse";

export const Route = createFileRoute("/cluster")({
  head: () => ({
    meta: [
      { title: "Your Cluster Points Studio — EduPath AI" },
      {
        name: "description",
        content:
          "Instant KCSE cluster point calculation — mean grade, best-4 aggregate, and per-subject points before matching to Kenyan university programmes.",
      },
      { property: "og:title", content: "Your Cluster Points — EduPath AI" },
      {
        property: "og:description",
        content: "See your KCSE cluster points before we match you to degree programmes.",
      },
    ],
  }),
  component: ClusterPage,
});

function pointsToGrade(pts: number): string {
  if (pts >= 11.5) return "A";
  if (pts >= 10.5) return "A-";
  if (pts >= 9.5) return "B+";
  if (pts >= 8.5) return "B";
  if (pts >= 7.5) return "B-";
  if (pts >= 6.5) return "C+";
  if (pts >= 5.5) return "C";
  if (pts >= 4.5) return "C-";
  if (pts >= 3.5) return "D+";
  if (pts >= 2.5) return "D";
  if (pts >= 1.5) return "D-";
  return "E";
}

function ClusterPage() {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<Grades>({});
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const l = loadGrades();
    if (Object.keys(l.grades).length === 0) {
      navigate({ to: "/match" });
      return;
    }
    setGrades(l.grades);
    setName(l.name);
    setReady(true);
  }, [navigate]);

  const entries = useMemo(
    () =>
      (Object.entries(grades) as [keyof Grades, Grade][])
        .filter(([, g]) => Boolean(g))
        .map(([code, g]) => ({
          code: code as string,
          name: KCSE_SUBJECTS.find((s) => s.code === code)?.name ?? code,
          grade: g,
          points: GRADE_POINTS[g],
        }))
        .sort((a, b) => b.points - a.points),
    [grades],
  );

  const mean = meanPoints(grades);
  const best4 = bestFour(grades);
  const best7 = bestSeven(grades);
  const sampleCluster = weightedCluster(best4, best7);
  const meanGrade = pointsToGrade(mean);

  if (!ready) return null;

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAFB] text-[#0B0F19] antialiased">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3 flex items-center justify-between shadow-subtle">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0F52FF] text-white shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display font-extrabold tracking-tight text-lg text-[#0B0F19]">
              EduPath<span className="text-[#059669]">.AI</span>
            </span>
          </Link>
          <Link
            to="/match"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-outline-clean"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Edit Grades
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Title Header */}
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3.5 py-1 text-xs mb-3">
            <Calculator className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Step 3 of 3 · Mathematical Studio</span>
          </div>
          {name && <p className="text-sm text-[#0F52FF] font-bold mb-1">Candidate: {name}</p>}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B0F19]">
            Your KCSE <span className="text-[#0F52FF]">Cluster Studio</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#64748B] leading-relaxed">
            We evaluate your top 4 cluster subject points (
            <span className="font-mono font-bold text-[#0B0F19]">r</span>) and best-7 KCSE aggregate
            (<span className="font-mono font-bold text-[#0B0F19]">t</span>), then apply the official
            KUCCPS geometric formula:{" "}
            <span className="font-mono text-[#0F52FF] font-extrabold">
              C = √((r/48) × (t/84)) × 48
            </span>
            .
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          <StatCard
            label="Mean Grade"
            value={meanGrade}
            sub={`${mean.toFixed(2)} pts average`}
            highlight
          />
          <StatCard
            label="Best-4 Aggregate (r)"
            value={String(best4)}
            sub="out of 48 max"
            highlight
          />
          <StatCard label="Best-7 Total (t)" value={String(best7)} sub="out of 84 max" highlight />
          <StatCard
            label="Sample Cluster (C)"
            value={sampleCluster.toFixed(2)}
            sub="using default top-4 as r"
            orange
          />
        </div>

        {/* Visual Calculation Workflow Box */}
        <div className="edupath-card bg-white p-6 sm:p-8 shadow-elevated mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">
            <Calculator className="h-4 w-4 text-[#0F52FF]" />
            Official KUCCPS Formula Geometric Computation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border border-border bg-[#FAFAFB] p-4">
              <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1">
                Step 1 · Cluster Fraction
              </div>
              <div className="font-mono text-sm font-bold text-[#0B0F19]">
                r / 48 = {best4} / 48
              </div>
              <div className="text-xs text-[#0F52FF] font-bold mt-1">
                = {(best4 / 48).toFixed(4)}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-[#FAFAFB] p-4">
              <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1">
                Step 2 · Total Fraction
              </div>
              <div className="font-mono text-sm font-bold text-[#0B0F19]">
                t / 84 = {best7} / 84
              </div>
              <div className="text-xs text-[#0F52FF] font-bold mt-1">
                = {(best7 / 84).toFixed(4)}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-[#FAFAFB] p-4">
              <div className="text-[10px] uppercase font-bold text-[#64748B] mb-1">
                Step 3 · Geometric Mean
              </div>
              <div className="font-mono text-xs font-bold text-[#0B0F19] truncate">
                √({(best4 / 48).toFixed(3)} × {(best7 / 84).toFixed(3)})
              </div>
              <div className="text-xs text-[#0F52FF] font-bold mt-1">
                = {Math.sqrt((best4 / 48) * (best7 / 84)).toFixed(4)}
              </div>
            </div>

            <div className="rounded-2xl border border-[#0F52FF]/40 bg-[#EEF4FF] p-4">
              <div className="text-[10px] uppercase font-bold text-[#0F52FF] mb-1">
                Step 4 · Scaled Cluster
              </div>
              <div className="font-mono text-sm font-bold text-[#0B0F19]">× 48 Points</div>
              <div className="font-display text-lg font-extrabold text-[#0F52FF] mt-0.5">
                = {sampleCluster.toFixed(2)} pts
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#64748B]">
            Note: While the sample cluster above uses your top 4 overall subjects, each specific
            degree programme uses its own 4 required cluster subjects to compute{" "}
            <span className="font-mono font-bold text-[#0B0F19]">r</span>, giving you a custom score
            for every course.
          </p>
        </div>

        {/* Per-Subject Contribution Leaderboard & Next Step Card */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Leaderboard Table */}
          <div className="edupath-card bg-white p-6 sm:p-8 shadow-subtle lg:col-span-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0B0F19]">
                  Subject Contribution Leaderboard
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Ranked by grade points (A = 12 … E = 1). Top 4 highlighted as default cluster
                  subjects.
                </p>
              </div>
              <span className="rounded-full bg-[#EEF4FF] text-[#0F52FF] px-3 py-1 text-xs font-bold">
                {entries.length} sat subjects
              </span>
            </div>

            <div className="divide-y divide-border mt-6">
              {entries.map((e, idx) => {
                const isTop4 = idx < 4;
                const isTop7 = idx < 7;
                return (
                  <div key={e.code} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-extrabold shrink-0 ${
                          isTop4
                            ? "bg-[#0F52FF] text-white shadow-sm"
                            : isTop7
                              ? "border border-border bg-[#FAFAFB] text-[#0B0F19]"
                              : "border border-border/50 bg-[#FAFAFB] text-[#64748B]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm text-[#0B0F19] truncate">
                          {e.name}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                          {e.code} {isTop4 && "· Default Cluster 4"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Bar Visualization */}
                      <div className="hidden sm:block w-28 h-2 rounded-full bg-[#FAFAFB] border border-border overflow-hidden">
                        <div
                          className={`h-full ${isTop4 ? "bg-[#0F52FF]" : "bg-[#6B6B78]/40"}`}
                          style={{ width: `${(e.points / 12) * 100}%` }}
                        />
                      </div>

                      <span className="rounded-xl border border-border bg-[#FAFAFB] px-3 py-1 text-xs sm:text-sm font-extrabold text-[#0B0F19]">
                        {e.grade}
                      </span>
                      <span className="w-8 text-right font-display text-base font-extrabold text-[#0B0F19]">
                        {e.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Next Step CTA */}
          <aside className="lg:sticky lg:top-6 lg:h-fit lg:col-span-4">
            <div className="edupath-card bg-white p-7 shadow-elevated space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                <Sparkles className="h-4 w-4 text-[#0F52FF]" /> Ready for matching
              </div>

              <h3 className="font-display text-xl font-extrabold text-[#0B0F19]">
                Match Against 2,084 Programmes
              </h3>

              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                We'll now evaluate your cluster scores against official cutoffs and enforce
                mandatory subject prerequisites across all 69 Kenyan universities.
              </p>

              <button
                onClick={() => navigate({ to: "/results" })}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold btn-primary-tech"
              >
                <span>View Qualified Courses</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                to="/match"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold btn-outline-clean"
              >
                Adjust KCSE Grades
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  orange,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  orange?: boolean;
}) {
  return (
    <div className="edupath-card bg-white rounded-3xl p-5 sm:p-6 shadow-subtle">
      <div className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[#64748B] truncate">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-3xl sm:text-4xl font-extrabold ${
          orange ? "text-[#059669]" : highlight ? "text-[#0F52FF]" : "text-[#0B0F19]"
        }`}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-[11px] text-[#64748B] truncate">{sub}</div>}
    </div>
  );
}
