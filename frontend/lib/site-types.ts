export type NavKey = "about" | "capabilities" | "engineering" | "contact";

export type SiteIconVariant =
  | "2"
  | "4"
  | "6"
  | "8"
  | "10"
  | "12"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26";

export type SitePayload = {
  meta: { title: string; description: string };
  brand: string;
  header: {
    nav: Record<NavKey, string>;
    discuss: string;
    languageAria: string;
    menuOpen: string;
    menuClose: string;
  };
  heroSlider: {
    loading: string;
    prevAria: string;
    nextAria: string;
    slideAria: string;
    emptyCta: string;
  };
  about: {
    headingLine1: string;
    headingLine2: string;
    p1: string;
    p2: string;
    imageAlt: string;
  };
  stats: { value: string; label: string }[];
  capabilitiesSectionTitle: string;
  capabilities: { title: string; body: string; image: string }[];
  sectorsSectionTitle: string;
  sectors: {
    title: string;
    body: string;
    iconVariant: SiteIconVariant;
  }[];
  engineering: {
    headingLine1: string;
    headingLine2: string;
    points: { label: string; variant: SiteIconVariant }[];
    cta: string;
    imageAlt: string;
  };
  whyUsSectionTitle: string;
  whyUs: {
    title: string;
    body: string;
    iconVariant: SiteIconVariant;
  }[];
  partnersSectionTitle: string;
  partnerLogos: string[];
  globalPresence: { title: string; body: string; mapAlt: string };
  closingCta: { headingLine1: string; headingLine2: string; buttonLabel: string };
  footer: {
    columns: { title: string; links: { label: string; href: string }[] }[];
    copyright: string;
  };
  contactModal: {
    title: string;
    closeDialogAria: string;
    closeButtonAria: string;
    fullName: string;
    companyName: string;
    phone: string;
    phonePlaceholder: string;
    phoneError: string;
    email: string;
    message: string;
    submit: string;
  };
};
