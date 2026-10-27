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
 */

/** Longest edge of the stored picture, in pixels. */
export const MAX_IMAGE_EDGE = 600;

/** JPEG quality of the stored picture (0-1). */
export const IMAGE_QUALITY = 0.72;

/** Hard limit for the stored data URL (characters). */
export const MAX_IMAGE_DATA_URL_LENGTH = 150_000;

/**
 * Read a picked file and return a downscaled JPEG data URL.
 *
 * Falls back to the original data URL when the browser cannot decode the
 * file (an exotic format) or when downscaling produces something larger
 * than the original.
 */
export async function fileToPiImageDataUrl(file: File): Promise<string> {
  const original = await readAsDataUrl(file);

  try {
    const bitmap = await decodeImage(original);
    const scaled = drawScaled(bitmap);
    if (scaled.length > 0 && scaled.length < original.length) {
      return scaled;
    }
  } catch {
    // Decoding failed — keep the original bytes.
  }

  return original;
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

/** Redraw the picture on a white canvas, scaled to fit MAX_IMAGE_EDGE. */
function drawScaled(img: HTMLImageElement): string {
  const naturalW = img.naturalWidth || img.width;
  const naturalH = img.naturalHeight || img.height;
  if (!naturalW || !naturalH) return "";

  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(naturalW, naturalH));
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

  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
}
