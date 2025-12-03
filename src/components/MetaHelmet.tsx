import Head from "next/head";

interface MetaHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export default function MetaHelmet({
  title = "DockNow - Find and Book Marina Slips Instantly",
  description = "Discover and reserve premium marina slips across Mexico. Real-time availability, instant booking, and transparent pricing. Your perfect dock awaits at DockNow.",
  keywords = "marina booking, boat slip rental, dock reservation, yacht marina, Mexico marinas, Puerto Vallarta marina, Cabo San Lucas marina, marina services, boat docking, slip availability",
  ogTitle,
  ogDescription,
  ogImage = "https://garbrix.com/navios/assets/images/logo.png",
  ogUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  author = "DockNow",
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
}: MetaHelmetProps) {
  const fullTitle = title;
  const robotsContent = `${noindex ? "noindex" : "index"},${
    nofollow ? "nofollow" : "follow"
  }`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="DockNow" />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogTitle || fullTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:locale" content="en_US" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@docknow" />
      <meta name="twitter:creator" content="@docknow" />
      <meta
        name="twitter:title"
        content={twitterTitle || ogTitle || fullTitle}
      />
      <meta
        name="twitter:description"
        content={twitterDescription || ogDescription || description}
      />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      <meta
        name="twitter:image:alt"
        content={twitterTitle || ogTitle || fullTitle}
      />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#0B4F6C" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="apple-mobile-web-app-title" content="DockNow" />
      <meta name="application-name" content="DockNow" />
      <meta name="msapplication-TileColor" content="#0B4F6C" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Favicon and Icons */}
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://garbrix.com" />

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DockNow",
            description: description,
            url: ogUrl || "https://docknow.app",
            logo: ogImage,
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "Customer Service",
              email: "support@docknow.app",
            },
            sameAs: [
              "https://twitter.com/docknow",
              "https://facebook.com/docknow",
              "https://instagram.com/docknow",
            ],
          }),
        }}
      />
    </Head>
  );
}
