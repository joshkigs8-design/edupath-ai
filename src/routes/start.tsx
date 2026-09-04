import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
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
      { title: "Select Matching Engine — EduPath AI" },
      {
        name: "description",
        content:
          "Choose between official KUCCPS cluster weights matching or KCSE subject grade estimation.",
      },
      { property: "og:title", content: "Select Matching Engine — EduPath AI" },
      {
        property: "og:description",
        content: "Two ways to match: official KUCCPS cluster weights or KCSE grades.",
      },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  return (
    <div className="min-h-screen pb-20 bg-[#FAFAFB] text-[#0B0F19] antialiased">
      {/* Top Floating Capsule Navigation */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3 flex items-center justify-between shadow-subtle">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0F52FF] text-white shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-display font-extrabold tracking-tight text-lg text-[#0B0F19]">
              EduPath<span className="text-[#059669]">.AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold btn-outline-clean"
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
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full badge-blue px-3.5 py-1 text-xs mb-3">
            <Sparkles className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Step 1 of 3 · Engine Selection</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B0F19]">
            Select Your <span className="text-[#0F52FF]">Matching Engine</span>
          </h1>
          <p className="mt-3 text-[#64748B] text-sm sm:text-base leading-relaxed">
            Choose the method matching the information you currently have. You can switch between
            engines at any time.
          </p>
        </div>

        {/* Dual Mode Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-stretch">
          {/* Mode 1: Official Portal Weights */}
          <div className="edupath-card bg-white p-8 sm:p-9 flex flex-col justify-between shadow-elevated relative overflow-hidden group hover:border-[#0F52FF]/40 transition">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0F52FF] text-white shadow-blue">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 text-xs font-extrabold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>100% Official Accuracy</span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B0F19]">
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
                    <CheckCircle2 className="h-4 w-4 text-[#0F52FF] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#0B0F19] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="mb-4 flex items-center justify-between text-xs text-[#64748B] font-semibold">
                <span>Setup: ~ 30 seconds</span>
                <span className="text-[#0F52FF] font-bold">AI Vision Enabled</span>
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
          <div className="edupath-card bg-white p-8 sm:p-9 flex flex-col justify-between shadow-elevated relative overflow-hidden group hover:border-[#0F52FF]/40 transition">
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF4FF] text-[#0F52FF]">
                  <Calculator className="h-7 w-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full badge-emerald px-3 py-1 text-xs font-extrabold">
                  <Zap className="h-3.5 w-3.5" />
                  <span>No Portal Needed</span>
                </div>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B0F19]">
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
                    <CheckCircle2 className="h-4 w-4 text-[#0F52FF] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-[#0B0F19] font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="mb-4 flex items-center justify-between text-xs text-[#64748B] font-semibold">
                <span>Setup: ~ 1 minute</span>
                <span className="text-[#0F52FF] font-bold">Prerequisite Gating</span>
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
        <div className="mt-10 rounded-2xl edupath-card bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              100% Private: Grades and screenshots are processed in-memory in your local session.
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <HelpCircle className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Estimated cluster points serve as educational guidance.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
