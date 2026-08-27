import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileImage,
  HelpCircle,
  Zap,
} from "lucide-react";
import {
  CLUSTER_COUNT,
  loadWeights,
  saveWeights,
  saveActiveWeight,
  saveMode,
  loadGrades,
  type ClusterWeights,
} from "@/lib/edupath-store";
import { calculateAll23Clusters } from "@/lib/kcse";
import { extractWeightsFromImage } from "@/lib/ocr-weights.functions";

export const Route = createFileRoute("/weights")({
  head: () => ({
    meta: [
      { title: "Official Cluster Weights & Google Gemini Vision AI — EduPath AI" },
      {
        name: "description",
        content:
          "Enter your official KUCCPS cluster weights or upload a screenshot to auto-fill with Google Gemini Vision AI.",
      },
      { property: "og:title", content: "Enter KUCCPS Cluster Weights — EduPath AI" },
      {
        property: "og:description",
        content:
          "Enter all 23 KUCCPS cluster weights and instantly match against every eligible Kenyan degree programme.",
      },
    ],
  }),
  component: WeightsPage,
});

function WeightsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [weights, setWeights] = useState<ClusterWeights>({});
  const [ready, setReady] = useState(false);
  const [ocrState, setOcrState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [ocrMessage, setOcrMessage] = useState<string>("");
  const [ocrFilledCount, setOcrFilledCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [justFilled, setJustFilled] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const extract = useServerFn(extractWeightsFromImage);

  const handleAutoCalculateFromGrades = () => {
    const loaded = loadGrades();
    if (Object.keys(loaded.grades).length === 0) {
      navigate({ to: "/match" });
      return;
    }
    const calculated = calculateAll23Clusters(loaded.grades);
    setWeights(calculated);
    setOcrFilledCount(23);
    setOcrState("done");
    setOcrMessage("⚡ Calculated all 23 official cluster weights directly from your KCSE subject grades.");
    const filledClusters = new Set(Array.from({ length: 23 }, (_, i) => i + 1));
    setJustFilled(filledClusters);
    setPulseKey((k) => k + 1);
    window.setTimeout(() => setJustFilled(new Set()), 1600);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setOcrState("error");
      setOcrMessage("Please upload an image file (PNG or JPG).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setOcrState("error");
      setOcrMessage("Image is too large (max 12 MB).");
      return;
    }

    setOcrState("loading");
    setOcrMessage("⚡ Google Gemini Vision AI is analyzing your portal screenshot…");

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(new Error("Could not read file"));
        r.readAsDataURL(file);
      });
      setPreviewUrl(dataUrl);

      const result = await extract({ data: { imageDataUrl: dataUrl } });

      if (result.candidateName && !name) {
        setName(result.candidateName);
      }

      const filledClusters = new Set<number>();
      setWeights((prev) => {
        const next = { ...prev };
        for (let i = 1; i <= CLUSTER_COUNT; i++) {
          const v = result.weights[i];
          if (typeof v === "number" && Number.isFinite(v)) {
            next[i] = v;
            filledClusters.add(i);
          }
        }
        return next;
      });

      const count = filledClusters.size;
      setOcrFilledCount(count);
      setJustFilled(filledClusters);
      setPulseKey((k) => k + 1);
      window.setTimeout(() => setJustFilled(new Set()), 1600);

      if (count === 0) {
        setOcrState("error");
        setOcrMessage(
          "No numeric weights detected in this screenshot. You can click 'Auto-Calculate from My Grades' or enter values manually.",
        );
      } else {
        setOcrState("done");
        setOcrMessage(
          `⚡ Google Gemini Vision extracted ${count} of ${CLUSTER_COUNT} cluster weights with high precision!`,
        );
      }
    } catch (err) {
      setOcrState("error");
      const msg = err instanceof Error ? err.message : "Extraction failed.";
      setOcrMessage(msg);
    }
  };

  useEffect(() => {
    const l = loadWeights();
    setWeights(l.weights);
    setName(l.name);
    setReady(true);
  }, []);

  const clusters = Array.from({ length: CLUSTER_COUNT }, (_, i) => i + 1);
  const filled = clusters.filter((c) => {
    const v = weights[c];
    return typeof v === "number" && !Number.isNaN(v);
  }).length;

  const best = clusters.reduce<{ cluster: number; value: number } | null>((acc, c) => {
    const v = weights[c];
    if (typeof v !== "number" || Number.isNaN(v)) return acc;
    if (!acc || v > acc.value) return { cluster: c, value: v };
    return acc;
  }, null);

  const canSubmit = filled > 0;

  const set = (c: number, raw: string) => {
    const trimmed = raw.trim();
    setWeights((prev) => {
      const next = { ...prev };
      if (!trimmed) {
        delete next[c];
      } else {
        const n = Number(trimmed);
        next[c] = Number.isFinite(n) ? Math.min(Math.max(n, 0), 48) : null;
      }
      return next;
    });
  };

  const submit = () => {
    saveMode("official");
    saveWeights(weights, name);
    if (best) saveActiveWeight(best.cluster);
    navigate({ to: "/results" });
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen pb-24 bg-[#FAFAFB] text-[#0B0F19] antialiased">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <Link to="/" className="flex items-center">
            <EduPathLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/start"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-semibold btn-outline-clean"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 font-bold btn-primary-tech disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Match ({filled})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 pt-4 space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3.5 py-1 text-xs mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Step 2 of 3 · Official Weights Input</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0F19]">
            Enter Your <span className="text-[#0F52FF]">Cluster Weights</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#64748B] leading-relaxed">
            Copy the weights (0–48) shown in your KUCCPS Student Portal for each of the{" "}
            {CLUSTER_COUNT} clusters, or upload a screenshot to auto-fill with Google Gemini Vision AI.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: OCR Dropzone & 23 Tiles */}
          <div className="space-y-6 lg:col-span-8">
            {/* AI Vision OCR Workbench Card */}
            <div className="edupath-card bg-white p-6 sm:p-8 shadow-elevated relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF4FF] text-[#0F52FF] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Gemini 3.6 Flash Vision OCR (Sub-Second AI)
                  </div>
                  <h2 className="mt-2 font-display text-xl sm:text-2xl font-extrabold text-[#0B0F19]">
                    Upload Portal Screenshot
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
                    Take a snapshot of your cluster weights in the KUCCPS portal or result slip.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoCalculateFromGrades}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-[#EEF4FF] text-[#0F52FF] hover:bg-[#dbe6fe] transition"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Auto-Calculate from My Grades</span>
                  </button>
                </div>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                  e.target.value = "";
                }}
              />

              {/* Upload Trigger Area */}
              <div
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-border hover:border-[#0F52FF]/60 bg-[#FAFAFB] hover:bg-white p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 group"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0F52FF] text-white shadow-blue group-hover:scale-105 transition">
                  {ocrState === "loading" ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base text-[#0B0F19]">
                    {ocrState === "loading"
                      ? "Google Gemini Vision is analyzing your screenshot table…"
                      : previewUrl
                        ? "Upload a different screenshot"
                        : "Click to upload or drag screenshot here"}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    Fast AI vision extraction (PNG, JPG up to 12 MB)
                  </div>
                </div>
              </div>

              {/* Status Message */}
              {ocrState === "done" && ocrFilledCount > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-700 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{ocrMessage}</span>
                </div>
              )}

              {ocrState === "error" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{ocrMessage}</span>
                </div>
              )}

              {/* Live Preview & Progress Bar */}
              {previewUrl && (
                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-[#FAFAFB] p-4">
                  <div
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white ${
                      ocrState === "loading" ? "animate-pulse" : ""
                    }`}
                  >
                    <img
                      src={previewUrl}
                      alt="Uploaded KUCCPS screenshot preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      <span>{ocrState === "loading" ? "Google Gemini Vision Processing…" : "OCR Extraction Status"}</span>
                      <span className="text-[#0F52FF] font-mono font-bold">
                        {ocrState === "loading"
                          ? "Analyzing"
                          : `${ocrFilledCount}/${CLUSTER_COUNT}`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-[#0F52FF] transition-[width] duration-300 ease-out"
                        style={{
                          width: `${
                            ocrState === "loading"
                              ? 65
                              : (ocrFilledCount / CLUSTER_COUNT) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {ocrState === "loading"
                        ? "Llama 3.2 Vision is reading decimal cluster weights from the table."
                        : "Verify values below before proceeding."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Name Card */}
            <div className="edupath-card bg-white p-6 shadow-subtle">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Candidate Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Kamau"
                className="w-full rounded-xl border border-border bg-[#FAFAFB] px-4 py-3 text-sm sm:text-base font-semibold outline-none focus:border-[#0F52FF] focus:ring-2 focus:ring-[#0F52FF]/20 transition"
              />
            </div>

            {/* 23 Cluster Tiles Input Grid */}
            <div className="edupath-card bg-white p-6 sm:p-8 shadow-elevated space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0B0F19]">
                    All {CLUSTER_COUNT} Cluster Values
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Type directly or verify auto-filled numbers (0.000 to 48.000).
                  </p>
                </div>
                <span className="rounded-full bg-[#EEF4FF] text-[#0F52FF] px-3 py-1 text-xs font-bold">
                  {filled}/{CLUSTER_COUNT} Entered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {clusters.map((c) => {
                  const val = weights[c];
                  const hasVal = typeof val === "number" && !Number.isNaN(val);
                  const isFlash = justFilled.has(c);
                  const isBest = best && best.cluster === c && hasVal;

                  return (
                    <div
                      key={`${c}-${pulseKey}`}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        isFlash
                          ? "border-[#0F52FF] bg-[#EEF4FF] ring-2 ring-[#0F52FF]/30 scale-[1.02]"
                          : isBest
                            ? "border-emerald-500/50 bg-emerald-50/40"
                            : hasVal
                              ? "border-border bg-[#FAFAFB]"
                              : "border-border/60 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-bold text-[#0B0F19]">
                          Cluster {c}
                        </span>
                        {isBest && (
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Top
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="48"
                        placeholder="0.000"
                        value={val == null ? "" : val}
                        onChange={(e) => set(c, e.target.value)}
                        className="w-full font-mono text-sm sm:text-base font-bold bg-white rounded-xl border border-border px-3 py-1.5 outline-none focus:border-[#0F52FF] focus:ring-2 focus:ring-[#0F52FF]/20"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Action */}
          <aside className="lg:sticky lg:top-6 lg:h-fit lg:col-span-4 space-y-6">
            <div className="edupath-card bg-white p-6 sm:p-8 shadow-elevated space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="h-4 w-4 text-[#0F52FF]" />
                <h3 className="font-display text-base font-bold text-[#0B0F19]">
                  Weights Summary
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAFB] border border-border">
                  <span className="text-[#64748B]">Clusters Completed</span>
                  <span className="font-mono font-extrabold text-[#0B0F19]">
                    {filled} of {CLUSTER_COUNT}
                  </span>
                </div>

                {best && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Highest Cluster Score
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-display font-extrabold text-lg text-emerald-900">
                        Cluster {best.cluster}
                      </span>
                      <span className="font-mono font-extrabold text-xl text-emerald-700">
                        {best.value.toFixed(3)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={submit}
                disabled={!canSubmit}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold btn-primary-tech disabled:opacity-40 disabled:cursor-not-allowed shadow-blue"
              >
                <span>Find Eligible Courses →</span>
              </button>

              <div className="text-center text-[10px] text-[#64748B]">
                Matches against 2,084+ degree programmes in the Supabase database.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
