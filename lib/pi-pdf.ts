/**
 * lib/pi-pdf.ts
 *
 * Vector (real-text) PDF generator for the Proforma Invoice.
 *
 * Why not html2canvas: a canvas screenshot produces a picture of the page —
 * the text is not selectable, it blurs when zoomed, and the logo is often
 * dropped by cross-origin rules. This generator draws the same layout with
 * jsPDF primitives, so the PDF matches the on-screen document (same
 * wording, same table, same logo, same colours) and stays crisp.
 *
 * The wording comes from @/lib/pi-meta, the same constants the React
 * document uses, so the two can never drift apart.
 *
 * jsPDF's built-in fonts are WinAnsi only, so CJK characters cannot be
 * drawn. They are transliterated by sanitizeText() — the CNY bank details
 * are the only source of them, and they have English equivalents in
 * @/lib/pi-meta.
 */

import { jsPDF } from "jspdf";
import { getItemQty } from "@/lib/pi-item";
import {
  BANK_LABEL_ACCOUNT,
  BANK_LABEL_BANK_ADDRESS,
  BANK_LABEL_BANK_NAME,
  BANK_LABEL_BENEFICIARY,
  BANK_LABEL_CNAPS,
  BANK_LABEL_COMPANY_ADDRESS,
  BANK_LABEL_NOTES,
  BANK_LABEL_SWIFT,
  BENEFICIARY_REMINDER,
  CLAUSE_ADDITIONAL_ITEMS,
  CLAUSE_PRODUCTION_TIME,
  CLAUSE_TOLERANCE_ITEMS,
  CONTRACT_NOTE,
  SELLER_ADDRESS,
  SELLER_ADDRESS_UPPER,
  SELLER_COMPANY,
  SELLER_CONTACT,
  SELLER_WEBSITE,
  SIGNATURE_BUYER,
  SIGNATURE_SELLER,
  TERMS_PORT_OF_DESTINATION,
  TERMS_PORT_OF_LOADING,
} from "@/lib/pi-meta";
import type { PiDocumentData } from "@/lib/pi-document-data";

// ── Page geometry (A4 portrait, millimetres) ─────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_L = 12;
const MARGIN_R = 12;
const MARGIN_T = 12;
const MARGIN_B = 14;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R; // 186
const CONTENT_BOTTOM = PAGE_H - MARGIN_B;

// ── Colours ──────────────────────────────────────────────────────────────────
const BLACK: [number, number, number] = [0, 0, 0];
const GREY: [number, number, number] = [90, 90, 90];
const RED: [number, number, number] = [255, 77, 0];
const BLUE: [number, number, number] = [10, 108, 255];
const HEADER_FILL: [number, number, number] = [245, 245, 245];
const SIZE_FILL: [number, number, number] = [255, 247, 240];

// ── Item table columns (mm) — total must equal CONTENT_W ────────────────────
const COL_PICTURE = 26;
const COL_DESCRIPTION = 50;
const COL_FABRIC = 36;
const COL_QTY = 20;
const COL_PRICE = 24;
const COL_TOTAL = 30;

const FONT = "helvetica";

/** Chinese → English fallbacks for the parts that jsPDF cannot draw. */
const CJK_REPLACEMENTS: Array<[RegExp, string]> = [
  [/义乌市好梦家居用品制造有限公司/g, "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD"],
  [/浙江省义乌市安商路11号二楼/g, "2nd Floor, No.11 Anshang Road, Yiwu City, China"],
  [/中国农业银行浙江省分行/g, "Agricultural Bank of China, Zhejiang Branch"],
  [/浙江省金华市义乌市宾王路181号/g, "No.181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China"],
  [/国内人民币电汇请使用\s*CNAPS\s*代码\s*\d+\s*。?/g, "For domestic CNY transfer please use the CNAPS code shown above."],
];

