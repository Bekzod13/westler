"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useContactModal } from "@/components/westler/contact-modal";
import { useLocale } from "@/components/westler/locale-provider";
import { useSite } from "@/components/westler/site-content-provider";
import { fetchPublicBanners, normalizeUploadedImageSrc } from "@/lib/public-api";
import { imgSection } from "@/lib/westler-assets";

const AUTOPLAY_MS = 8000;

/** YouTube video IDs are typically 11 chars ([A-Za-z0-9_-]). */
const YOUTUBE_ID_RE = /^[\w-]{10,12}$/;

/**
 * Extract a YouTube video id from youtu.be, watch, embed, shorts, or mobile URLs.
 */
function parseYouTubeVideoId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0];
    return id && YOUTUBE_ID_RE.test(id) ? id : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (url.pathname.startsWith("/embed/")) {
      const id = url.pathname.slice(7).split("/")[0]?.split("?")[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.slice(8).split("/")[0]?.split("?")[0];
      return id && YOUTUBE_ID_RE.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && YOUTUBE_ID_RE.test(v)) return v;
  }
  return null;
}

function buildYouTubeEmbedSrc(videoId: string): string {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    showinfo: "0",
  });
  return `https://www.youtube.com/embed/${videoId}?${q}`;
}

type Slide = {
  key: string;
  imageSrc: string;
  /** When set, active slide shows this muted embed instead of the image. */
  youtubeEmbedSrc: string | null;
  titleLines: string[];
  subtitleHtml: string;
  ctaLabel: string;
};

function toSlidesFromApi(
  banners: {
    id: number;
    image: string | null;
    video: string | null;
    title: string;
    subtitle: string;
    button: string;
  }[],
): Slide[] {
  return banners.map((b) => {
    const raw = b.title.trim();
    const titleLines = raw
      ? raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
      : [""];
    const imageSrc =
      normalizeUploadedImageSrc(b.image) ?? imgSection;
    const v = b.video?.trim();
    const ytId = v ? parseYouTubeVideoId(v) : null;
    const youtubeEmbedSrc = ytId ? buildYouTubeEmbedSrc(ytId) : null;
    return {
      key: `hero-${b.id}`,
      imageSrc,
      youtubeEmbedSrc,
      titleLines,
      subtitleHtml: b.subtitle || "",
      ctaLabel: b.button.trim(),
    };
  });
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function HeroSlideBackground({
  slide,
  active,
  imagePriority,
  preferStillImage,
}: {
  slide: Slide;
  active: boolean;
  imagePriority: boolean;
  preferStillImage: boolean;
}) {
  const useYoutube =
    Boolean(slide.youtubeEmbedSrc) && active && !preferStillImage;

  if (useYoutube && slide.youtubeEmbedSrc) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <iframe
          src={slide.youtubeEmbedSrc}
          title=""
          className="pointer-events-none absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <Image
      src={slide.imageSrc}
      alt=""
      fill
      priority={imagePriority}
      className="object-cover"
      sizes="100vw"
    />
  );
}

type HeroSliderProps = {
  /** Fires once when the banner API request settles (success or fallback). */
  onReady?: () => void;
};

