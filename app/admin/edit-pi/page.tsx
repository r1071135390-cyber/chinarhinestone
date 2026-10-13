import type { Metadata } from "next";
import EditPIClient from "./EditPIClient";

export const metadata: Metadata = {
  title: "Edit PI — ChinaRhinestone Sales Portal",
  description: "Edit an existing Proforma Invoice.",
};

export default function EditPI() {
  return <EditPIClient />;
}
