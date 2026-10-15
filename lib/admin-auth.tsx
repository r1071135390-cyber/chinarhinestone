"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

// Change this password after first deployment — treat as an environment secret.
// This matches the ADMIN_TOKEN value set in Cloudflare Pages env vars.
export const OWNER_PASSWORD = "CrhAdmin2026!PI";

const SESSION_KEY = "pi_admin_session";

function isUnlocked() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function lock() {
  sessionStorage.removeItem(SESSION_KEY);
}

function unlock() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked());
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="text-base font-bold uppercase tracking-widest text-black/50">
          Loading…
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="border-2 border-black bg-white p-8">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center bg-[#0a0a0a]">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight">Admin Access</h1>
              <p className="text-center text-sm text-black/50">
                Enter the owner password to continue.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (password === OWNER_PASSWORD) {
                  unlock();
                  setUnlocked(true);
                  setError(false);
                } else {
                  setError(true);
                  setPassword("");
                }
              }}
            >
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Password"
                  autoFocus
                  className={`w-full border-2 bg-white px-4 py-3 text-base text-black outline-none transition-colors focus:border-[#ff4d00] ${
                    error ? "border-red-600" : "border-black/20"
                  }`}
                />
                {error && (
                  <p className="mt-2 text-sm font-bold text-red-600">
                    Incorrect password. Try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full border-2 border-black bg-[#0a0a0a] py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#ff4d00] hover:border-[#ff4d00]"
              >
                Unlock
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-black/30">
            chinarhinestone.com — Internal Sales Portal
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
