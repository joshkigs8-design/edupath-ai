import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Beaker,
  Compass,
  Briefcase,
  Languages,
  Flame,
  Zap,
} from "lucide-react";
import {
  KCSE_SUBJECTS,
  KCSE_GRADES,
  type Grades,
  type Grade,
  meanPoints,
  bestFour,
  bestSeven,
} from "@/lib/kcse";
import { saveGrades, loadGrades, saveMode } from "@/lib/edupath-store";

export const Route = createFileRoute("/match")({
  head: () => ({
    meta: [
      { title: "Academic Cockpit — Enter KCSE Grades — EduPath AI" },
      {
        name: "description",
        content:
          "Select your KCSE grade for each subject and instantly discover every Kenyan degree programme you qualify for.",
      },
      { property: "og:title", content: "Enter Your KCSE Grades — EduPath AI" },
      {
        property: "og:description",
        content: "Match against 2,000+ Kenyan university programmes in under a second.",
      },
    ],
  }),
  component: MatchPage,
});

const CORE = ["ENG", "KIS", "MAT"] as const;

function getGradeBadgeStyle(grade: Grade | undefined) {
  if (!grade) return "border-border bg-white text-[#64748B]";
  if (grade.startsWith("A"))
    return "border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold";
  if (grade.startsWith("B")) return "border-blue-500 bg-blue-50 text-blue-700 font-extrabold";
  if (grade.startsWith("C")) return "border-amber-400 bg-amber-50 text-amber-800 font-extrabold";
  return "border-slate-300 bg-slate-100 text-slate-700 font-extrabold";
}

