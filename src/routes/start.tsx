import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Calculator,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
  HelpCircle,
} from "lucide-react";
import { saveMode } from "@/lib/edupath-store";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Select Matching Engine — KCSE Cluster Calculator | EduPath AI Kenya" },
      {
        name: "description",
        content:
          "Choose between official KUCCPS cluster weights calculation with Gemini Vision AI OCR or manual KCSE subject grade entry for university course matching in Kenya.",
      },
      {
        name: "keywords",
        content:
          "KUCCPS matching engine, KCSE grades calculator, KUCCPS cluster weights, Kenyan universities admission, course eligibility checker Kenya",
      },
      { property: "og:title", content: "Select Matching Engine — EduPath AI Kenya" },
      {
        property: "og:description",
        content: "Two ways to match: official KUCCPS cluster weights or manual KCSE grades.",
      },
      { property: "og:url", content: "https://edupath.co.ke/start" },
      { property: "og:image", content: "https://edupath.co.ke/og-image.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "geo.region", content: "KE" },
      { name: "geo.placename", content: "Nairobi, Kenya" },
    ],
    links: [{ rel: "canonical", href: "https://edupath.co.ke/start" }],
  }),
  component: StartPage,
});

function StartPage() {
  return (
    <div className="page-shell min-h-screen pb-20 bg-[#F8FAFC] text-[#090D16] antialiased">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-6xl px-4 py-6">
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
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3.5 py-1 text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Step 1 of 3 · Engine Selection</span>
          </div>
          <h1 className="hero-title font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
            Select Your <span className="text-blue-600">Matching Engine</span>
          </h1>
          <p className="mt-3 text-[#64748B] text-sm sm:text-base leading-relaxed">
            Choose the method matching the information you currently have. You can switch between
            engines at any time.
          </p>
        </div>

        {/* Dual Mode Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-stretch">
          {/* Mode 1: Official Portal Weights */}
          <div className="edupath-card bg-white p-8 sm:p-9 flex flex-col justify-between shadow-card relative overflow-hidden group hover:border-blue-500/40 hover:-translate-y-1 transition duration-300">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-xs font-extrabold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Official Accuracy</span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#090D16]">
                Official KUCCPS Weights
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Uses the 23 cluster weight values from your KUCCPS student portal. Perfect if you
                have portal access or a screenshot.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Upload a KUCCPS portal screenshot — AI Vision OCR reads all 23 weights in 3 seconds.",
                  "Zero mathematical estimation — uses exact official KUCCPS numbers.",
                  "Explore courses in any field by toggling active clusters on the results page.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#090D16] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="mb-4 flex items-center justify-between text-xs text-[#64748B] font-semibold">
                <span>Setup: ~ 30 seconds</span>
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Vision Enabled
                </span>
              </div>
              <Link
                to="/weights"
                onClick={() => saveMode("official")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold btn-primary-tech"
              >
                <span>Continue with Official Weights</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Mode 2: KCSE Subject Estimator */}
          <div className="edupath-card bg-white p-8 sm:p-9 flex flex-col justify-between shadow-card relative overflow-hidden group hover:border-blue-500/40 hover:-translate-y-1 transition duration-300">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Calculator className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full badge-emerald px-3 py-1 text-xs font-extrabold">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>No Portal Needed</span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#090D16]">
                Calculate from KCSE Grades
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Enter your individual KCSE subject grades. We evaluate cluster points and enforce
                strict minimum subject requirements.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Select grades for at least 7 KCSE subjects you sat (ENG, KIS, MAT required).",
                  "Automated cluster scoring: C = √((r/48) × (t/84)) × 48 per degree programme.",
                  "Strict prerequisite validation warns you if you missed minimum subject gates.",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#090D16] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="mb-4 flex items-center justify-between text-xs text-[#64748B] font-semibold">
                <span>Setup: ~ 1 minute</span>
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Prerequisite Gating
                </span>
              </div>
              <Link
                to="/match"
                onClick={() => saveMode("estimate")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold btn-primary-tech"
              >
                <span>Enter KCSE Subject Grades</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Trust & Privacy Card */}
        <div className="mt-10 rounded-2xl edupath-card bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B] shadow-subtle">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              100% Private: Grades and screenshots are processed in-memory in your local browser session.
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            <span>Estimated cluster points serve as educational guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
