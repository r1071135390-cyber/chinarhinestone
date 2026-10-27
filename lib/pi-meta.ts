/**
 * lib/pi-meta.ts
 *
 * Static text and labels of the Proforma Invoice.
 *
 * Both the on-screen document (components/pi/PIDocument.tsx) and the PDF
 * generator (lib/pi-pdf.ts) read the strings from here, so the two can
 * never drift apart: the PDF shows exactly the same wording as the page.
 */

/** Seller identity shown on every PI. */
export const SELLER_COMPANY = "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD";
export const SELLER_ADDRESS = "2nd Floor, No.11 Anshang Road, Yiwu City, China";
export const SELLER_ADDRESS_UPPER = "2ND FLOOR, NO.11 ANSHANG ROAD, YIWU, CHINA";
export const SELLER_CONTACT = "Mr. RamonWang / +86 13764593988 / ramon@chinarhinestone.com";
export const SELLER_WEBSITE = "ChinaRhinestone.com";

export const DEFAULT_TERMS_PAYMENT =
  "The buyer should pay 100% of payment amount 3 days after confirmation of the PI. The seller should arrange production after receiving the payment and approval of PP samples.";

/** Currency symbol per currency code. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
};

export function currencySymbol(code: string | undefined | null): string {
  const key = (code ?? "").trim().toUpperCase();
  return CURRENCY_SYMBOLS[key] ?? key;
}

/** Terms of the PI. */
export const TERMS_PORT_OF_LOADING = "Yiwu / Ningbo / Shanghai or any designated Chinese ports";
export const TERMS_PORT_OF_DESTINATION = "As Buyer address above";

export const CLAUSE_PRODUCTION_TIME =
  "Normally about 45 days after order payment received and approval of PP samples. Seller will not take any responsibility for any delivery delay caused by force majeure or unexpected events.";

export const CLAUSE_TOLERANCE_ITEMS = [
  "Knitted Fabric GSM tolerance of +10gram and Size Measurement of +1.5 inch can be allowed and accepted.",
  "Quantity Tolerance: +5% can be accepted, seller should make up if the quantity less is more than 5%.",
  "2% - 3% of the defective products can be allowed and accepted.",
];

export const CLAUSE_ADDITIONAL_ITEMS = [
  "(a). Buyer confirm to have the commercial rights to reproduce the design. If for any reason the legal owner of the design contacts fulfillment house, they will be directed to the buyer and buyer should bear all the losses of the seller.",
  "(b). Any loss caused by buyer's change in connection with the agreed contract will be on buyer's account.",
  "(c). The Seller should inform buyer to arrange the balance ONE week before the goods ready for shipment. The buyers should arrange the balance payment within 5 business days after seller's notice, of any loss occurred hereof will be on Buyer's account.",
  "(d). The contract effective date will be started since the seller receives the deposit from the buyer. The contract will be invalid if the payment is delayed by 5 working days after the contract date.",
  "(e). Force Majeure: In case of Force Majeure the Sellers shall not be responsible for delay in delivery or non-delivery of the goods but shall notify immediately the Buyers and deliver to the Buyers by registered mail a certificate issued by government authorities.",
];

export const CONTRACT_NOTE =
  "This contract is made out in two original copies, one copy to be held by each party in witness thereof.";

/** Labels of the BANK INFO block. */
export const BANK_LABEL_BENEFICIARY = "BENEFICIARY (COMPANY NAME):";
export const BANK_LABEL_COMPANY_ADDRESS = "COMPANY ADDRESS:";
export const BANK_LABEL_BANK_NAME = "BANK NAME:";
export const BANK_LABEL_ACCOUNT = "BANK ACCOUNT:";
export const BANK_LABEL_SWIFT = "BANK SWIFT CODE:";
export const BANK_LABEL_CNAPS = "CNAPS CODE:";
export const BANK_LABEL_BANK_ADDRESS = "BANK ADDRESS:";
export const BANK_LABEL_NOTES = "NOTES:";

/** Red hint under the beneficiary name (on-screen only, shown in the PDF too). */
export const BENEFICIARY_REMINDER =
  "The company name must be written in full. If it does not fit in the designated space, the full name should be written on the next line.";

/** Signature block labels. */
export const SIGNATURE_SELLER = "Seller Stamp / Signature:";
export const SIGNATURE_BUYER = "Buyer Stamp / Signature:";
