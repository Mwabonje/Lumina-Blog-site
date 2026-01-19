import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  authorName?: string;
  noIndex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  title, 
  description, 
  image, 
  canonicalUrl,
  type = 'website',
  publishedAt,
  authorName,
  noIndex = false
}) => {
  
  useEffect(() => {
    // Title
    document.title = `${title} | Lumina Blog`;

    // Helpers to update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Standard Meta
    if (description) updateMeta('description', description);

    // Open Graph
    updateMeta('og:title', title, 'property');
    if (description) updateMeta('og:description', description, 'property');
    if (image) updateMeta('og:image', image, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:url', window.location.href, 'property');
    
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (canonicalUrl) {
      link.setAttribute('href', canonicalUrl);
    } else {
      link.setAttribute('href', window.location.href);
    }

    // JSON-LD Schema Markup
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }

    if (type === 'article' && publishedAt) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": image ? [image] : [],
        "datePublished": publishedAt,
        "dateModified": publishedAt,
        "author": [{
            "@type": "Person",
            "name": authorName || "Lumina Team",
            "url": window.location.origin
          }]
      };
      if (description) Object.assign(schema, { "description": description });
      script.textContent = JSON.stringify(schema);
    } else {
      // Basic website schema
      const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Lumina Blog Platform",
        "url": window.location.origin,
      };
      script.textContent = JSON.stringify(schema);
    }

    return () => {
      // Cleanup might be needed in a real SPA to prevent duplicate tags accumulating, 
      // but for this implementation we rely on overwriting attributes.
    };

  }, [title, description, image, canonicalUrl, type, publishedAt, authorName, noIndex]);

  return null;
};

export default SEOHead;