import type { Metadata } from "next";
import { Suspense } from "react";
import PayClient from "./PayClient";

export const metadata: Metadata = {
  title: "Proforma Invoice Payment",
  robots: { index: false, follow: false },
};

export default function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ pi?: string; payment?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <PayClient searchParams={searchParams} />
    </Suspense>
  );
}
