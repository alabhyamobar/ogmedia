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
          'url': 'https://ogmedia.agency/ogmedia/assets/og_logo.webp',
          'caption': 'OG Media Official Logo'
        },
        'slogan': 'Where Art Meets Intelligence',
        'description': 'OG Media is a creative intelligence studio engineering high-impact digital experiences, influencer marketing networks, viral meme distribution, and cinematic brand worldbuilding.',
        'email': 'dispatch@ogmedia.agency',
        'sameAs': [
          'https://instagram.com/theog.media?exln=ejhiYWt3OXp4cTR5',
          'https://www.linkedin.com/company/the-og-media/',
          'https://x.com',
          'https://youtube.com'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'dispatch@ogmedia.agency',
          'contactType': 'client inquiry and creative partnerships'
        },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'OG Media Creative Protocols & Services',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Influencer Marketing',
                'url': 'https://ogmedia.agency/ogmedia/service/influencer-marketing'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Meme Marketing',
                'url': 'https://ogmedia.agency/ogmedia/service/meme-marketing'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Meta Ads Management',
                'url': 'https://ogmedia.agency/ogmedia/service/meta-ads'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Premium Brand Positioning',
                'url': 'https://ogmedia.agency/ogmedia/service/premium-brands'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Scale Stage Growth Systems',
                'url': 'https://ogmedia.agency/ogmedia/service/scale-stage'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Website & App Design',
                'url': 'https://ogmedia.agency/ogmedia/service/website-app-design'
              }
            }
          ]
        },
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
        'url': 'https://ogmedia.agency/ogmedia/',
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
