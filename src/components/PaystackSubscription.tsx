import { useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { initializePaystackSubscription } from "@/lib/paystack.functions";

export function PaystackSubscription() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    setError("");
    setLoading(true);
    try {
      const { authorization_url } = await initializePaystackSubscription({ data: { email } });
      window.location.assign(authorization_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to start checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Monthly access</div>
      <div className="font-display text-4xl font-extrabold text-[#090D16]">KES 150<span className="text-base text-[#64748B]"> / month</span></div>
      <p className="text-[11px] text-[#64748B]">Cancel anytime. Secure checkout powered by Paystack.</p>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Your email address"
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label="Email address for Paystack subscription"
      />
      {error && <p className="text-left text-xs font-semibold text-red-600">{error}</p>}
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold btn-primary-tech disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {loading ? "Opening secure checkout…" : "Subscribe for KES 150"}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#64748B]">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
        Paystack-secured recurring billing
      </div>
    </div>
  );
}
