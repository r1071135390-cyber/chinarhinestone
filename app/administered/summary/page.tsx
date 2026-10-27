import type { Metadata } from "next";
import SummaryClient from "./SummaryClient";

export const metadata: Metadata = {
  title: "PI Summary — ChinaRhinestone Sales Portal",
  description: "Overview of all proforma invoices: count, value, and recent activity.",
};

export default function SummaryPage() {
  return <SummaryClient />;
}
