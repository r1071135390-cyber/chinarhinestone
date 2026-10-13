"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import CustomersClient from "./CustomersClient";
import CustomerDetailClient from "./CustomerDetailClient";

export default function CustomersShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get("id");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("pi_customer_detail_unlocked") === "1");
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

  if (customerId && !unlocked) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="border-2 border-black bg-white p-8">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center bg-[#0a0a0a]">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Customer Detail
              </h1>
              <p className="text-center text-sm text-black/50">
                Enter the owner password to view PI history.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const pw = (e.currentTarget.elements.namedItem("pw") as HTMLInputElement).value;
                if (pw === "chinarhinestone2025") {
                  sessionStorage.setItem("pi_customer_detail_unlocked", "1");
                  setUnlocked(true);
                } else {
                  (e.currentTarget.elements.namedItem("pw") as HTMLInputElement).value = "";
                }
              }}
            >
              <input
                name="pw"
                type="password"
                placeholder="Password"
                autoFocus
                className="mb-4 w-full border-2 border-black/20 bg-white px-4 py-3 text-base text-black outline-none focus:border-[#ff4d00]"
              />
              <button
                type="submit"
                className="w-full border-2 border-black bg-[#0a0a0a] py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#ff4d00] hover:border-[#ff4d00]"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (customerId && unlocked) {
    return (
      <>
        <button
          onClick={() => router.push("/admin/customers")}
          className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider text-black hover:text-[#ff4d00]"
        >
          ← Back to customers
        </button>
        <CustomerDetailClient customerId={customerId} />
      </>
    );
  }

  return <CustomersClient />;
}
