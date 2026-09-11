import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | Heat Transfer Manufacturer China | ChinaRhinestone",
  description:
    "Contact ChinaRhinestone for custom heat transfer quotes, bulk orders and samples. China manufacturer — we reply within 24 hours.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
