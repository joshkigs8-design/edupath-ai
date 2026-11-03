import { createServerFn } from "@tanstack/react-start";

type PaymentInput = { email: string };
type ReferenceInput = { reference: string };

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data?: T;
};

type InitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type VerifyData = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  plan?: { plan_code?: string };
};

function getPaystackSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Missing PAYSTACK_SECRET_KEY. Add it to your server environment.");
  }
  return key;
}

function getPaystackPlanCode() {
  const planCode = process.env.PAYSTACK_MONTHLY_PLAN_CODE;
  if (!planCode) {
    throw new Error("Missing PAYSTACK_MONTHLY_PLAN_CODE. Create a KES 150 monthly plan in Paystack.");
  }
  return planCode;
}

export const initializePaystackSubscription = createServerFn({ method: "POST" })
  .validator((input: unknown): PaymentInput => {
    const data = input as Partial<PaymentInput>;
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Enter a valid email address to continue.");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        amount: 15000,
        currency: "KES",
        plan: getPaystackPlanCode(),
        callback_url: `${process.env.APP_URL ?? "http://localhost:8080"}/payment/callback`,
        metadata: { product: "edupath_monthly_pass", amount_kes: 150 },
      }),
    });

    const result = (await response.json()) as PaystackResponse<InitializeData>;
    if (!response.ok || !result.status || !result.data?.authorization_url) {
      throw new Error(result.message || "Paystack could not start the subscription.");
    }
    return result.data;
  });

export const verifyPaystackSubscription = createServerFn({ method: "POST" })
  .validator((input: unknown): ReferenceInput => {
    const data = input as Partial<ReferenceInput>;
    const reference = typeof data.reference === "string" ? data.reference.trim() : "";
    if (!reference || !/^[a-zA-Z0-9._-]+$/.test(reference)) {
      throw new Error("Invalid Paystack payment reference.");
    }
    return { reference };
  })
  .handler(async ({ data }) => {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`,
      { headers: { Authorization: `Bearer ${getPaystackSecretKey()}` } },
    );
    const result = (await response.json()) as PaystackResponse<VerifyData>;
    if (!response.ok || !result.status || !result.data) {
      throw new Error(result.message || "Paystack could not verify this payment.");
    }

    const expectedPlanCode = getPaystackPlanCode();
    const verified = result.data.status === "success" &&
      result.data.currency === "KES" &&
      result.data.amount === 15000 &&
      result.data.plan?.plan_code === expectedPlanCode;

    return { verified, reference: result.data.reference };
  });
