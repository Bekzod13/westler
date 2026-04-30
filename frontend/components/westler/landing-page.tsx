"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ContactCtaButton } from "./contact-modal";
import { HeroSlider } from "./hero-slider";
import { SiteLoadingShell } from "./site-loading-shell";
import { SiteHeader } from "./site-header";
import { WestlerIcon } from "./westler-icon";
import { useLocale } from "@/components/westler/locale-provider";
import { useSite } from "@/components/westler/site-content-provider";
import {
  useEngineeringContent,
  useFooterContent,
  useGlobalPresenceContent,
  useSectorsContent,
  useWhyUsContent,
} from "@/components/westler/ui-strings-provider";
import {
  fetchPublicCompany,
  fetchPublicServices,
  normalizeUploadedImageSrc,
  type PublicCompany,
  type PublicService,
} from "@/lib/public-api";
import {
  fetchPublicPartners,
  partnerLogoSrc,
  type PublicPartner,
} from "@/lib/public-partner-api";
import type { SitePayload } from "@/lib/site-types";
import { imgEngineeringCadReview, imgIndustrialMachineryInspection, imgMap } from "@/lib/westler-assets";

const accent = "#2e739e";
const firefly = "#0e1d2a";

function isExternalHref(href: string): boolean {
  const t = href.trim();
  return /^https?:\/\//i.test(t) || t.startsWith("//");
}

function PartnerLogoTile({ p }: { p: PublicPartner }) {
  const src = partnerLogoSrc(p.image);
  const alt = p.title.trim() || "Partner";
  const href = p.link.trim();
  const inner = (
    <div className="flex h-[78px] w-40 shrink-0 items-center justify-center rounded bg-[rgba(244,244,244,0.8)] px-4">
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={120}
          height={40}
          className="h-9 w-auto object-contain opacity-90"
        />
      ) : (
        <span className="font-[family-name:var(--font-inter)] text-xs text-[#67737e]">
          {alt}
        </span>
      )}
    </div>
  );
  if (href && isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 transition hover:opacity-90"
      >
        {inner}
      </a>
    );
  }
  return <div className="shrink-0">{inner}</div>;
}

