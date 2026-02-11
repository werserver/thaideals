import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  product?: {
    name: string;
    price: number;
    currency: string;
    image: string;
    rating: number;
    reviewCount: number;
    availability?: string;
  };
}

export function SEOHead({
  title = "ThaiDeals — สินค้าดีลพิเศษ",
  description = "รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ",
  image,
  url,
  type = "website",
  product,
}: SEOHeadProps) {
  const fullTitle = title.includes("ThaiDeals") ? title : `${title} | ThaiDeals`;

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image,
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: product.currency,
          availability: product.availability || "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "ThaiDeals",
        description,
        url: url || window.location.href,
      };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description.slice(0, 160)} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description.slice(0, 160)} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:site_name" content="ThaiDeals" />
      <meta property="og:locale" content="th_TH" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description.slice(0, 160)} />
      {image && <meta name="twitter:image" content={image} />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
