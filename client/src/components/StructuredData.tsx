import React from 'react';

export const StructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Art Souk",
    "alternateName": "Art Souk GCC",
    "url": "https://soukk.art",
    "description": "GCC's premier art marketplace connecting Saudi Arabian and Gulf artists with collectors worldwide",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://soukk.art/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "areaServed": [
      "Saudi Arabia",
      "United Arab Emirates", 
      "Qatar",
      "Kuwait",
      "Bahrain",
      "Oman"
    ],
    "audience": {
      "@type": "Audience",
      "name": "Art collectors, artists, and galleries in the GCC region"
    },
    "foundingDate": "2025",
    "sameAs": [
      "https://soukk.art"
    ],
    "offers": {
      "@type": "Offer",
      "name": "Founding Member Program",
      "description": "Exclusive early access to Art Souk marketplace with special benefits",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
