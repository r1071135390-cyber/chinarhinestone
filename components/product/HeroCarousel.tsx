"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = {
  type?: "image" | "video";
  src: string;
  poster?: string;
  alt?: string;
};

type Props = {
  media: MediaItem[];
  alt: string;
  priority?: boolean;
};

/**
 * Hero carousel with auto-advance, manual arrows, dot indicators and
 * thumbnail strip. Supports mixed image and video slides.
 *
 * Behaviour:
 * - Auto-advances every 5s; pauses on hover/focus.
 * - Touch swipe support for mobile.
 * - First image is treated as LCP and given `fetchPriority="high"`.
 * - Video slides are muted, autoplay when active, and pause when the
 *   slide is not active. The video's `poster` image is shown while
 *   the video is loading or while autoplay is blocked (e.g. on iOS
 *   without a user gesture).
 */
export function HeroCarousel({ media, alt, priority = true }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (paused || media.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % media.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, media.length]);

  // Play the active video, pause the others. Videos are muted + inline
  // by default, so autoplay is allowed in most browsers without a user
  // gesture. If a browser blocks it, the `poster` image stays visible.
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index) {
        v.currentTime = 0;
        v.play().catch(() => {
          /* autoplay blocked — poster is already showing */
        });
      } else {
        v.pause();
      }
    });
  }, [index, media.length]);

  const go = (i: number) => {
    const next = ((i % media.length) + media.length) % media.length;
    setIndex(next);
  };

  if (media.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl ring-1 ring-white/10 bg-slate-800"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
          go(index + (dx < 0 ? 1 : -1));
        }
        touchStartX.current = null;
      }}
    >
      {/* Slides */}
      <div className="relative aspect-[4/3] w-full">
        {media.map((item, i) => {
          const isActive = i === index;
          const isVideo = item.type === "video";
          return (
            <div
              key={`${item.src}-${i}`}
              className={`absolute inset-0 transition-opacity duration-500 ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {isVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={item.src}
                  poster={item.poster}
                  muted
                  loop
                  playsInline
                  preload={isActive ? "metadata" : "none"}
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt={
                    item.alt ?? (i === 0 ? alt : `${alt} — view ${i + 1}`)
                  }
                  width={1200}
                  height={900}
                  loading={priority && i === 0 ? "eager" : "lazy"}
                  decoding={priority && i === 0 ? "sync" : "async"}
                  // @ts-expect-error - fetchPriority valid HTML attribute
                  fetchpriority={priority && i === 0 ? "high" : "auto"}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Arrows */}
      {media.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {media.map((item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 overflow-x-auto bg-gradient-to-t from-black/70 to-transparent p-2">
          {media.map((item, i) => (
            <button
              key={`thumb-${item.src}-${i}`}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => go(i)}
              className={`relative h-12 w-16 shrink-0 overflow-hidden rounded ring-1 transition ${
                i === index ? "ring-2 ring-white" : "ring-white/30 hover:ring-white/60"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.poster ?? item.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