/**
 * Make a string safe for the WinAnsi-encoded standard fonts.
 * Known Chinese bank strings are replaced with their English equivalents,
 * anything else outside Latin-1 is dropped.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  let out = input;
  for (const [re, replacement] of CJK_REPLACEMENTS) {
    out = out.replace(re, replacement);
  }
  // Drop characters the standard fonts cannot encode.
  return out
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .split("")
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 32 && code <= 255;
    })
    .join("");
}

function money(value: number, symbol: string): string {
  const n = Number.isFinite(value) ? value : 0;
  return `${symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function qtyText(value: number): string {
  return Number(value || 0).toLocaleString("en-US");
}

/**
 * The image format jsPDF must be told about. A data URL carries its own
 * MIME type, so read it from there instead of assuming PNG — product photos
 * are usually JPEG and jsPDF refuses to decode a JPEG announced as PNG.
 */
function imageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  const mime = dataUrl.slice(0, 64).toLowerCase();
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPEG";
  if (mime.includes("webp")) return "WEBP";
  return "PNG";
}

/** Fetch an image and return it as a data URL (null when it cannot be loaded). */
async function toDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface PdfImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * The drawing surface: a jsPDF document plus a cursor and helpers for
 * wrapping text, drawing cells and paginating.
 */
class Pdf {
  readonly doc: jsPDF;
  y = MARGIN_T;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.doc.setFont(FONT, "normal");
    this.doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
  }

  /** Reserve vertical space; start a new page when the content does not fit. */
  ensure(height: number): boolean {
    if (this.y + height <= CONTENT_BOTTOM) return false;
    this.doc.addPage();
    this.y = MARGIN_T;
    return true;
  }

  /** Move the cursor down, paginating if needed. */
  advance(height: number): void {
    this.ensure(height);
    this.y += height;
  }

  setFont(style: "normal" | "bold" | "italic" | "bolditalic", size: number): void {
    this.doc.setFont(FONT, style);
    this.doc.setFontSize(size);
  }

  setColor(color: [number, number, number]): void {
    this.doc.setTextColor(color[0], color[1], color[2]);
  }

  text(value: string, x: number, y: number, opts: { align?: "left" | "center" | "right" } = {}): void {
    this.doc.text(sanitizeText(value), x, y, opts.align ? { align: opts.align } : undefined);
  }

  /** Wrap text into lines that fit `width`; returns the lines. */
  wrap(value: string, width: number, size: number, style: "normal" | "bold" | "italic" | "bolditalic"): string[] {
    this.setFont(style, size);
    const clean = sanitizeText(value);
    if (!clean) return [""];
    return this.doc.splitTextToSize(clean, width) as string[];
  }

  /** Draw a paragraph; returns the height consumed. */
  paragraph(
    value: string,
    x: number,
    width: number,
    opts: {
      size?: number;
      style?: "normal" | "bold" | "italic" | "bolditalic";
      color?: [number, number, number];
      lineHeight?: number;
      indent?: number;
    } = {},
  ): number {
    const size = opts.size ?? 8;
    const style = opts.style ?? "normal";
    const lineHeight = opts.lineHeight ?? size * 0.52;
    const lines = this.wrap(value, width, size, style);
    this.setFont(style, size);
    this.setColor(opts.color ?? BLACK);
    for (const line of lines) {
      this.ensure(lineHeight);
      this.doc.text(line, x, this.y);
      this.y += lineHeight;
    }
    return lines.length * lineHeight;
  }

  /**
   * Draw a list of paragraphs as one block: when the whole block does not
   * fit in the remaining space the page breaks first, so a numbered list
   * is never split across two pages.
   * An optional heading is drawn as a bold label and stays with the block.
   */
  paragraphBlock(
    items: string[],
    x: number,
    width: number,
    opts: { size?: number; lineHeight?: number; heading?: string; headingSize?: number } = {},
  ): void {
    const size = opts.size ?? 8;
    const lineHeight = opts.lineHeight ?? size * 0.52;
    const headingSize = opts.headingSize ?? size;
    let total = 0;
    if (opts.heading) total += headingSize * 0.52;
    for (const item of items) {
      total += this.wrap(item, width, size, "normal").length * lineHeight;
    }
    this.ensure(total);
    if (opts.heading) {
      this.labeled(opts.heading, "", x, width, { size: headingSize });
    }
    for (const item of items) {
      this.paragraph(item, x, width, { size, lineHeight });
    }
  }

  /**
   * Draw a label/value pair where the label is bold and the value follows
   * on the same line. The value continues on the next line when it does
   * not fit.
   */
  labeled(
    label: string,
    value: string,
    x: number,
    width: number,
    opts: {
      size?: number;
      labelWidth?: number;
      color?: [number, number, number];
      valueColor?: [number, number, number];
    } = {},
  ): void {
    const size = opts.size ?? 8;
    const labelWidth = opts.labelWidth ?? 45;
    const lineHeight = size * 0.52;
    const labelText = sanitizeText(label);
    const valueText = sanitizeText(value);

    this.setFont("bold", size);
    this.setColor(BLACK);
    const labelLines = this.doc.splitTextToSize(labelText, labelWidth) as string[];

    this.setFont("normal", size);
    this.setColor(opts.valueColor ?? opts.color ?? BLACK);
    const valueLines = valueText
      ? (this.doc.splitTextToSize(valueText, width - labelWidth) as string[])
      : [];

    // First line: label + value, side by side.
    const firstValue = valueLines.shift() ?? "";
    this.ensure(lineHeight);
    this.setFont("bold", size);
    this.setColor(BLACK);
    this.doc.text(labelLines[0] ?? labelText, x, this.y);
    this.setFont("normal", size);
    this.setColor(opts.valueColor ?? opts.color ?? BLACK);
    if (firstValue) this.doc.text(firstValue, x + labelWidth, this.y);
    this.y += lineHeight;

    // Extra label lines (rare, e.g. a very long label).
    for (let i = 1; i < labelLines.length; i++) {
      this.ensure(lineHeight);
      this.setFont("bold", size);
      this.setColor(BLACK);
      this.doc.text(labelLines[i], x, this.y);
      this.y += lineHeight;
    }
    // Extra value lines, aligned under the value column.
    for (const line of valueLines) {
      this.ensure(lineHeight);
      this.setFont("normal", size);
      this.setColor(opts.valueColor ?? opts.color ?? BLACK);
      this.doc.text(line, x + labelWidth, this.y);
      this.y += lineHeight;
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, width = 0.2, color = BLACK): void {
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(width);
    this.doc.line(x1, y1, x2, y2);
  }

  /** Draw a table cell border. */
  cell(x: number, y: number, w: number, h: number, color = BLACK, width = 0.2): void {
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(width);
    this.doc.rect(x, y, w, h);
  }

  fill(x: number, y: number, w: number, h: number, color: [number, number, number]): void {
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.rect(x, y, w, h, "F");
  }
}

