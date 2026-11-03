import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "EduPath AI — Kenya KCSE Cluster Points Calculator & KUCCPS Course Matcher" },
      {
        name: "description",
        content:
          "Calculate your KCSE weighted cluster points, check KUCCPS cutoff points, and discover 2,084+ qualifying degree and diploma programmes across 69 Kenyan universities with EduPath AI.",
      },
      {
        name: "keywords",
        content:
          "KUCCPS cluster points calculator, KCSE course matcher, KCSE results 2024 2025, KUCCPS university cut off points, Kenyan universities cluster points, calculate cluster points online Kenya, KUCCPS course application, University of Nairobi courses, Kenyatta University, JKUAT cluster points, Strathmore university courses, Moi University, degree courses for B minus, C plus courses Kenya, TVET diploma courses KUCCPS, EduPath AI Kenya",
      },
      { name: "author", content: "EduPath AI Kenya" },
      { name: "publisher", content: "EduPath AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },

      // Geo-Targeting / Kenya Local SEO
      { name: "geo.region", content: "KE" },
      { name: "geo.placename", content: "Nairobi, Kenya" },
      { name: "geo.position", content: "-1.286389;36.817223" },
      { name: "ICBM", content: "-1.286389, 36.817223" },
      { name: "target_country", content: "KE" },
      { name: "country", content: "Kenya" },
      { name: "coverage", content: "Kenya, East Africa" },
      { name: "distribution", content: "Global" },
      { name: "rating", content: "General" },

      // Open Graph
      { property: "og:site_name", content: "EduPath AI Kenya" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://edupath.co.ke" },
      { property: "og:title", content: "EduPath AI — Kenya KCSE Cluster Points Calculator & KUCCPS Degree Advisor" },
      {
        property: "og:description",
        content:
          "Discover every Kenyan university degree you qualify for after KCSE. 2,084+ courses, 69 universities, automated KUCCPS cluster points calculations and cutoffs.",
      },
      { property: "og:image", content: "https://edupath.co.ke/og-image.svg" },
      { property: "og:image:secure_url", content: "https://edupath.co.ke/og-image.svg" },
      { property: "og:image:type", content: "image/svg+xml" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "EduPath AI Kenya — KCSE Cluster Points & Course Matcher" },
      { property: "og:locale", content: "en_KE" },
      { property: "og:locale:alternate", content: "sw_KE" },

      // Twitter Cards
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://edupath.co.ke" },
      { name: "twitter:site", content: "@EduPathAI" },
      { name: "twitter:creator", content: "@EduPathAI" },
      { name: "twitter:title", content: "EduPath AI — Kenya KCSE Cluster Points Calculator & KUCCPS Course Matcher" },
      {
        name: "twitter:description",
        content:
          "Calculate your KCSE cluster points, check KUCCPS cutoff points, and discover 2,084+ qualifying degree programmes across 69 Kenyan universities.",
      },
      { name: "twitter:image", content: "https://edupath.co.ke/og-image.svg" },
      { name: "theme-color", content: "#2563EB" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "canonical", href: "https://edupath.co.ke" },
      { rel: "alternate", hrefLang: "en-KE", href: "https://edupath.co.ke/" },
      { rel: "alternate", hrefLang: "sw-KE", href: "https://edupath.co.ke/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://edupath.co.ke/" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": "https://edupath.co.ke/#app",
      "name": "EduPath AI",
      "alternateName": ["EduPath Kenya", "KCSE Course Matcher", "KUCCPS Cluster Calculator"],
      "url": "https://edupath.co.ke",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "description":
        "AI-powered education, KCSE course matching, KUCCPS cluster points calculator, and university placement intelligence platform for Kenyan students.",
      "logo": "https://edupath.co.ke/favicon.svg",
      "image": "https://edupath.co.ke/og-image.svg",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KES",
        "availability": "https://schema.org/InStock",
      },
      "inLanguage": ["en-KE", "sw-KE"],
      "author": {
        "@type": "EducationalOrganization",
        "name": "EduPath AI Kenya",
        "url": "https://edupath.co.ke",
        "sameAs": [
          "https://twitter.com/EduPathAI",
          "https://facebook.com/EduPathAI",
          "https://linkedin.com/company/edupath-ai"
        ],
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Nairobi CBD",
          "addressLocality": "Nairobi",
          "addressRegion": "Nairobi County",
          "postalCode": "00100",
          "addressCountry": "KE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -1.286389,
          "longitude": 36.817223
        },
        "areaServed": {
          "@type": "Country",
          "name": "Kenya",
          "identifier": "KE"
        }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://edupath.co.ke/#website",
      "name": "EduPath AI Kenya",
      "url": "https://edupath.co.ke",
      "inLanguage": ["en-KE", "sw-KE"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://edupath.co.ke/match?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://edupath.co.ke/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does EduPath AI calculate KCSE cluster points for KUCCPS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "EduPath AI calculates weighted cluster points using the official KUCCPS formula: C = sqrt((r / m) * (t / 84)) * 48, where 'r' is the sum of raw points in the four required cluster subjects, 'm' is maximum points for those subjects (48), and 't' is your total KCSE aggregate score out of 84."
          }
        },
        {
          "@type": "Question",
          "name": "Which Kenyan universities are covered on EduPath AI?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "EduPath AI covers all 69 Kenyan public and chartered private universities, including University of Nairobi (UoN), JKUAT, Kenyatta University (KU), Strathmore University, Moi University, Egerton, Maseno University, Mount Kenya University, Daystar, and USIU-Africa."
          }
        },
        {
          "@type": "Question",
          "name": "Can I check which courses I qualify for with C+, C plain, or C minus?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes. EduPath AI evaluates degree programmes (minimum KCSE C+ mean grade) as well as diploma and TVET courses (C plain, C minus, and below), matching your exact subject grades to KUCCPS minimum subject entry requirements."
          }
        },
        {
          "@type": "Question",
          "name": "Can I upload my KCSE result slip to calculate cluster points?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes. EduPath AI includes Google Gemini Vision AI OCR slip scanning on the Cluster Weights page, allowing candidates to snap or upload a photo of their KNEC KCSE result slip to auto-fill grades and subject codes instantly."
          }
        }
      ]
    }
  ];

  return (
    <html lang="en-KE" dir="ltr">
      <head>
        <HeadContent />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1347425464045114');
fbq('track', 'PageView');`,
          }}
        />
        {/* End Meta Pixel Code */}

        {/* Structured Data / JSON-LD for Google & Search Engines */}
        {structuredData.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schema),
            }}
          />
        ))}
      </head>
      <body>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1347425464045114&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
