/**
 * lib/pi-image.ts
 *
 * Client-side preparation of a product picture for the Proforma Invoice.
 *
 * The admin picks a photo from the local disk; the browser hands it to us as
 * a data URL. A modern phone photo is 3-5 MB, which is far too much to keep
 * inside a database row, so the image is scaled down and re-encoded as JPEG
 * before it is stored. The result is a few tens of kilobytes — small enough
 * to keep in the PI row, sharp enough for the picture cell and for the PDF.
 *
 * The picture is downscaled rather than cropped: the PI document renders it
 * with object-contain, so the whole artwork stays visible.
 *
 * Nothing here may fail silently. A picture that cannot be stored is a
 * picture the customer will never see on the PI, so the preparation either
 * produces a storable data URL or throws with a message the admin can act on.
 */

/** Longest edge of the stored picture, in pixels. */
export const MAX_IMAGE_EDGE = 600;

/** JPEG quality of the stored picture (0-1). */
export const IMAGE_QUALITY = 0.72;

/** Hard limit for the stored data URL (characters). */
export const MAX_IMAGE_DATA_URL_LENGTH = 150_000;

/**
 * Renditions tried in order until one fits the storage budget.
 *
 * The first entry is the normal one (600px, quality 0.72). The rest only
 * matter for very busy or very large pictures, whose base64 payload would
 * otherwise exceed MAX_IMAGE_DATA_URL_LENGTH and be dropped by the server.
 */
const RENDITIONS: Array<{ edge: number; quality: number }> = [
  { edge: MAX_IMAGE_EDGE, quality: IMAGE_QUALITY },
  { edge: MAX_IMAGE_EDGE, quality: 0.6 },
  { edge: 480, quality: 0.6 },
  { edge: 400, quality: 0.55 },
  { edge: 320, quality: 0.5 },
  { edge: 240, quality: 0.45 },
];

/**
 * Read a picked file and return a downscaled JPEG data URL.
 *
 * The renditions in RENDITIONS are tried one after another and the first
 * one that fits the storage budget is returned. When the browser cannot
 * decode the file at all (an exotic format such as HEIC) the original bytes
 * are kept — but only when they are small enough to be stored anyway.
 *
 * Throws when no rendition fits, so the caller can tell the admin instead of
 * quietly saving a PI without the picture.
 */
export async function fileToPiImageDataUrl(file: File): Promise<string> {
  const original = await readAsDataUrl(file);

  let bitmap: HTMLImageElement;
  try {
    bitmap = await decodeImage(original);
  } catch {
    // The browser cannot decode this format. It is still usable if it is
    // already small enough to store.
    if (isStorableImage(original)) return original;
    throw new Error(
      "This picture could not be processed by the browser. Please upload a JPEG, PNG or WebP file.",
    );
  }

  for (const rendition of RENDITIONS) {
    const scaled = drawScaled(bitmap, rendition.edge, rendition.quality);
    if (!scaled) continue;
    if (scaled.length <= MAX_IMAGE_DATA_URL_LENGTH) return scaled;
  }

  throw new Error(
    "This picture is still too large to store after compression. Please upload a smaller image (under 1 MB).",
  );
}

/** True when a data URL is small enough to be persisted with the PI. */
export function isStorableImage(dataUrl: string): boolean {
  return (
    dataUrl.startsWith("data:image/") &&
    dataUrl.length <= MAX_IMAGE_DATA_URL_LENGTH
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

function decodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode the image"));
    img.src = src;
  });
}

/** Redraw the picture on a white canvas, scaled to fit the given edge. */
function drawScaled(img: HTMLImageElement, edge: number, quality: number): string {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  if (!naturalW || !naturalH) return "";

  const scale = Math.min(1, edge / Math.max(naturalW, naturalH));
  const width = Math.max(1, Math.round(naturalW * scale));
  const height = Math.max(1, Math.round(naturalH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // JPEG has no alpha channel — paint the white paper color behind it.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}