/** Draw a bordered, filled box (used for the header cells). */
function fillAndBorder(
  pdf: Pdf,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: [number, number, number],
): void {
  pdf.fill(x, y, w, h, fill);
  pdf.cell(x, y, w, h);
}

/** Format helper for the table's numeric cells. */
function priceCell(value: number, symbol: string): string {
  return money(value, symbol);
}

export interface PiPdfOptions {
  /** Product pictures keyed by line-item index. */
  images?: Array<PdfImage | null>;
  /** Logo image. */
  logo?: PdfImage | null;
}

/**
 * Build the Proforma Invoice PDF.
 *
 * @param data   the document data (identical to what the page renders)
 * @param options pre-loaded images (logo + product pictures)
 */
export function buildPiPdf(data: PiDocumentData, options: PiPdfOptions = {}): jsPDF {
  const pdf = new Pdf();
  const { symbol } = data;
  const images = options.images ?? [];
  const logo = options.logo ?? null;

  // ── HEADER ────────────────────────────────────────────────────────────────
  const headerTop = MARGIN_T;
  let headerHeight = 22;

  if (logo) {
    // Keep the logo's aspect ratio, cap the height.
    const maxH = 16;
    const maxW = 40;
    const ratio = logo.width / logo.height || 1;
    let h = maxH;
    let w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    try {
      pdf.doc.addImage(
        logo.dataUrl,
        imageFormat(logo.dataUrl),
        MARGIN_L,
        headerTop + 2,
        w,
        h,
        undefined,
        "FAST"
      );
    } catch {
      // A broken logo must never break the PDF.
    }
    headerHeight = Math.max(headerHeight, h + 6);
  }

  const titleX = logo ? MARGIN_L + 44 : MARGIN_L;
  const titleW = MARGIN_L + CONTENT_W - titleX;

  pdf.setFont("bold", 11);
  pdf.setColor(BLACK);
  pdf.text(SELLER_COMPANY, titleX, headerTop + 5);

  pdf.setFont("normal", 8);
  pdf.setColor(GREY);
  pdf.text(`ADD: ${SELLER_ADDRESS}`, titleX, headerTop + 10);

  pdf.setFont("bold", 20);
  pdf.setColor(BLACK);
  pdf.text("PROFORMA INVOICE", titleX, headerTop + 20);

  pdf.y = headerTop + headerHeight;
  pdf.line(MARGIN_L, pdf.y, MARGIN_L + CONTENT_W, pdf.y, 0.6);
  pdf.y += 4;

  // ── FM + INVOICE INFO ─────────────────────────────────────────────────────
  const colGap = 6;
  const leftW = 78;
  const rightX = MARGIN_L + leftW + colGap;
  const rightW = CONTENT_W - leftW - colGap;
  const blockTop = pdf.y;

  const fmLines = [
    `FM: ${SELLER_WEBSITE}`,
    SELLER_COMPANY,
    SELLER_ADDRESS_UPPER,
    `Annt.: ${SELLER_CONTACT}`,
  ];
  let fmY = blockTop + 3;
  pdf.setFont("normal", 7.5);
  for (const line of fmLines) {
    const lines = pdf.wrap(line, leftW, 7.5, "normal");
    for (const l of lines) {
      pdf.setFont("normal", 7.5);
      pdf.setColor(BLACK);
      pdf.text(l, MARGIN_L, fmY);
      fmY += 4;
    }
  }

  const infoRows: Array<[string, string]> = [
    ["INVOICE NO.:", data.piNumber],
    ["ISSUE DATE:", data.issueDate],
    ["LEAD TIME:", data.leadTimeText],
    ["CURRENCY:", data.currencyLabel],
  ];
  let infoY = blockTop + 3;
  for (const [label, value] of infoRows) {
    const valueLines = pdf.wrap(value, rightW - 40, 8, "normal");
    pdf.setFont("bold", 8);
    pdf.setColor(BLACK);
    pdf.text(label, rightX, infoY);
    pdf.setFont("normal", 8);
    pdf.setColor(BLACK);
    pdf.text(valueLines[0] ?? "", rightX + 40, infoY);
    infoY += 5;
    for (const extra of valueLines.slice(1)) {
      pdf.setFont("normal", 8);
      pdf.setColor(BLACK);
      pdf.text(extra, rightX + 40, infoY);
      infoY += 4.2;
    }
  }

  pdf.y = Math.max(fmY, infoY) + 3;
  pdf.line(MARGIN_L, pdf.y, MARGIN_L + CONTENT_W, pdf.y, 0.2, GREY);
  pdf.y += 4;

  // ── TO: block ─────────────────────────────────────────────────────────────
  const toWidth = CONTENT_W - 18;
  pdf.setFont("bold", 8.5);
  pdf.setColor(BLACK);
  pdf.text("TO:", MARGIN_L, pdf.y + 3);

  const toX = MARGIN_L + 18;
  const halfW = (toWidth - 4) / 2;
  let toY = pdf.y + 3;

  const toFields: Array<[string, string]> = [
    ["CONTACT NAME *", data.customerName],
    ["COMPANY (OPTIONAL)", data.customerCompany],
  ];
  for (const [label, value] of toFields) {
    const lines = pdf.wrap(value, halfW, 8, "normal");
    pdf.setFont("normal", 6.5);
    pdf.setColor(GREY);
    pdf.text(label, toX, toY);
    toY += 3.4;
    pdf.setFont("normal", 8);
    pdf.setColor(BLACK);
    pdf.text(lines[0] ?? "-", toX, toY);
    toY += 4.4;
  }

  // Address spans the full width.
  const addressLines = pdf.wrap(data.customerAddress, toWidth, 8, "normal");
  pdf.setFont("normal", 6.5);
  pdf.setColor(GREY);
  pdf.text("ADDRESS", toX, toY);
  toY += 3.4;
  for (const line of addressLines) {
    pdf.setFont("normal", 8);
    pdf.setColor(BLACK);
    pdf.text(line, toX, toY);
    toY += 4.2;
  }

  // Phone / Email
  const contactRows: Array<[string, string]> = [
    ["PHONE *", data.customerPhone],
    ["EMAIL (OPTIONAL)", data.customerEmail],
  ];
  const contactStart = toY;
  let contactY = contactStart;
  contactRows.forEach(([label, value], idx) => {
    const x = toX + idx * (halfW + 4);
    const lines = pdf.wrap(value, halfW, 8, "normal");
    pdf.setFont("normal", 6.5);
    pdf.setColor(GREY);
    pdf.text(label, x, contactY);
    pdf.setFont("normal", 8);
    pdf.setColor(BLACK);
    pdf.text(lines[0] ?? "-", x, contactY + 3.4);
  });
  toY = contactStart + 8;

  pdf.y = toY + 3;
  pdf.line(MARGIN_L, pdf.y, MARGIN_L + CONTENT_W, pdf.y, 0.2, GREY);
  pdf.y += 4;

  // ── Items table ───────────────────────────────────────────────────────────
  drawItemsTable(pdf, data, images);

  // ── Terms ─────────────────────────────────────────────────────────────────
  pdf.advance(2);
  pdf.labeled("(1) Port of Loading:", TERMS_PORT_OF_LOADING, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.labeled("(2) Port of Destination:", TERMS_PORT_OF_DESTINATION, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.labeled("(3) Shipping Term:", data.shippingTerm, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.advance(1);
  pdf.labeled("(4) Terms of Payment:", data.termsPaymentText, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.advance(3);

  // ── BANK INFO ─────────────────────────────────────────────────────────────
  pdf.setFont("bold", 8.5);
  pdf.setColor(BLACK);
  pdf.text("BANK INFO:", MARGIN_L, pdf.y);
  pdf.y += 4;

  const bank = data.bank;
  pdf.labeled(BANK_LABEL_BENEFICIARY, bank.beneficiary, MARGIN_L, CONTENT_W, {
    size: 8,
    labelWidth: 48,
    valueColor: BLUE,
  });
  pdf.setFont("italic", 6.5);
  pdf.setColor(RED);
  const reminderLines = pdf.wrap(BENEFICIARY_REMINDER, CONTENT_W - 48, 6.5, "italic");
  for (const line of reminderLines) {
    pdf.ensure(3.6);
    pdf.setFont("italic", 6.5);
    pdf.setColor(RED);
    pdf.text(line, MARGIN_L + 48, pdf.y);
    pdf.y += 3.6;
  }

  pdf.labeled(BANK_LABEL_COMPANY_ADDRESS, bank.companyAddress, MARGIN_L, CONTENT_W, {
    size: 8,
    labelWidth: 48,
    valueColor: BLUE,
  });
  pdf.labeled(BANK_LABEL_BANK_NAME, bank.bankName, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  pdf.labeled(BANK_LABEL_ACCOUNT, bank.account, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  pdf.labeled(BANK_LABEL_SWIFT, bank.swift, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  if (bank.cnaps) {
    pdf.labeled(BANK_LABEL_CNAPS, bank.cnaps, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  }
  pdf.labeled(BANK_LABEL_BANK_ADDRESS, bank.bankAddress, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  if (bank.notes) {
    pdf.labeled(BANK_LABEL_NOTES, bank.notes, MARGIN_L, CONTENT_W, { size: 8, labelWidth: 48 });
  }
  pdf.advance(3);

  // ── Clauses (5)-(7) ───────────────────────────────────────────────────────
  pdf.labeled("(5) Production Time:", CLAUSE_PRODUCTION_TIME, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.advance(1);
  pdf.paragraphBlock(CLAUSE_TOLERANCE_ITEMS, MARGIN_L + 5, CONTENT_W - 5, {
    size: 7.5,
    lineHeight: 4,
    heading: "(6) Tolerance:",
    headingSize: 8,
  });
  pdf.advance(1);
  pdf.paragraphBlock(CLAUSE_ADDITIONAL_ITEMS, MARGIN_L + 5, CONTENT_W - 5, {
    size: 7.5,
    lineHeight: 4,
    heading: "(7) Additional Clause:",
    headingSize: 8,
  });
  pdf.advance(3);

  // ── Contract note + signatures ────────────────────────────────────────────
  // Keep the note and both signature blocks on one page.
  pdf.ensure(30);
  pdf.paragraph(CONTRACT_NOTE, MARGIN_L, CONTENT_W, { size: 8 });
  pdf.advance(6);

  const sigY = pdf.y;
  const sigW = CONTENT_W / 2 - 6;
  pdf.setFont("bold", 8);
  pdf.setColor(BLACK);
  pdf.text(SIGNATURE_SELLER, MARGIN_L, sigY);
  pdf.text(SIGNATURE_BUYER, MARGIN_L + CONTENT_W / 2 + 6, sigY);
  pdf.line(MARGIN_L, sigY + 14, MARGIN_L + sigW, sigY + 14, 0.4);
  pdf.line(MARGIN_L + CONTENT_W / 2 + 6, sigY + 14, MARGIN_L + CONTENT_W / 2 + 6 + sigW, sigY + 14, 0.4);
  pdf.setFont("normal", 8);
  pdf.setColor(BLACK);
  pdf.text(SELLER_COMPANY, MARGIN_L, sigY + 18);
  pdf.text(data.customerName || "(customer name)", MARGIN_L + CONTENT_W / 2 + 6, sigY + 18);

  // ── Page numbers ──────────────────────────────────────────────────────────
  const pages = pdf.doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.doc.setPage(p);
    pdf.doc.setFont(FONT, "normal");
    pdf.doc.setFontSize(7);
    pdf.doc.setTextColor(GREY[0], GREY[1], GREY[2]);
    pdf.doc.text(
      `PI ${data.piNumber}  |  Page ${p} of ${pages}`,
      PAGE_W / 2,
      PAGE_H - 7,
      { align: "center" }
    );
  }

  pdf.doc.setProperties({
    title: `Proforma Invoice ${data.piNumber}`,
    subject: "Proforma Invoice",
    author: SELLER_COMPANY,
    creator: "ChinaRhinestone.com",
  });

  return pdf.doc;
}

/**
 * Draw the item table: header, one row per line item (with its optional
 * size breakdown), the shipping row and the TOTAL row.
 */
function drawItemsTable(pdf: Pdf, data: PiDocumentData, images: Array<PdfImage | null>): void {
  const { symbol } = data;
  const x0 = MARGIN_L;
  const colX = [
    x0,
    x0 + COL_PICTURE,
    x0 + COL_PICTURE + COL_DESCRIPTION,
    x0 + COL_PICTURE + COL_DESCRIPTION + COL_FABRIC,
    x0 + COL_PICTURE + COL_DESCRIPTION + COL_FABRIC + COL_QTY,
    x0 + COL_PICTURE + COL_DESCRIPTION + COL_FABRIC + COL_QTY + COL_PRICE,
    x0 + COL_PICTURE + COL_DESCRIPTION + COL_FABRIC + COL_QTY + COL_PRICE + COL_TOTAL,
  ];

  const headerLabels = [
    "PRODUCT PICTURE",
    "DESCRIPTION",
    "FABRIC CONTENT",
    "QTY / UNIT",
    `PRICE (${symbol})`,
    `TOTAL ${data.currencyLabel}`,
  ];

  const drawHeader = () => {
    pdf.ensure(8);
    const top = pdf.y;
    const h = 8;
    for (let c = 0; c < 6; c++) {
      fillAndBorder(pdf, colX[c], top, colX[c + 1] - colX[c], h, HEADER_FILL);
      pdf.setFont("bold", 7);
      pdf.setColor(BLACK);
      pdf.text(headerLabels[c], colX[c] + 1.5, top + 5);
    }
    pdf.y = top + h;
  };

  drawHeader();

  data.items.forEach((item, idx) => {
    const qty = getItemQty(item);
    const descriptionLines = pdf.wrap(item.description, COL_DESCRIPTION - 3, 7.5, "normal");
    const fabricLines = pdf.wrap(item.fabric || "-", COL_FABRIC - 3, 7.5, "normal");
    const rowHeight = Math.max(
      14,
      Math.max(descriptionLines.length, fabricLines.length) * 4 + 3,
    );

    // A row must not be split across pages — start a new page if needed.
    if (pdf.y + rowHeight > CONTENT_BOTTOM) {
      pdf.doc.addPage();
      pdf.y = MARGIN_T;
      drawHeader();
    }

    const top = pdf.y;
    const image = images[idx];

    // Picture cell
    pdf.cell(colX[0], top, COL_PICTURE, rowHeight);
    if (image) {
      const maxW = COL_PICTURE - 4;
      const maxH = rowHeight - 4;
      const ratio = image.width / image.height || 1;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) {
        h = maxH;
        w = h * ratio;
      }
      try {
        pdf.doc.addImage(
          image.dataUrl,
          imageFormat(image.dataUrl),
          colX[0] + (COL_PICTURE - w) / 2,
          top + (rowHeight - h) / 2,
          w,
          h,
          undefined,
          "FAST"
        );
      } catch {
        // Skip an unreadable picture rather than failing the whole PDF.
      }
    }

    // Description cell
    pdf.cell(colX[1], top, COL_DESCRIPTION, rowHeight);
    pdf.setFont("normal", 7.5);
    pdf.setColor(BLACK);
    let lineY = top + 4;
    for (const line of descriptionLines) {
      pdf.text(line, colX[1] + 1.5, lineY);
      lineY += 4;
    }

    // Fabric cell
    pdf.cell(colX[2], top, COL_FABRIC, rowHeight);
    pdf.setFont("normal", 7.5);
    pdf.setColor(BLACK);
    lineY = top + 4;
    for (const line of fabricLines) {
      pdf.text(line, colX[2] + 1.5, lineY);
      lineY += 4;
    }

    // Qty / Unit
    pdf.cell(colX[3], top, COL_QTY, rowHeight);
    pdf.setFont("bold", 7.5);
    pdf.setColor(BLACK);
    pdf.text(qtyText(qty), colX[3] + 1.5, top + 4);
    pdf.setFont("normal", 7);
    pdf.setColor(GREY);
    pdf.text(item.unit, colX[3] + 1.5, top + 8.5);

    // Unit price
    pdf.cell(colX[4], top, COL_PRICE, rowHeight);
    pdf.setFont("normal", 7.5);
    pdf.setColor(BLACK);
    pdf.text(priceCell(item.unitPrice, symbol), colX[4] + 1.5, top + 4);

    // Line total
    pdf.cell(colX[5], top, COL_TOTAL, rowHeight);
    pdf.setFont("bold", 7.5);
    pdf.setColor(BLACK);
    pdf.text(priceCell(qty * item.unitPrice, symbol), colX[5] + 1.5, top + 4);

    pdf.y = top + rowHeight;

    // Size breakdown sub-row
    if (item.hasSizeBreakdown && item.sizes.length > 0) {
      const breakdown = item.sizes.map((s) => `${s.label}: ${s.qty}`).join("   ");
      const lines = pdf.wrap(breakdown, CONTENT_W - 6, 7.5, "normal");
      const h = lines.length * 4 + 3;
      if (pdf.y + h > CONTENT_BOTTOM) {
        pdf.doc.addPage();
        pdf.y = MARGIN_T;
        drawHeader();
      }
      const subTop = pdf.y;
      fillAndBorder(pdf, x0, subTop, CONTENT_W, h, SIZE_FILL);
      pdf.setFont("bold", 7.5);
      pdf.setColor(RED);
      pdf.text("SIZE BREAKDOWN:", x0 + 1.5, subTop + 4);
      pdf.setFont("normal", 7.5);
      pdf.setColor(BLACK);
      pdf.text(lines[0] ?? "", x0 + 26, subTop + 4);
      let ly = subTop + 4;
      for (const extra of lines.slice(1)) {
        ly += 4;
        pdf.setFont("normal", 7.5);
        pdf.setColor(BLACK);
        pdf.text(extra, x0 + 1.5, ly);
      }
      pdf.y = subTop + h;
    }
  });

  // ── Shipping row ──────────────────────────────────────────────────────────
  const shippingRowHeight = 9;
  if (pdf.y + shippingRowHeight > CONTENT_BOTTOM) {
    pdf.doc.addPage();
    pdf.y = MARGIN_T;
    drawHeader();
  }
  const sTop = pdf.y;
  pdf.cell(colX[0], sTop, COL_PICTURE, shippingRowHeight);
  pdf.setFont("normal", 7);
  pdf.setColor(GREY);
  pdf.text("-", colX[0] + COL_PICTURE / 2, sTop + 5.5, { align: "center" });

  pdf.cell(colX[1], sTop, COL_DESCRIPTION, shippingRowHeight);
  pdf.setFont("normal", 7.5);
  pdf.setColor(BLACK);
  pdf.text(data.shippingLabel, colX[1] + 1.5, sTop + 5.5);

  pdf.cell(colX[2], sTop, COL_FABRIC, shippingRowHeight);
  pdf.setFont("normal", 7.5);
  pdf.setColor(BLACK);
  pdf.text(data.shippingMethod, colX[2] + 1.5, sTop + 5.5);

  pdf.cell(colX[3], sTop, COL_QTY, shippingRowHeight);
  pdf.setFont("normal", 7.5);
  pdf.setColor(BLACK);
  pdf.text(String(data.shippingQty), colX[3] + 1.5, sTop + 5.5);

  pdf.cell(colX[4], sTop, COL_PRICE, shippingRowHeight);
  pdf.setFont("normal", 7.5);
  pdf.setColor(BLACK);
  pdf.text(priceCell(data.shippingCost, symbol), colX[4] + 1.5, sTop + 5.5);

  pdf.cell(colX[5], sTop, COL_TOTAL, shippingRowHeight);
  pdf.setFont("bold", 7.5);
  pdf.setColor(BLACK);
  pdf.text(priceCell(data.shippingTotal, symbol), colX[5] + 1.5, sTop + 5.5);
  pdf.y = sTop + shippingRowHeight;

  // ── TOTAL row ─────────────────────────────────────────────────────────────
  const totalRowHeight = 8;
  if (pdf.y + totalRowHeight > CONTENT_BOTTOM) {
    pdf.doc.addPage();
    pdf.y = MARGIN_T;
    drawHeader();
  }
  const tTop = pdf.y;
  fillAndBorder(pdf, x0, tTop, CONTENT_W - COL_TOTAL, totalRowHeight, HEADER_FILL);
  fillAndBorder(pdf, colX[5], tTop, COL_TOTAL, totalRowHeight, HEADER_FILL);
  pdf.setFont("bold", 8);
  pdf.setColor(BLACK);
  pdf.text("TOTAL:", colX[5] - 2, tTop + 5.5, { align: "right" });
  pdf.text(priceCell(data.grandTotal, symbol), colX[5] + 1.5, tTop + 5.5);
  pdf.y = tTop + totalRowHeight;

  // ── Subtotal summary ──────────────────────────────────────────────────────
  pdf.advance(2);
  const summary = `Subtotal: ${priceCell(data.itemsSubtotal, symbol)}  +  Shipping: ${priceCell(
    data.shippingTotal,
    symbol,
  )}  =  ${priceCell(data.grandTotal, symbol)}`;
  pdf.setFont("normal", 7);
  pdf.setColor(GREY);
  pdf.text(summary, MARGIN_L + CONTENT_W, pdf.y, { align: "right" });
  pdf.y += 2;
}

/** Load the logo + product pictures as data URLs for the PDF. */
export async function loadPiImages(data: PiDocumentData): Promise<PiPdfOptions> {
  const logoData = await toDataUrl("/logo.png");
  const logo = logoData ? await measureImage(logoData) : null;

  const images: Array<PdfImage | null> = [];
  for (const item of data.items) {
    if (!item.imageUrl) {
      images.push(null);
      continue;
    }
    const dataUrl = await toDataUrl(item.imageUrl);
    images.push(dataUrl ? await measureImage(dataUrl) : null);
  }

  return { images, logo };
}

/** Read the pixel size of an image so the PDF can keep its aspect ratio. */
async function measureImage(dataUrl: string): Promise<PdfImage | null> {
  if (typeof window === "undefined" || typeof Image === "undefined") {
    return { dataUrl, width: 100, height: 100 };
  }
  return new Promise<PdfImage | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ dataUrl, width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