/** Infinite horizontal marquee (content moves left / linear). Duplicated list for seamless loop. */
function PartnersMarquee({ partners }: { partners: PublicPartner[] }) {
  const loop = useMemo(() => [...partners, ...partners], [partners]);
  return (
    <div className="relative mt-12 w-full overflow-hidden">
      <div className="partners-marquee-track gap-6 pr-6 hover:[animation-play-state:paused]">
        {loop.map((p, i) => (
          <PartnerLogoTile key={`${p.id}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

/** Leading digits + rest (e.g. `25+` → 25, `+`). */
function parseStatFigure(raw: string): { num: number; suffix: string } | null {
  const m = raw.trim().match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { num: Number.parseInt(m[1], 10), suffix: m[2] ?? "" };
}

function AnimatedStatFigure({ value }: { value: string }) {
  const parsed = useMemo(() => parseStatFigure(value), [value]);
  const elRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!parsed || !elRef.current) return;
    hasAnimated.current = false;
    setN(0);

    const el = elRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();

          const target = parsed.num;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => setN(Math.round(obj.val)),
          });
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [parsed, value]);

  if (!parsed) {
    return <>{value}</>;
  }
  return (
    <span ref={elRef}>
      {n}
      {parsed.suffix}
    </span>
  );
}

/** Stats row: same shape as `site.stats` — big `value`, small `label`. */
function aboutCompanyStatsRows(
  company: PublicCompany | null | undefined,
  site: SitePayload,
): { value: string; label: string }[] {
  const sections = company?.elements?.sections;
  if (sections != null && sections.length > 0) {
    return sections.map((row) => ({
      value: row.label,
      label: row.value,
    }));
  }
  return site.stats;
}

function CompanyAboutCopy({
  subtitle,
  fallbackP1,
  fallbackP2,
}: {
  subtitle: string;
  fallbackP1: string;
  fallbackP2: string;
}) {
  const t = subtitle.trim();
  if (t === "") {
    return (
      <>
        <p>{fallbackP1}</p>
        <p>{fallbackP2}</p>
      </>
    );
  }
  if (/<[a-z][\s\S]*>/i.test(t)) {
    return (
      <div
        className="space-y-4 font-[family-name:var(--font-inter)] text-lg leading-relaxed text-[#67737e] [&_p]:mb-4 [&_p:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: t }}
      />
    );
  }
  const parts = t.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className="space-y-4 font-[family-name:var(--font-inter)] text-lg leading-relaxed text-[#67737e]">
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function AboutCompanySection({
  site,
  company,
}: {
  site: SitePayload;
  company: PublicCompany | null | undefined;
}) {
  const hasApi =
    company != null &&
    (company.title.trim() !== "" || company.subtitle.trim() !== "");

  const titleLines = (() => {
    if (hasApi && company) {
      const lines = company.title
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) {
        return {
          line1: site.about.headingLine1,
          line2: site.about.headingLine2,
        };
      }
      if (lines.length === 1) {
        return { line1: lines[0]!, line2: "" };
      }
      return { line1: lines[0]!, line2: lines[1] ?? "" };
    }
    return {
      line1: site.about.headingLine1,
      line2: site.about.headingLine2,
    };
  })();

  const imageSrc =
    hasApi && company
      ? (normalizeUploadedImageSrc(company.image) ?? imgIndustrialMachineryInspection)
      : imgIndustrialMachineryInspection;

  const imageAlt =
    hasApi && company?.title.trim()
      ? company.title.replace(/\r?\n/g, " ").slice(0, 120)
      : site.about.imageAlt;

  return (
    <section id="aboutCompany" className="bg-white py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6" data-aos="fade-right" data-aos-duration="600">
            <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
              {titleLines.line1}
              {titleLines.line2 ? (
                <>
                  <br />
                  {titleLines.line2}
                </>
              ) : null}
            </h2>
            {hasApi && company ? (
              <CompanyAboutCopy
                subtitle={company.subtitle}
                fallbackP1={site.about.p1}
                fallbackP2={site.about.p2}
              />
            ) : (
              <div className="space-y-4 font-[family-name:var(--font-inter)] text-lg leading-relaxed text-[#67737e]">
                <p>{site.about.p1}</p>
                <p>{site.about.p2}</p>
              </div>
            )}
          </div>
          <div className="overflow-hidden rounded" data-aos="fade-left" data-aos-duration="600" data-aos-delay="150">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-[#dae0e7] pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {aboutCompanyStatsRows(company, site).map((s, idx) => (
            <div key={`${s.value}-${s.label}`} className="text-center" data-aos="fade-up" data-aos-delay={idx * 100}>
              <p
                className="font-[family-name:var(--font-montserrat)] text-5xl font-bold md:text-6xl lg:text-[72px] lg:leading-none tabular-nums"
                style={{ color: accent }}
              >
                <AnimatedStatFigure value={s.value} />
              </p>
              <p className="mt-2 font-[family-name:var(--font-inter)] text-sm uppercase tracking-wide text-[#67737e]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityServiceBody({
  text,
  disableTopMargin,
}: {
  text: string;
  disableTopMargin?: boolean;
}) {
  const t = text.trim();
  if (!t) return null;
  const mt = disableTopMargin ? "mt-0" : "mt-3";
  if (/<[a-z][\s\S]*>/i.test(t)) {
    return (
      <div
        className={`${mt} font-[family-name:var(--font-inter)] text-lg leading-relaxed text-[#bdbdbd] [&_p]:mb-2 [&_p:last-child]:mb-0`}
        dangerouslySetInnerHTML={{ __html: t }}
      />
    );
  }
  return (
    <p
      className={`${mt} font-[family-name:var(--font-inter)] text-lg leading-relaxed text-[#bdbdbd]`}
    >
      {t}
    </p>
  );
}

/** Service card with GSAP-powered hover reveal instead of CSS max-height (fixes the freeze). */
function ServiceCard({
  title,
  body,
  imageSrc,
  imageAlt,
  aosDelay,
}: {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  aosDelay: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onEnter = useCallback(() => {
    if (contentRef.current) {
      gsap.killTweensOf(contentRef.current);
      gsap.to(contentRef.current, {
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      });
    }
    if (bodyRef.current) {
      gsap.killTweensOf(bodyRef.current);
      gsap.to(bodyRef.current, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        delay: 0.08,
        ease: "power2.out",
      });
    }
    if (imageRef.current) {
      gsap.killTweensOf(imageRef.current);
      gsap.to(imageRef.current, {
        scale: 1.05,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, []);

  const onLeave = useCallback(() => {
    if (bodyRef.current) {
      gsap.killTweensOf(bodyRef.current);
      gsap.to(bodyRef.current, {
        autoAlpha: 0,
        y: 10,
        duration: 0.25,
        ease: "power2.in",
      });
    }
    if (contentRef.current) {
      gsap.killTweensOf(contentRef.current);
      gsap.to(contentRef.current, {
        y: "50%",
        duration: 0.45,
        delay: 0.05,
        ease: "power2.inOut",
      });
    }
    if (imageRef.current) {
      gsap.killTweensOf(imageRef.current);
      gsap.to(imageRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded cursor-pointer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      data-aos="fade-up"
      data-aos-delay={aosDelay}
    >
      <div className="relative aspect-[16/9] w-full min-h-[220px] overflow-hidden">
        <Image
          ref={imageRef}
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover will-change-transform"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[rgba(14,29,42,0.92)] via-[rgba(14,29,42,0.45)] to-transparent"
          aria-hidden
        />
        {/* Content wrapper: starts centered (translateY 50%), animates to bottom on hover */}
        <div
          ref={contentRef}
          className="absolute inset-x-0 bottom-0 p-8"
          style={{ transform: "translateY(50%)" }}
        >
          <h3 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold text-white drop-shadow-sm">
            {title}
          </h3>
          {body.trim() ? (
            <div
              ref={bodyRef}
              className="mt-3"
              style={{ opacity: 0, visibility: "hidden", transform: "translateY(10px)" }}
            >
              <CapabilityServiceBody text={body} disableTopMargin />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CapabilitiesSection({
  site,
  services,
}: {
  site: SitePayload;
  services: PublicService[] | null;
}) {
  const useApi = services != null && services.length > 0;

  return (
    <section id="capabilities" className="bg-[#f5f7fa] py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <h2 className="text-center font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl" data-aos="fade-up">
          {site.capabilitiesSectionTitle}
        </h2>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {useApi && services
            ? services.map((s, idx) => {
                const src =
                  normalizeUploadedImageSrc(s.image) ?? imgEngineeringCadReview;
                return (
                  <ServiceCard
                    key={s.id}
                    title={s.title}
                    body={s.subtitle}
                    imageSrc={src}
                    imageAlt={s.title.trim() || ""}
                    aosDelay={idx % 2 === 0 ? 0 : 100}
                  />
                );
              })
            : site.capabilities.map((c, idx) => (
                <ServiceCard
                  key={c.title}
                  title={c.title}
                  body={c.body}
                  imageSrc={c.image}
                  imageAlt=""
                  aosDelay={idx % 2 === 0 ? 0 : 100}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const { locale } = useLocale();
  const site = useSite(locale);
  const footerContent = useFooterContent(site);
  const globalPresenceContent = useGlobalPresenceContent(site);
  const whyUsContent = useWhyUsContent(site);
  const sectorsContent = useSectorsContent(site);
  const engineeringContent = useEngineeringContent(site);
  const [company, setCompany] = useState<PublicCompany | null | undefined>(
    undefined,
  );
  const [services, setServices] = useState<PublicService[] | null>(null);
  const [partners, setPartners] = useState<PublicPartner[] | null>(null);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setHeroReady(false);
  }, [locale]);

  useEffect(() => {
    const ac = new AbortController();
    void fetchPublicCompany(locale, ac.signal)
      .then((r) => setCompany(r.company))
      .catch(() => setCompany(null));
    void fetchPublicServices(locale, ac.signal)
      .then((r) => setServices(r.services))
      .catch(() => setServices([]));
    void fetchPublicPartners(locale, ac.signal)
      .then((r) => setPartners(r.partners))
      .catch(() => setPartners([]));
    return () => ac.abort();
  }, [locale]);

  const footerYear = new Date().getFullYear();

  const pageBusy =
    company === undefined ||
    services === null ||
    partners === null ||
    !heroReady;

  return (
    <>
      {pageBusy ? <SiteLoadingShell /> : null}
      <div className="min-h-screen bg-[#f5f7fa] text-[#1a1a1a]">
      <SiteHeader />

      <HeroSlider onReady={() => setHeroReady(true)} />

      <AboutCompanySection site={site} company={company} />

      <CapabilitiesSection site={site} services={services} />

      <section className="bg-white py-24 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <h2 className="text-center font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl" data-aos="fade-up">
            {sectorsContent.sectionTitle}
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sectorsContent.sectors.map((s, idx) => (
              <article
                key={`${s.iconVariant}-${idx}`}
                className="rounded border border-[#dae0e7] p-6 transition-shadow duration-300 hover:shadow-lg"
                data-aos="fade-up"
                data-aos-delay={idx * 80}
              >
                <WestlerIcon className="mb-4" variant={s.iconVariant} />
                <h3 className="font-[family-name:var(--font-montserrat)] text-base font-semibold text-[#1a1a1a]">
                  {s.title}
                </h3>
                <p className="mt-3 font-[family-name:var(--font-inter)] text-sm leading-relaxed text-[#67737e]">
                  {s.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="engineering"
        className="py-24 lg:py-28"
        style={{ backgroundColor: firefly }}
      >
        <div className="mx-auto grid max-w-[1280px] gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
          <div data-aos="fade-right" data-aos-duration="600">
            <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-white md:text-5xl">
              {engineeringContent.headingLine1}
              <br />
              {engineeringContent.headingLine2}
            </h2>
            <ul className="mt-8 space-y-4">
              {engineeringContent.points.map((p, pIdx) => (
                <li key={p.label} className="flex items-center gap-3" data-aos="fade-up" data-aos-delay={pIdx * 80}>
                  <WestlerIcon variant={p.variant} className="shrink-0" />
                  <span className="font-[family-name:var(--font-inter)] text-xl text-white/80">
                    {p.label}
                  </span>
                </li>
              ))}
            </ul>
            <ContactCtaButton className="mt-8 inline-flex rounded bg-[#2e739e] px-8 py-4 font-[family-name:var(--font-montserrat)] text-sm font-semibold uppercase tracking-wide text-white transition hover:opacity-90">
              {engineeringContent.cta}
            </ContactCtaButton>
          </div>
          <div className="overflow-hidden rounded" data-aos="fade-left" data-aos-duration="600" data-aos-delay="150">
            <div className="relative aspect-[4/3] w-full min-h-[280px]">
              <Image
                src={imgEngineeringCadReview}
                alt={engineeringContent.imageAlt}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa] py-24 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <h2 className="text-center font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl" data-aos="fade-up">
            {whyUsContent.sectionTitle}
          </h2>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {whyUsContent.whyUs.map((w, idx) => (
              <div
                key={`${w.iconVariant}-${idx}`}
                className="flex gap-4"
                data-aos="fade-up"
                data-aos-delay={idx * 80}
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: "rgba(46, 115, 158, 0.1)" }}
                >
                  <WestlerIcon variant={w.iconVariant} className="size-6" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-montserrat)] text-base font-semibold text-[#1a1a1a]">
                    {w.title}
                  </h3>
                  <p className="mt-2 font-[family-name:var(--font-inter)] text-sm leading-relaxed text-[#67737e]">
                    {w.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {partners !== null && partners.length > 0 ? (
        <section
          className="bg-white py-24 lg:py-28"
          aria-label={site.partnersSectionTitle}
        >
          <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-10">
            <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl" data-aos="fade-up">
              {site.partnersSectionTitle}
            </h2>
            <div data-aos="fade-up" data-aos-delay="100">
              <PartnersMarquee partners={partners} />
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-24 lg:pb-32 lg:pt-12">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <h2 className="text-center font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-[#1a1a1a] md:text-5xl" data-aos="fade-up">
            {globalPresenceContent.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center font-[family-name:var(--font-inter)] text-lg text-[#67737e]" data-aos="fade-up" data-aos-delay="100">
            {globalPresenceContent.body}
          </p>
          <div className="relative mx-auto mt-12 w-full max-w-[834px]" data-aos="zoom-in" data-aos-delay="200" data-aos-duration="800">
            <div className="relative aspect-[834.5/457] w-full">
              <Image
                src={imgMap}
                alt={globalPresenceContent.mapAlt}
                fill
                className="object-contain object-center"
                sizes="(min-width: 1024px) 834px, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-24 lg:py-28"
        style={{ backgroundColor: firefly }}
      >
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <h2 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold tracking-tight text-white md:text-5xl" data-aos="fade-up">
            {footerContent.closingCta.headingLine1}
            <br />
            {footerContent.closingCta.headingLine2}
          </h2>
          <div data-aos="fade-up" data-aos-delay="100">
            <ContactCtaButton className="mt-10 inline-block max-w-2xl rounded bg-[#2e739e] px-8 py-5 text-center font-[family-name:var(--font-montserrat)] text-sm font-semibold uppercase leading-snug tracking-wide text-white transition hover:opacity-90 sm:text-base">
              {footerContent.closingCta.buttonLabel}
            </ContactCtaButton>
          </div>
        </div>
      </section>

      <footer id="contact" className="text-white" style={{ backgroundColor: firefly }}>
        <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {footerContent.columns.map((col) => (
              <div key={col.title}>
                <p className="font-[family-name:var(--font-montserrat)] text-sm font-semibold uppercase tracking-wide text-white/60">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2 font-[family-name:var(--font-inter)] text-sm text-white/50">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center font-[family-name:var(--font-inter)] text-xs text-white/40">
            {company?.openedYear != null ? (
              <>
                © {company.openedYear} – {footerYear} {footerContent.copyright}
              </>
            ) : (
              <>
                © {footerYear} {footerContent.copyright}
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
