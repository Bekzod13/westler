import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { ContactModalProvider } from "@/components/westler/contact-modal";
import { LocaleProvider } from "@/components/westler/locale-provider";
import { SiteContentProvider } from "@/components/westler/site-content-provider";
import { UiStringsProvider } from "@/components/westler/ui-strings-provider";
import { AosProvider } from "@/components/westler/aos-provider";
import { LenisProvider } from "@/components/westler/lenis-provider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const metadata: Metadata = {
  title: "WESTLER — Industrial Solutions",
  description:
    "Integrated equipment supply, heavy logistics, and engineering solutions for complex industrial projects.",
  icons: {
    icon: [
      { url: "/logo/favicon.ico" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/logo/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/logo/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col font-[family-name:var(--font-inter)]"
        suppressHydrationWarning
      >
        <LenisProvider>
          <SiteContentProvider>
            <LocaleProvider>
              <UiStringsProvider>
                <ContactModalProvider>
                  <AosProvider />
                  {children}
                </ContactModalProvider>
              </UiStringsProvider>
            </LocaleProvider>
          </SiteContentProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
