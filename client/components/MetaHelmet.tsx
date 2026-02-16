import { Helmet } from "react-helmet-async";

interface MetaHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
}

const MetaHelmet: React.FC<MetaHelmetProps> = ({
  title = "DockNow - Find & Book Marina Slips Instantly",
  description = "Discover and book marina slips worldwide with DockNow. Real-time availability, instant booking, and secure payments for boat owners and marina operators.",
  keywords = "marina booking, boat slip rental, yacht berth, marina reservation, dock rental, boat parking, marine slip, harbor booking, boat dock",
  image = "/og-image.jpg",
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  siteName = "DockNow",
  twitterCard = "summary_large_image",
  twitterSite = "@docknow",
  twitterCreator = "@docknow",
  noindex = false,
}) => {
  // Get the current URL if not provided
  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  // Construct full image URL if relative path
  const fullImageUrl = image.startsWith("http")
    ? image
    : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`;

  // Clean title - remove site name if already present to avoid duplication
  const cleanTitle = title.includes(siteName)
    ? title
    : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{cleanTitle}</title>
      <meta name="title" content={cleanTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      )}

      {/* Canonical URL */}
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Article specific tags */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={cleanTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && (
        <meta name="twitter:creator" content={twitterCreator} />
      )}

      {/* Additional SEO tags */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Theme Color */}
      <meta name="theme-color" content="#0c4a6e" />
      <meta name="msapplication-TileColor" content="#0c4a6e" />

      {/* Apple Touch Icon */}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />

      {/* Favicon */}
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

      {/* Manifest */}
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default MetaHelmet;
