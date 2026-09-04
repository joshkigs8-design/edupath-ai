import { createFileRoute, Link } from "@tanstack/react-router";
import { EduPathLogo } from "../components/EduPathLogo";
import { ArrowLeft, Scale } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — EduPath AI" },
      {
        name: "description",
        content: "EduPath AI Terms and Conditions governing platform usage, free open access course matching, and educational guidance disclaimers.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFB] text-[#0B0F19] antialiased pb-24">
      {/* Top Capsule Nav */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <Link to="/" className="flex items-center">
            <EduPathLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full badge-blue px-3.5 py-1 text-xs font-bold">
            <Scale className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Legal Agreement & User Terms</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0F19]">
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Effective Date: January 1, 2026 · Last Updated: August 27, 2026
          </p>
        </div>

        {/* Content */}
        <div className="edupath-card bg-white p-8 sm:p-12 shadow-elevated rounded-3xl space-y-8 border border-border text-sm leading-relaxed text-[#334155]">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">1. Agreement to Terms</h2>
            <p>
              By accessing, browsing, or utilizing the services provided by EduPath AI ("EduPath", "Platform", "we", or "us"), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not use this service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">2. Educational Advisory Disclaimer</h2>
            <p>
              EduPath AI provides data-driven simulations, historical cut-off comparisons, and educational guidance based on official public datasets and mathematical formulas. 
            </p>
            <p className="p-4 rounded-2xl bg-[#EEF4FF] border border-[#0F52FF]/20 text-[#0F52FF] font-medium text-xs">
              <strong>IMPORTANT:</strong> EduPath AI is an advisory guidance tool. Actual admission cut-offs vary annually based on national candidate performance and institutional capacities declared by KUCCPS. EduPath AI does not guarantee admission to any institution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">3. Free Open Access Platform</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong>100% Free Access:</strong> All candidates have full, complimentary access to explore all 2,084+ degree and diploma programmes across Kenyan universities.</li>
              <li><strong>Comprehensive Intelligence:</strong> University cut-off margins, career salary maps, cluster calculations, and personalized PDF reports are completely free of charge.</li>
              <li><strong>No Hidden Fees or Subscriptions:</strong> EduPath AI is committed to open educational access for all Kenyan students. There are no paywalls, hidden charges, or recurring subscriptions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">4. Partner Access & Special Programs</h2>
            <p>
              Access codes or vouchers issued by EduPath AI, partner high schools, or authorized promotional campaigns grant access to cohort management tools and beta capabilities. Codes are non-transferable and cannot be redeemed for cash.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">5. Candidate Responsibilities & Account Integrity</h2>
            <p>
              You agree to provide accurate and truthful academic grades. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">6. Intellectual Property</h2>
            <p>
              The design, brand identity, layout, logos, algorithms, and compilations of EduPath AI are the exclusive intellectual property of EduPath AI and are protected under Kenyan and international copyright laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">7. Governing Law & Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Nairobi, Kenya.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
