import React from 'react';

/**
 * HeroStructuredData
 * Injects Google-compliant Schema.org JSON-LD for rich snippets,
 * local business/agency recognition, and enhanced search engine indexing.
 */
export default function HeroStructuredData() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://ogmedia.agency/#organization',
        'name': 'OG MEDIA',
        'alternateName': ['OG Media Agency', 'OG Media Creative Intelligence Studio'],
        'url': 'https://ogmedia.agency',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://ogmedia.agency/ogmedia/assets/og_logo.png',
          'caption': 'OG Media Official Logo'
        },
        'slogan': 'Where Ideas Meet Impact',
        'description': 'OG Media is a creative intelligence studio engineering high-impact digital experiences, influencer marketing networks, viral meme distribution, and cinematic brand worldbuilding.',
        'knowsAbout': [
          'Influencer Marketing',
          'Meme Marketing',
          'Brand Worldbuilding',
          'Video Production & 4K Streaming',
          'Web & Mobile App Development',
          'Performance Marketing & SEO'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://ogmedia.agency/#website',
        'url': 'https://ogmedia.agency',
        'name': 'OG MEDIA // Digital Experience & Creative Intelligence',
        'publisher': {
          '@id': 'https://ogmedia.agency/#organization'
        },
        'inLanguage': 'en-US'
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
