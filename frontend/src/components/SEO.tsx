import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const DEFAULT_TITLE = 'Buy Badminton Rackets & Sports Gear in Sri Lanka | Wayamba Badminton Home';
const DEFAULT_DESCRIPTION = 'Buy 100% genuine Yonex, Li-Ning, Victor badminton rackets, shuttlecocks, court shoes, cricket and tennis equipment in Sri Lanka. Islandwide express delivery.';
const DEFAULT_KEYWORDS = 'Buy badminton Sri Lanka, Badminton shop Sri Lanka, Yonex badminton racket price Sri Lanka, Li-Ning badminton Sri Lanka, Victor badminton Sri Lanka, buy shuttlecocks Sri Lanka, badminton shoes Sri Lanka, sports shop Sri Lanka, cricket equipment Sri Lanka, tennis rackets Sri Lanka, Wayamba Badminton';
const SITE_URL = 'https://www.wayamba-badmintion-home.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd,
}: SEOProps) {
  const fullTitle = title
    ? `${title} | Wayamba Badminton Home Sri Lanka`
    : DEFAULT_TITLE;

  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to set or update meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta
    setMeta('description', description);
    setMeta('keywords', keywords);

    // 3. Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', currentUrl, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', ogType, true);
    setMeta('og:site_name', 'Wayamba Badminton Home', true);

    // 4. Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. JSON-LD Structured Data
    const scriptId = 'dynamic-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Cleanup custom JSON-LD when component unmounts
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [fullTitle, description, keywords, currentUrl, ogImage, ogType, jsonLd]);

  return null;
}
