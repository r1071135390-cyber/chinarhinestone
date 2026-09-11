"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  type?: "image" | "video";
  src: string;
  poster?: string;
  alt?: string;
};

type Props = {
  media: MediaItem[];
  alt: string;
};

/**
 * Product media gallery with click-to-zoom lightbox. Supports both
 * still images and short video clips mixed in the same list.
 *
 * - Renders a responsive 3-column grid (2 on mobile, 3 on tablet+).
 * - Video cells show a centered play icon overlay.
 * - Clicking a cell opens a fullscreen lightbox with prev/next
 *   navigation, keyboard support (←/→/Esc) and body scroll lock.
 * - In the lightbox, video items get a native HTML5 video player
 *   (with controls). The `<video>` element is mounted only when the
 *   lightbox is open so the page does not preload every video.
 */
export function ProductGallery({ media, alt }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i == null ? null : (i - 1 + media.length) % media.length,
      ),
    [media.length],
  );
  const next = useCallback(
    () =>
      setLightboxIndex((i) =>
        i == null ? null : (i + 1) % media.length,
      ),
    [media.length],
  );

  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, close, prev, next]);

  // When the lightbox is open and the active item is a video, kick off
  // playback as soon as the element is in the DOM. If the browser blocks
  // autoplay (no user gesture yet), the user can hit play in the controls.
  useEffect(() => {
    if (lightboxIndex == null) return;
    const item = media[lightboxIndex];
    if (item?.type !== "video") return;
    const id = window.setTimeout(() => {
      lightboxVideoRef.current?.play().catch(() => {
        /* autoplay blocked — user can press play */
      });
    }, 50);
    return () => window.clearTimeout(id);
  }, [lightboxIndex, media]);

  if (media.length === 0) return null;

  const activeItem = lightboxIndex == null ? null : media[lightboxIndex];
  const activeIsVideo = activeItem?.type === "video";

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
        {media.map((item, i) => {
          const isVideo = item.type === "video";
          return (
            <button
              key={`${item.src}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition hover:border-blue-400 hover:shadow-md"
              aria-label={`Open ${isVideo ? "video" : "image"} ${i + 1} of ${media.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.poster ?? item.src}
                alt={item.alt ?? `${alt} — ${isVideo ? "video" : "image"} ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              {isVideo && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 ml-0.5" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              )}
              {!isVideo && (
                <span className="absolute inset-0 bg-blue-700/0 transition group-hover:bg-blue-700/10" />
              )}
            </button>
          );
        })}
      </div>

      {lightboxIndex != null && activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {media.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {activeIsVideo ? (
            <video
              key={activeItem.src}
              ref={lightboxVideoRef}
              src={activeItem.src}
              poster={activeItem.poster}
              controls
              playsInline
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={activeItem.src}
              src={activeItem.src}
              alt={
                activeItem.alt ??
                `${alt} — image ${lightboxIndex + 1}`
              }
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {media.length > 1 && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
              {lightboxIndex + 1} / {media.length}
              {activeIsVideo ? " · Video" : ""}
            </p>
          )}
        </div>
      )}
    </>
  );
}
