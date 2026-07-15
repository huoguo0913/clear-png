"use client";

import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

type AuthResponse = {
  authenticated: boolean;
  user: null | {
    email: string | null;
    name: string | null;
    pictureUrl: string | null;
  };
};

export function AuthStatus() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.json())
      .then((data: AuthResponse) => {
        if (alive) setAuth(data);
      })
      .catch(() => {
        if (alive) setAuth({ authenticated: false, user: null });
      });

    return () => {
      alive = false;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuth({ authenticated: false, user: null });
  }

  if (!auth) {
    return <div className="h-9 w-24 rounded-lg bg-slate-100" aria-hidden />;
  }

  if (!auth.authenticated || !auth.user) {
    const returnTo =
      typeof window === "undefined"
        ? "/"
        : `${window.location.pathname}${window.location.search}`;

    return (
      <a
        href={`/api/auth/google/start?return_to=${encodeURIComponent(returnTo)}`}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
      >
        <LogIn className="h-4 w-4" aria-hidden />
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {auth.user.pictureUrl ? (
        <img
          src={auth.user.pictureUrl}
          alt=""
          className="h-8 w-8 rounded-full border border-slate-200"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="grid h-8 w-8 place-items-center rounded-full bg-mint/10 text-xs font-bold text-mint">
          {(auth.user.name || auth.user.email || "U").slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 sm:inline">
        {auth.user.name || auth.user.email}
      </span>
      <button
        type="button"
        className="icon-button"
        title="Sign out"
        aria-label="Sign out"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
