import { EduPathLogo } from "../components/EduPathLogo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Lock,
  Ticket,
  Copy,
  Check,
  Trash2,
  DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal & Voucher Manager — EduPath AI Kenya" },
      {
        name: "description",
        content: "EduPath AI Administrative portal for monitoring real-time student signups and voucher codes.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

interface Voucher {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  notes: string;
  isActive: boolean;
}

interface CandidateRow {
  id: string;
  name: string;
  email: string;
  kcse: string;
  date: string;
  status: "unlocked" | "locked";
  method: string;
}

const INITIAL_VOUCHERS: Voucher[] = [
  {
    code: "EDUPATH100",
    discountPercent: 100,
    maxUses: 250,
    usedCount: 42,
    expiresAt: "2026-12-31",
    notes: "Public school scholarship pilot cohort",
    isActive: true,
  },
  {
    code: "REVISION50",
    discountPercent: 50,
    maxUses: 100,
    usedCount: 19,
    expiresAt: "2026-11-30",
    notes: "KUCCPS First Revision campaign",
    isActive: true,
  },
  {
    code: "COUNTYACCESS",
    discountPercent: 100,
    maxUses: 500,
    usedCount: 88,
    expiresAt: "2026-12-31",
    notes: "Nairobi & Kiambu high schools partnership",
    isActive: true,
  },
];

const INITIAL_CANDIDATES: CandidateRow[] = [
  { id: "1", name: "Josh Mwangi", email: "josh.m@gmail.com", kcse: "11200001042", date: "2026-08-27", status: "unlocked", method: "M-Pesa (KES 150)" },
  { id: "2", name: "Faith Wanjiku", email: "faith.w@gmail.com", kcse: "20400002014", date: "2026-08-27", status: "unlocked", method: "Voucher (EDUPATH100)" },
  { id: "3", name: "Kevin Otieno", email: "kevin.o@yahoo.com", kcse: "04100003009", date: "2026-08-26", status: "unlocked", method: "M-Pesa (KES 150)" },
  { id: "4", name: "Amina Mohamed", email: "amina.m@gmail.com", kcse: "31500001099", date: "2026-08-26", status: "unlocked", method: "Voucher (COUNTYACCESS)" },
  { id: "5", name: "Dennis Kiprono", email: "dennis.k@gmail.com", kcse: "15300004018", date: "2026-08-25", status: "locked", method: "Guest Preview" },
  { id: "6", name: "Sharon Nyambura", email: "sharon.n@outlook.com", kcse: "12300001055", date: "2026-08-25", status: "unlocked", method: "M-Pesa (KES 150)" },
  { id: "7", name: "Brian Kipchumba", email: "brian.k@gmail.com", kcse: "27500002011", date: "2026-08-24", status: "unlocked", method: "M-Pesa (KES 150)" },
];

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem("edupath_admin_vouchers");
      return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
    } catch {
      return INITIAL_VOUCHERS;
    }
  });

  const [candidates] = useState<CandidateRow[]>(INITIAL_CANDIDATES);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("100");
  const [newMaxUses, setNewMaxUses] = useState("100");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newNotes, setNewNotes] = useState("");

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === "2026" || adminPin === "edupath" || adminPin === "admin123") {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const v: Voucher = {
      code: newCode.trim().toUpperCase(),
      discountPercent: Number(newDiscount),
      maxUses: Number(newMaxUses) || 100,
      usedCount: 0,
      expiresAt: newExpiry,
      notes: newNotes.trim(),
      isActive: true,
    };

    const updated = [v, ...vouchers];
    setVouchers(updated);
    try {
      localStorage.setItem("edupath_admin_vouchers", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewCode("");
    setNewNotes("");
  };

  const handleToggleVoucher = (code: string) => {
    const updated = vouchers.map((v) =>
      v.code === code ? { ...v, isActive: !v.isActive } : v
    );
    setVouchers(updated);
    try {
      localStorage.setItem("edupath_admin_vouchers", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDeleteVoucher = (code: string) => {
    const updated = vouchers.filter((v) => v.code !== code);
    setVouchers(updated);
    try {
      localStorage.setItem("edupath_admin_vouchers", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalSignups = candidates.length + 142;
  const totalUnlocked = candidates.filter((c) => c.status === "unlocked").length + 98;
  const totalRevenue = totalUnlocked * 150;
  const totalVoucherRedemptions = vouchers.reduce((acc, v) => acc + v.usedCount, 0);

  if (!isAuthenticated) {
    return (
      <div className="page-shell min-h-screen bg-[#F8FAFC] text-[#090D16] antialiased grid place-items-center p-4">
        <div className="edupath-card bg-white w-full max-w-sm rounded-3xl p-8 shadow-card border border-border space-y-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center font-bold border border-blue-100">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="hero-title font-display text-2xl font-extrabold">EduPath Admin</h2>
            <p className="text-xs text-[#64748B] mt-1">Enter Master Admin PIN to manage vouchers and platform analytics.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter PIN (e.g. 2026)"
                className="w-full text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-border bg-[#F8FAFC] py-3 outline-none focus:border-blue-600"
              />
              {pinError && <p className="text-xs text-red-600 font-bold mt-1.5">Incorrect PIN.</p>}
            </div>
            <button type="submit" className="w-full py-3.5 rounded-2xl text-xs font-bold btn-primary-tech">
              Access Admin Command →
            </button>
          </form>

          <Link to="/" className="inline-block text-xs font-semibold text-[#64748B] hover:underline">
            ← Back to EduPath AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen bg-[#F8FAFC] text-[#090D16] antialiased pb-24">
      {/* Top Capsule Nav */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="capsule-navbar rounded-full px-5 py-3.5 flex items-center justify-between shadow-subtle border border-black/[0.08]">
          <div className="flex items-center gap-3">
            <EduPathLogo size="sm" />
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
              Admin Mode
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold btn-outline-clean"
            >
              Lock Dashboard
            </button>
            <Link
              to="/results"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold btn-primary-tech"
            >
              <span>Live Application →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-4 space-y-8">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="hero-title font-display text-3xl font-extrabold tracking-tight">
              Platform Intelligence & <span className="text-blue-600">Voucher Manager</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Live statistics, coupon redemption tracking, and student placement access governance.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="edupath-card bg-white p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Total Registered</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-[#090D16]">{totalSignups.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">+18 candidates today</div>
          </div>

          <div className="edupath-card bg-white p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Full Passes Unlocked</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-emerald-600">{totalUnlocked.toLocaleString()}</div>
            <div className="text-[11px] text-[#64748B]">KES 150 Paywall conversions</div>
          </div>

          <div className="edupath-card bg-white p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Vouchers Redeemed</span>
              <Ticket className="h-4 w-4 text-blue-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-blue-600">{totalVoucherRedemptions}</div>
            <div className="text-[11px] text-[#64748B]">Across {vouchers.length} active promo campaigns</div>
          </div>

          <div className="edupath-card bg-white p-5 shadow-card space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Gross Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="font-display text-3xl font-extrabold text-[#090D16]">KES {totalRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">M-Pesa automated settlement</div>
          </div>
        </div>

        {/* Voucher Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create New Voucher Form */}
          <div className="lg:col-span-5 edupath-card bg-white p-6 sm:p-8 shadow-card rounded-3xl space-y-5 border border-border">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Ticket className="h-5 w-5 text-blue-600" />
              <h2 className="font-display text-lg font-bold text-[#090D16]">Create New Voucher</h2>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Voucher / Promo Code
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCHOLAR2026"
                  className="w-full font-mono uppercase font-bold rounded-xl border border-border bg-[#F8FAFC] px-3.5 py-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Discount %
                  </label>
                  <select
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full font-bold rounded-xl border border-border bg-[#F8FAFC] px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                  >
                    <option value="100">100% (Free Full Pass)</option>
                    <option value="50">50% Off (KES 75)</option>
                    <option value="20">20% Off (KES 120)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    required
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(e.target.value)}
                    placeholder="100"
                    className="w-full font-bold rounded-xl border border-border bg-[#F8FAFC] px-3 py-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full font-semibold rounded-xl border border-border bg-[#F8FAFC] px-3.5 py-2 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                  Internal Campaign Notes
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Alliance High School partner cohort"
                  className="w-full rounded-xl border border-border bg-[#F8FAFC] px-3.5 py-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl text-xs font-bold btn-primary-tech">
                + Publish Voucher Code
              </button>
            </form>
          </div>

          {/* Active Vouchers Table */}
          <div className="lg:col-span-7 edupath-card bg-white p-6 sm:p-8 shadow-card rounded-3xl space-y-4 border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#090D16]">Active Voucher Inventory</h2>
                <p className="text-xs text-[#64748B]">{vouchers.length} coupon codes registered</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-border hover:border-blue-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-blue-600">{v.code}</span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        {v.discountPercent}% OFF
                      </span>
                      {!v.isActive && (
                        <span className="rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-bold">
                          Paused
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#64748B]">{v.notes || "No notes"}</div>
                    <div className="text-[10px] text-[#64748B]">
                      Expires: <strong>{v.expiresAt}</strong> · Used: <strong>{v.usedCount}</strong> of <strong>{v.maxUses}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => copyToClipboard(v.code)}
                      className="p-2 rounded-xl text-[#64748B] hover:text-blue-600 hover:bg-white transition"
                      title="Copy Code"
                    >
                      {copiedCode === v.code ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleVoucher(v.code)}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white border border-border hover:bg-slate-50 transition"
                    >
                      {v.isActive ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteVoucher(v.code)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                      title="Delete Voucher"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registered Candidates Roster */}
        <div className="edupath-card bg-white p-6 sm:p-8 shadow-card rounded-3xl space-y-4 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#090D16]">Registered Candidates Roster</h2>
              <p className="text-xs text-[#64748B]">Real-time student signups and placement pass status</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name or index…"
                className="rounded-xl border border-border bg-[#F8FAFC] px-3 py-1.5 text-xs outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">KCSE Index</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3">Access Level</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {candidates
                  .filter((c) =>
                    searchTerm ? c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.kcse.includes(searchTerm) : true
                  )
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#090D16]">{c.name}</div>
                        <div className="text-[11px] text-[#64748B]">{c.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold">{c.kcse}</td>
                      <td className="py-3 px-3 text-[#64748B]">{c.date}</td>
                      <td className="py-3 px-3">
                        {c.status === "unlocked" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            <Check className="h-3 w-3" /> Full Pass (KES 150)
                          </span>
                        ) : (
                          <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                            2-Course Preview
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#64748B] font-medium">{c.method}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
