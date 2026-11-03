import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadGrades } from "@/lib/edupath-store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Candidate Account — Sign In & Sign Up | EduPath AI Kenya" },
      {
        name: "description",
        content:
          "Sign in or create your EduPath AI candidate account to save KCSE grades, cluster weights, and explore Kenyan university admissions.",
      },
      { property: "og:title", content: "Candidate Portal — EduPath AI Kenya" },
      { property: "og:url", content: "https://edupath.co.ke/auth" },
      { property: "og:image", content: "https://edupath.co.ke/og-image.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "geo.region", content: "KE" },
      { name: "geo.placename", content: "Nairobi, Kenya" },
    ],
    links: [{ rel: "canonical", href: "https://edupath.co.ke/auth" }],
  }),
  component: AuthPage,
});

type AuthMode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { mode?: string };
  const initialMode: AuthMode =
    search.mode === "signup" ? "signup" : search.mode === "forgot" ? "forgot" : "signin";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [kcseIndex, setKcseIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const proceedToMatching = () => {
    const gradesData = loadGrades();
    if (Object.keys(gradesData.grades).length >= 7) {
      navigate({ to: "/cluster" });
    } else {
      navigate({ to: "/start" });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      if (data.user) {
        setSuccessMsg("Signed in successfully! Redirecting…");
        setTimeout(() => {
          proceedToMatching();
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            kcse_index: kcseIndex.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        setSuccessMsg("Account created! Redirecting to course matching…");
        setTimeout(() => {
          proceedToMatching();
        }, 800);
      } else {
        setSuccessMsg("Account created! Please check your email inbox to confirm your account.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not register candidate account.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setSuccessMsg("Password reset instructions have been sent to your email.");
    } catch {
      setSuccessMsg("If an account exists for this email, password reset instructions have been sent.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSuccessMsg("You have been signed out.");
  };

  return (
    <div className="page-shell min-h-screen bg-[#F8FAFC] text-[#090D16] antialiased pb-24">
      {/* Top Capsule Nav */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3.5 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <Link to="/" className="flex items-center">
            <EduPathLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/start"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold btn-primary-tech"
            >
              <span>Start Matching →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4 space-y-6">
        {/* User Status Card if already logged in */}
        {currentUser && (
          <div className="edupath-card bg-white p-6 shadow-card rounded-3xl space-y-5 border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center font-bold border border-blue-100">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#090D16]">
                    {currentUser.user_metadata?.full_name || currentUser.email}
                  </div>
                  <div className="text-[11px] text-[#64748B]">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-1 text-center">
              <div className="text-xs font-bold text-blue-700">
                ✓ Candidate Account Active & Synchronized
              </div>
              <p className="text-[11px] text-[#64748B]">
                Your KCSE calculations and shortlisted universities are stored to your profile.
              </p>
            </div>

            <button
              onClick={proceedToMatching}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs sm:text-sm font-bold btn-primary-tech"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Launch Course Matching Engine →</span>
            </button>
          </div>
        )}

        {/* Main Auth Form Container */}
        {!currentUser && (
          <div className="edupath-card bg-white p-6 sm:p-8 shadow-card rounded-3xl space-y-6 border border-border animate-fade-in">
            {/* Header / Tabs */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full badge-blue px-3 py-1 text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Candidate Portal</span>
              </div>
              <h1 className="hero-title font-display text-2xl font-extrabold">
                {mode === "signin"
                  ? "Sign In to Your Account"
                  : mode === "signup"
                    ? "Create Candidate Account"
                    : "Reset Your Password"}
              </h1>
              <p className="text-xs text-[#64748B]">
                {mode === "signin"
                  ? "Access your saved KCSE matches and university recommendations."
                  : mode === "signup"
                    ? "Register once to save your subject grades and explore 2,084+ degree courses."
                    : "Enter your email to receive a password reset link."}
              </p>
            </div>

            {/* Toggle Modes */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F8FAFC] border border-border text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2 rounded-xl transition ${
                  mode === "signin"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#090D16]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`py-2 rounded-xl transition ${
                  mode === "signup"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#090D16]"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. candidate@gmail.com"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold btn-primary-tech disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign In & Start Matching →"}
                </button>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Faith Wanjiku"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. faith@gmail.com"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    KCSE Index Number (Optional)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="text"
                      value={kcseIndex}
                      onChange={(e) => setKcseIndex(e.target.value)}
                      placeholder="e.g. 11200001001"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold btn-primary-tech disabled:opacity-50"
                >
                  {loading ? "Creating Account…" : "Create Account & Start Matching →"}
                </button>
              </form>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#64748B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. candidate@gmail.com"
                      className="w-full rounded-xl border border-border bg-[#F8FAFC] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold btn-primary-tech disabled:opacity-50"
                >
                  {loading ? "Sending link…" : "Send Reset Link →"}
                </button>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="w-full text-center text-xs font-bold text-[#64748B] hover:text-[#090D16] pt-2"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}

            <div className="pt-2 text-center border-t border-border">
              <Link
                to="/start"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
              >
                <span>⚡ Continue as Guest (No Account Required) →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
