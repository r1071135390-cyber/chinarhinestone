import type { Metadata } from "next";
import BankAccountsClient from "./BankAccountsClient";

export const metadata: Metadata = {
  title: "Bank Accounts — ChinaRhinestone Sales Portal",
  description:
    "Manage the four corporate receiving accounts (USD / EUR / GBP / CNY). Changes here flow into every PI's Bank Info block and the T/T payment instructions on /pay/.",
  noindex: true,
  robots: { index: false, follow: false },
};

export default function BankAccountsPage() {
  return <BankAccountsClient />;
}
