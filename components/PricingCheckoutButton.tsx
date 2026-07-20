"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  plan: "starter" | "pro";
  children: string;
  provider?: "paypal" | "creem";
  featured?: boolean;
};

export function PricingCheckoutButton({
  plan,
  children,
  provider = "paypal",
  featured = false,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        provider === "creem"
          ? "/api/creem/create-checkout"
          : "/api/paypal/create-order",
        {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
        },
      );

      if (response.status === 401) {
        window.location.href = `/api/auth/google/start?return_to=${encodeURIComponent(
          "/pricing",
        )}`;
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? ((await response.json()) as {
        approvalUrl?: string;
        checkoutUrl?: string;
        error?: string;
          })
        : { error: await response.text() };
      const redirectUrl =
        provider === "creem" ? data.checkoutUrl : data.approvalUrl;

      if (!response.ok || !redirectUrl) {
        throw new Error(data.error || "Checkout failed. Please try again.");
      }

      window.location.href = redirectUrl;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Checkout failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-auto">
      <button
        type="button"
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
          featured
            ? "bg-ink text-white shadow-sm hover:bg-slate-800"
            : "border border-slate-300 bg-white text-ink hover:bg-slate-50"
        }`}
        onClick={checkout}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <ArrowRight className="h-4 w-4" aria-hidden />
        )}
        {isLoading ? "Opening checkout..." : children}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