export function HeroSlider({ onReady }: HeroSliderProps) {
  const { locale } = useLocale();
  const site = useSite(locale);
  const hs = site.heroSlider;
  const siteRef = useRef(site);
  siteRef.current = site;
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferStillHero, setPreferStillHero] = useState(false);
  const fetchGen = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPreferStillHero(mq.matches);
    const onChange = () => setPreferStillHero(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const my = ++fetchGen.current;
    setLoading(true);
    fetchPublicBanners(locale, ac.signal)
      .then((res) => {
        if (my !== fetchGen.current) return;
        const s = siteRef.current;
        const emptyCta = s.heroSlider.emptyCta;
        const next = toSlidesFromApi(res.banners);
        setSlides(
          next.length > 0
            ? next.map((slide) => ({
                ...slide,
                ctaLabel: slide.ctaLabel || emptyCta,
              }))
            : [
                {
                  key: "empty",
                  imageSrc: imgSection,
                  youtubeEmbedSrc: null,
                  titleLines: [s.brand],
                  subtitleHtml: "",
                  ctaLabel: emptyCta,
                },
              ],
        );
      })
      .catch((e: unknown) => {
        if (my !== fetchGen.current) return;
        if (e instanceof Error && e.name === "AbortError") return;
        const s = siteRef.current;
        setSlides([
          {
            key: "fallback",
            imageSrc: imgSection,
            youtubeEmbedSrc: null,
            titleLines: ["Engineering Scale.", "Delivering Power.", "Globally."],
            subtitleHtml: `<p>${s.meta.description}</p>`,
            ctaLabel: s.heroSlider.emptyCta,
          },
        ]);
      })
      .finally(() => {
        if (my !== fetchGen.current) return;
        setLoading(false);
        onReady?.();
      });
    return () => ac.abort();
  }, [locale]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const slideCount = slides.length;
  const { open: openContact } = useContactModal();
  const heroTextRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation on slide change
  useEffect(() => {
    if (!heroTextRef.current || slides.length === 0) return;
    const el = heroTextRef.current;
    const children = el.children;
    gsap.killTweensOf(children);
    gsap.fromTo(
      children,
      { y: 30, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
      },
    );
  }, [index, slides.length]);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (slideCount === 0) return;
      setIndex((i) => (i + dir + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    if (paused || slideCount <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, go, slideCount]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const end = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = end - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) go(1);
    else go(-1);
  };

  if (loading || slides.length === 0) {
    return (
      <section
        className="relative flex min-h-[100vh] items-center justify-center overflow-hidden pt-16 md:pt-20"
        aria-busy="true"
        aria-label="Featured highlights"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={imgSection}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-r from-[rgba(14,29,42,0.85)] via-[rgba(14,29,42,0.65)] to-[rgba(14,29,42,0.35)]"
          aria-hidden
        />
        <p className="relative z-10 font-[family-name:var(--font-inter)] text-lg text-white/80">
          {hs.loading}
        </p>
      </section>
    );
  }

  const current = slides[index]!;

  return (
    <section
      className="relative flex min-h-[100vh] items-center overflow-hidden pt-16 md:pt-20"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "z-0 opacity-100" : "z-0 opacity-0 pointer-events-none"
          }`}
          aria-hidden={i !== index}
        >
          <HeroSlideBackground
            slide={slide}
            active={i === index}
            imagePriority={i === 0}
            preferStillImage={preferStillHero}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-[rgba(14,29,42,0.85)] via-[rgba(14,29,42,0.65)] to-[rgba(14,29,42,0.35)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-24 text-left lg:px-10">
        <div key={current.key} ref={heroTextRef}>
          <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1]">
            {current.titleLines.map((line, lineIdx) => (
              <span key={`${current.key}-t-${lineIdx}`} className="block">
                {line}
              </span>
            ))}
          </h1>
          {current.subtitleHtml ? (
            <div
              className="hero-subtitle mt-6 max-w-xl font-[family-name:var(--font-inter)] text-lg leading-relaxed text-white/70 md:text-2xl md:leading-8 [&_a]:text-[#7ec8ff] [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: current.subtitleHtml }}
            />
          ) : (
            <p className="mt-6 max-w-xl font-[family-name:var(--font-inter)] text-lg leading-relaxed text-white/70 md:text-2xl md:leading-8">
              &nbsp;
            </p>
          )}
          <div className="mt-10">
            <button
              type="button"
              onClick={openContact}
              className="inline-flex rounded bg-[#2e739e] px-8 py-4 font-[family-name:var(--font-montserrat)] text-base font-semibold uppercase tracking-wide text-white transition hover:opacity-90"
            >
              {current.ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {slideCount > 1 ? (
        <div className="absolute bottom-8 left-1/2 z-[2] flex -translate-x-1/2 gap-2 md:bottom-10">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`${hs.slideAria} ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}

      {slideCount > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-[2] -translate-y-1/2 rounded-full bg-black/25 p-3 text-white backdrop-blur-sm transition hover:bg-black/40 md:left-6"
            aria-label={hs.prevAria}
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-[2] -translate-y-1/2 rounded-full bg-black/25 p-3 text-white backdrop-blur-sm transition hover:bg-black/40 md:right-6"
            aria-label={hs.nextAria}
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      ) : null}
    </section>
  );
}