function pointsToLetter(pts: number): string {
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

function getGroupIcon(group: string) {
  switch (group) {
    case "Languages":
      return Languages;
    case "Sciences":
      return Beaker;
    case "Humanities":
      return Compass;
    case "Applied":
      return Briefcase;
    case "Foreign":
      return BookOpen;
    default:
      return BookOpen;
  }
}

function MatchPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [grades, setGrades] = useState<Grades>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadGrades();
    setGrades(loaded.grades);
    setName(loaded.name);
    setReady(true);
  }, []);

  const filled = Object.values(grades).filter(Boolean).length;
  const hasCore = CORE.every((c) => grades[c]);
  const canSubmit = filled >= 7 && hasCore;
  const mean = meanPoints(grades);
  const best4 = bestFour(grades);
  const best7 = bestSeven(grades);
  const letter = pointsToLetter(mean);

  const setGrade = (code: string, g: Grade | "") => {
    setGrades((prev) => {
      const next = { ...prev };
      if (!g) delete next[code as keyof Grades];
      else next[code as keyof Grades] = g;
      return next;
    });
  };

  const applySampleGrades = (type: "A" | "B+" | "C+") => {
    if (type === "A") {
      setGrades({
        ENG: "A",
        KIS: "A-",
        MAT: "A",
        BIO: "A",
        CHE: "A",
        PHY: "A-",
        HIS: "A",
        COM: "A",
      });
      if (!name) setName("Jane Wanjiku");
    } else if (type === "B+") {
      setGrades({
        ENG: "B+",
        KIS: "B",
        MAT: "A-",
        BIO: "B+",
        CHE: "B+",
        PHY: "B",
        GEO: "A-",
        BST: "A",
      });
      if (!name) setName("Kevin Otieno");
    } else if (type === "C+") {
      setGrades({
        ENG: "C+",
        KIS: "B-",
        MAT: "C+",
        BIO: "C+",
        CHE: "C",
        HIS: "B",
        CRE: "B+",
        AGR: "B",
      });
      if (!name) setName("Dennis Kiprono");
    }
  };

  const clearAll = () => {
    setGrades({});
  };

  const submit = () => {
    saveMode("estimate");
    saveGrades(grades, name);
    navigate({ to: "/cluster" });
  };

  const groups = Array.from(new Set(KCSE_SUBJECTS.map((s) => s.group)));

  if (!ready) return null;

  return (
    <div className="page-shell min-h-screen pb-24 bg-[#F8FAFC] text-[#090D16] antialiased">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3.5 flex items-center justify-between shadow-subtle">
          <Link to="/" className="inline-flex items-center">
            <EduPathLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              Sign In / Account
            </Link>
            <Link
              to="/start"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Modes
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Header Title & Quick Helper Presets */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3.5 py-1 text-xs font-bold mb-3">
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              <span>Step 2 of 3 · Subject Grade Entry</span>
            </div>
            <h1 className="hero-title font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Enter Your <span className="text-blue-600">KCSE Grades</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed">
              Select your grade for each subject you sat. English, Kiswahili, and Mathematics are
              mandatory core requirements. Enter at least 7 sat subjects.
            </p>
          </div>

          {/* Quick Demo Pre-fill Pills */}
          <div className="edupath-card bg-white p-2.5 flex flex-wrap items-center gap-2 self-start md:self-auto border border-border shadow-subtle">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-2 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-emerald-600" />
              Presets:
            </span>
            <button
              onClick={() => applySampleGrades("A")}
              className="rounded-xl px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
            >
              A Plain
            </button>
            <button
              onClick={() => applySampleGrades("B+")}
              className="rounded-xl px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
            >
              B+ Candidate
            </button>
            <button
              onClick={() => applySampleGrades("C+")}
              className="rounded-xl px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200"
            >
              C+ Candidate
            </button>
            {filled > 0 && (
              <button
                onClick={clearAll}
                className="rounded-xl p-1.5 text-xs text-[#64748B] hover:text-[#090D16] transition ml-1"
                title="Clear all grades"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left: Candidate Name & Subject Categories */}
          <div className="space-y-6 lg:col-span-8">
            {/* Candidate Name Card */}
            <div className="edupath-card bg-white p-6 shadow-card">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Candidate Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amina Otieno"
                maxLength={80}
                className="w-full rounded-xl border border-border bg-[#F8FAFC] px-4 py-3 text-sm sm:text-base font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              />
              <p className="mt-2 text-[11px] text-[#64748B]">
                Your name will appear on your personalized downloadable PDF matching report.
              </p>
            </div>

            {/* Subject Groups */}
            {groups.map((group) => {
              const Icon = getGroupIcon(group);
              const groupSubjects = KCSE_SUBJECTS.filter((s) => s.group === group);
              const groupFilled = groupSubjects.filter((s) => grades[s.code]).length;

              return (
                <div key={group} className="edupath-card bg-white p-6 shadow-card">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-[#090D16]">{group}</h2>
                    </div>
                    <span className="rounded-full bg-[#F8FAFC] border border-border px-2.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                      {groupFilled}/{groupSubjects.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {groupSubjects.map((s) => {
                      const isRequired = (CORE as readonly string[]).includes(s.code);
                      const currentGrade = grades[s.code];

                      return (
                        <div
                          key={s.code}
                          className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition ${
                            currentGrade
                              ? "border-blue-500/40 bg-blue-50/40"
                              : "border-border bg-[#F8FAFC] hover:bg-white"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-display font-bold text-xs sm:text-sm text-[#090D16] truncate">
                                {s.name}
                              </span>
                              {isRequired && (
                                <span
                                  className="text-blue-600 font-extrabold text-xs"
                                  title="Mandatory Core Subject"
                                >
                                  *
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] uppercase font-mono font-semibold text-[#64748B] tracking-wider">
                              {s.code}
                            </div>
                          </div>

                          <select
                            value={currentGrade ?? ""}
                            onChange={(e) => setGrade(s.code, e.target.value as Grade | "")}
                            className={`rounded-xl px-3 py-2 text-xs sm:text-sm font-extrabold border transition focus:outline-none focus:ring-2 focus:ring-blue-600/30 ${getGradeBadgeStyle(
                              currentGrade,
                            )}`}
                          >
                            <option value="">—</option>
                            {KCSE_GRADES.map((g) => (
                              <option key={g} value={g} className="bg-white text-[#090D16]">
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Sticky Live Aggregate Panel */}
          <aside className="lg:sticky lg:top-6 lg:h-fit lg:col-span-4 space-y-6">
            <div className="edupath-card bg-white p-6 sm:p-7 shadow-elevated border border-border space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Live Aggregate
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    canSubmit
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {filled >= 7 ? "Ready to match" : `${7 - filled} more needed`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-[#090D16]">
                  <span>Subjects Entered</span>
                  <span>{filled} of 7 min.</span>
                </div>
                <div className="h-2 rounded-full bg-[#F8FAFC] border border-border overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${Math.min((filled / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F8FAFC] border border-border p-3.5 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Mean Grade
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-blue-600">
                    {filled > 0 ? letter : "—"}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono">
                    {filled > 0 ? `${mean.toFixed(2)} pts` : "0.00"}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] border border-border p-3.5 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Best-4 (r)
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-[#090D16]">
                    {best4} <span className="text-xs font-normal text-[#64748B]">/48</span>
                  </div>
                  <div className="text-[10px] text-[#64748B]">Cluster sum</div>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] border border-border p-3.5 text-center col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                    Best-7 Aggregate (t)
                  </div>
                  <div className="mt-1 font-display text-2xl font-extrabold text-[#090D16]">
                    {best7} <span className="text-xs font-normal text-[#64748B]">/84</span>
                  </div>
                  <div className="text-[10px] text-[#64748B]">Official denominator</div>
                </div>
              </div>

              {/* Core Subjects Check */}
              <div className="rounded-2xl border border-border bg-[#F8FAFC] p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Core Subject Gates
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                  {CORE.map((code) => {
                    const has = Boolean(grades[code]);
                    return (
                      <div
                        key={code}
                        className={`rounded-xl py-1.5 flex items-center justify-center gap-1 ${
                          has
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-white border border-border text-[#64748B]"
                        }`}
                      >
                        {has ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        <span>{code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={submit}
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold btn-primary-tech disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Calculate Cluster Points</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] text-[#64748B]">
                Next: View interactive cluster formula breakdown before final matching.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
