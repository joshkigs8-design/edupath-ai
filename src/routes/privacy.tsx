import { createFileRoute, Link } from "@tanstack/react-router";
import { EduPathLogo } from "../components/EduPathLogo";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — EduPath AI" },
      {
        name: "description",
        content: "EduPath AI Privacy Policy explaining how we collect, process, protect and store Kenyan KCSE student academic data in compliance with the Kenya Data Protection Act 2019.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F52FF]" />
            <span>Kenya Data Protection Act 2019 Compliant</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B0F19]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Effective Date: January 1, 2026 · Last Updated: August 27, 2026
          </p>
        </div>

        {/* Content Container */}
        <div className="edupath-card bg-white p-8 sm:p-12 shadow-elevated rounded-3xl space-y-8 border border-border text-sm leading-relaxed text-[#334155]">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">1. Introduction & Overview</h2>
            <p>
              EduPath AI ("we", "our", or "us") operates the career discovery, course matching, and cluster analysis platform for Kenyan secondary school graduates and university applicants. We are committed to protecting the privacy, confidentiality, and security of candidates, parents, and educators in strict adherence to the <strong>Kenya Data Protection Act No. 24 of 2019</strong> and international data privacy benchmarks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">2. Information We Collect</h2>
            <p>When you interact with EduPath AI, we collect only the information necessary to provide accurate course matching and academic guidance:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Academic Grades:</strong> Kenya Certificate of Secondary Education (KCSE) subject grades (e.g. Mathematics, English, Sciences) and mean grade.</li>
              <li><strong>KUCCPS Cluster Weights:</strong> Numeric cluster scores (0.000 to 48.000) for the 23 standard academic clusters.</li>
              <li><strong>Uploaded Result Screenshots:</strong> Result slip or portal images processed via our optical analysis engine to extract grade characters.</li>
              <li><strong>Account & Contact Data:</strong> Name, email address, optional phone number for M-Pesa automated transaction verification, and account authentication credentials.</li>
              <li><strong>Usage Telemetry:</strong> Anonymized interaction metrics to improve algorithm precision and degree recommendation accuracy.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">3. Purpose of Data Processing</h2>
            <p>Your data is processed strictly for the following educational purposes:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Calculating weighted cluster points across Kenya's 23 degree clusters using official KUCCPS formulas.</li>
              <li>Matching candidate qualifications against entry requirements of 2,084+ programmes and 69 universities.</li>
              <li>Generating downloadable personalized academic strategy PDF reports.</li>
              <li>Processing platform transactions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">4. Non-Affiliation Disclosure with KNEC & KUCCPS</h2>
            <p>
              EduPath AI is an independent educational technology platform. We are not an official government agency and are not directly affiliated with the Kenya National Examinations Council (KNEC) or the Kenya Universities and Colleges Central Placement Service (KUCCPS). All official placement applications must be submitted directly through the official KUCCPS Student Portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">5. Data Security & Storage</h2>
            <p>
              We implement enterprise-grade Transport Layer Security (TLS 1.3) encryption in transit and AES-256 encryption at rest. Uploaded images are processed in-memory and are not sold, rented, or transferred to third-party data brokers or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">6. Your Rights Under Kenyan Law</h2>
            <p>Under the Kenya Data Protection Act 2019, you retain the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Request access to your stored academic profile and search history.</li>
              <li>Request correction or deletion of your candidate data.</li>
              <li>Opt-out of marketing communications at any time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-[#0B0F19]">7. Contact Our Data Protection Officer</h2>
            <p>
              If you have any questions or wish to exercise your data rights, please contact our support desk at <strong className="text-[#0F52FF]">privacy@edupath.co.ke</strong> or Nairobi, Kenya.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
