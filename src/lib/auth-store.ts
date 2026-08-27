import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  kcseIndex?: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  paymentMethod?: "mpesa" | "voucher" | "card";
  voucherCode?: string;
}

export interface Voucher {
  code: string;
  discountPercent: number; // 100 = Free Pass
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  notes?: string;
}

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    code: "EDUPATH100",
    discountPercent: 100,
    maxUses: 500,
    usedCount: 18,
    expiresAt: "2026-12-31",
    isActive: true,
    notes: "Official 100% Scholarship Waiver",
  },
  {
    code: "KENYA2026",
    discountPercent: 100,
    maxUses: 1000,
    usedCount: 42,
    expiresAt: "2026-12-31",
    isActive: true,
    notes: "2026 KCSE Revision Launch Pass",
  },
  {
    code: "ADMINFREE",
    discountPercent: 100,
    maxUses: 9999,
    usedCount: 5,
    expiresAt: "2030-01-01",
    isActive: true,
    notes: "Staff & Reviewer Full Access",
  },
  {
    code: "DISCOUNT50",
    discountPercent: 50,
    maxUses: 200,
    usedCount: 12,
    expiresAt: "2026-12-31",
    isActive: true,
    notes: "50% Off Revision Pass (KES 75)",
  },
];

/**
 * Load all vouchers (from localStorage or defaults)
 */
export function loadVouchers(): Voucher[] {
  try {
    const raw = localStorage.getItem("edupath_vouchers");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_VOUCHERS;
}

/**
 * Save vouchers to storage
 */
export function saveVouchers(vouchers: Voucher[]) {
  try {
    localStorage.setItem("edupath_vouchers", JSON.stringify(vouchers));
  } catch {
    // ignore
  }
}

/**
 * Validate and redeem a voucher code
 */
export function redeemVoucher(inputCode: string): { success: boolean; discountPercent: number; message: string } {
  const code = inputCode.trim().toUpperCase();
  const vouchers = loadVouchers();
  const voucher = vouchers.find((v) => v.code === code && v.isActive);

  if (!voucher) {
    return { success: false, discountPercent: 0, message: "Invalid or inactive voucher code." };
  }

  if (voucher.usedCount >= voucher.maxUses) {
    return { success: false, discountPercent: 0, message: "This voucher has reached its maximum redemption limit." };
  }

  if (new Date(voucher.expiresAt) < new Date()) {
    return { success: false, discountPercent: 0, message: "This voucher code has expired." };
  }

  // Increment usage count
  voucher.usedCount += 1;
  saveVouchers(vouchers);

  // If 100% discount, automatically mark user as unlocked
  if (voucher.discountPercent === 100) {
    unlockFullPass("voucher", code);
  }

  return {
    success: true,
    discountPercent: voucher.discountPercent,
    message: voucher.discountPercent === 100
      ? "Voucher applied! 100% discount — Full Placement Pass Unlocked!"
      : `Voucher applied! ${voucher.discountPercent}% discount applied.`,
  };
}

/**
 * Mark full pass as unlocked
 */
export function unlockFullPass(method: "mpesa" | "voucher" | "card" = "mpesa", voucherCode?: string) {
  try {
    localStorage.setItem("edupath_full_pass_unlocked", "true");
    localStorage.setItem(
      "edupath_payment_receipt",
      JSON.stringify({
        unlockedAt: new Date().toISOString(),
        method,
        voucherCode,
        amount: method === "voucher" ? 0 : 150,
      })
    );
  } catch {
    // ignore
  }
}

/**
 * Check if the user has unlocked the full pass
 */
export function isPassUnlocked(): boolean {
  try {
    return localStorage.getItem("edupath_full_pass_unlocked") === "true";
  } catch {
    return false;
  }
}
