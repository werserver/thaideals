// Convert product name to URL-safe slug
export function toSlug(name: string): string {
  return encodeURIComponent(
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\-]/g, "")
      .toLowerCase()
  );
}

// Build product path
export function productPath(productId: string, productName: string): string {
  return `/product/${toSlug(productName)}-${productId}.html`;
}

// Extract product ID from slug (last segment before .html)
export function extractIdFromSlug(slug: string): string {
  const withoutHtml = slug.replace(/\.html$/, "");
  const parts = withoutHtml.split("-");
  return parts[parts.length - 1] || slug;
}
