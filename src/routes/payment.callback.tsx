import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { EduPathLogo } from "../components/EduPathLogo";
import { unlockFullPass } from "@/lib/auth-store";
import { verifyPaystackSubscription } from "@/lib/paystack.functions";

export const Route = createFileRoute("/payment/callback")({
  component: PaymentCallbackPage,
});

function PaymentCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your EduPath subscription…");

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference was provided.");
      return;
    }

    verifyPaystackSubscription({ data: { reference } })
      .then(({ verified }) => {
        if (!verified) {
          setStatus("error");
          setMessage("The payment was not completed or did not match the EduPath plan.");
          return;
        }
        unlockFullPass("paystack");
        setStatus("success");
        setMessage("Your monthly EduPath pass is active.");
        window.setTimeout(() => navigate({ to: "/results" }), 1200);
      })
      .catch((error: unknown) => {
        console.error("Paystack verification failed", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "We could not verify your payment.");
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] px-4 py-6 text-[#0B0F19]">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="inline-flex">
          <EduPathLogo size="sm" />
        </Link>
        <main className="mx-auto mt-20 max-w-md text-center">
          {status === "loading" && <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-blue-600" />}
          {status === "success" && <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />}
          {status === "error" && <XCircle className="mx-auto h-12 w-12 text-red-600" />}
          <h1 className="mt-5 font-display text-2xl font-extrabold">
            {status === "success" ? "Payment confirmed" : status === "error" ? "Payment not confirmed" : "Confirming payment"}
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">{message}</p>
          {status === "error" && (
            <Link to="/" className="mt-6 inline-flex rounded-2xl px-5 py-3 text-sm font-bold btn-primary-tech">
              Return home
            </Link>
          )}
        </main>
      </div>
    </div>
  );
}
