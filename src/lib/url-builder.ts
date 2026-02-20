/**
 * URL Builder Utilities
 * สำหรับสร้าง URL ที่มี cloaking และ tracking
 */

export const buildCloakedUrl = (token: string, productUrl: string): string => {
  if (!token || !productUrl) return productUrl;

  const baseUrl = 'https://goeco.mobi/?token=';
  const encodedUrl = encodeURIComponent(productUrl);
  return `${baseUrl}${token}&url=${encodedUrl}&source=api_product`;
};
