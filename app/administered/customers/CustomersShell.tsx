"use client";

import { useSearchParams, useRouter } from "next/navigation";
import CustomersClient from "./CustomersClient";
import CustomerDetailClient from "./CustomerDetailClient";

export default function CustomersShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get("id");

  if (customerId) {
    return (
      <>
        <button
          onClick={() => router.push("/administered/customers")}
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
