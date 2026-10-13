import type { Metadata } from "next";
import NewPIClient from "./NewPIClient";

export const metadata: Metadata = {
  title: "New PI — ChinaRhinestone Sales Portal",
  description: "Create a new Proforma Invoice manually.",
  noindex: true,
};

export default function NewPI() {
  return <NewPIClient />;
}
