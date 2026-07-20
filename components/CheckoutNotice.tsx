"use client";

import { useEffect, useState } from "react";

const messages = {
  success: {
    title: "Payment complete",
    text: "Your image credits have been added. You can start processing images now.",
    className: "border-mint/30 bg-mint/10 text-emerald-900",
  },
  cancelled: {
    title: "Checkout cancelled",
    text: "No payment was made. You can choose a plan whenever you are ready.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  failed: {
    title: "Checkout failed",
    text: "The payment could not be completed. Please try again.",
    className: "border-coral/30 bg-coral/10 text-red-900",
  },
};

type CheckoutState = keyof typeof messages;

export function CheckoutNotice() {
  const [state, setState] = useState<CheckoutState | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("checkout");
    if (value === "success" || value === "cancelled" || value === "failed") {
      setState(value);
    }
  }, []);

  if (!state) return null;

  const message = messages[state];

  return (
    <div
      className={`mx-auto mt-6 max-w-7xl rounded-lg border p-4 ${message.className}`}
    >
      <p className="font-semibold">{message.title}</p>
      <p className="mt-1 text-sm leading-6">{message.text}</p>
    </div>
  );
}
