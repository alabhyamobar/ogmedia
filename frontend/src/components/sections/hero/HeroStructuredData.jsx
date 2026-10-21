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
        '@type': ['MarketingAgency', 'ProfessionalService', 'Organization'],
        '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization',
        'name': 'OG Media',
        'alternateName': [
          'ogmedia',
          'OGMedia',
          'og media',
          'The OG Media',
          'OG Media Agency',
          'OG Media Digital Marketing Agency',
          'OG Media Premium Digital Marketing Agency'
        ],
        'url': 'https://ogmedia-theta.vercel.app/ogmedia/',
        'logo': {
          '@type': 'ImageObject',
          '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#logo',
          'url': 'https://ogmedia-theta.vercel.app/ogmedia/assets/og_logo.webp',
          'contentUrl': 'https://ogmedia-theta.vercel.app/ogmedia/assets/og_logo.webp',
          'caption': 'OG Media Logo'
        },
        'image': 'https://ogmedia-theta.vercel.app/ogmedia/assets/hero_city.webp',
        'slogan': 'Premium Digital Marketing & Performance Growth',
        'description': 'OG Media (ogmedia) is a premium digital marketing agency providing high-impact creator partnerships, viral meme marketing, Meta ads management, brand identity design, scale-stage business growth, and high-performance website and app development.',
        'email': 'dispatch@ogmedia.agency',
        'priceRange': '$$$',
        'sameAs': [
          'https://instagram.com/theog.media?exln=ejhiYWt3OXp4cTR5',
          'https://www.linkedin.com/company/the-og-media/',
          'https://x.com',
          'https://youtube.com'
        ],
        'contactPoint': {
          '@type': 'ContactPoint',
          'email': 'dispatch@ogmedia.agency',
          'contactType': 'Client Partnerships and Marketing Inquiries',
          'availableLanguage': ['English', 'Hindi']
        },
        'areaServed': {
          '@type': 'AdministrativeArea',
          'name': 'Worldwide'
        },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'OG Media Premium Digital Marketing Services',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/influencer-marketing',
                'name': 'Influencer Marketing',
                'serviceType': 'Creator Partnerships',
                'description': 'We connect your brand with creators your customers already trust, helping you reach new audiences and turn attention into sales across TikTok, Instagram Reels, and YouTube Shorts.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/influencer-marketing',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/meme-marketing',
                'name': 'Meme Marketing',
                'serviceType': 'Viral Content & Culture',
                'description': 'We create funny, relatable content that people actually want to share, helping your brand reach more people without feeling like another advertisement.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/meme-marketing',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/meta-ads',
                'name': 'Meta Ads Management',
                'serviceType': 'Targeted Ads & Paid Acquisition',
                'description': 'We create and manage targeted ads that put your business in front of the right people and help turn your advertising budget into real sales on Instagram and Facebook.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/meta-ads',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/premium-brands',
                'name': 'Premium Brands',
                'serviceType': 'Brand Design & Visual Identity',
                'description': 'We create polished branding, product visuals, and digital designs that make your business look professional, memorable, and worth choosing.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/premium-brands',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/scale-stage',
                'name': 'Scale Stage',
                'serviceType': 'Fast Business Growth',
                'description': 'Once your business is working, we help you reach more customers, enter new markets, and build systems that keep your growth moving.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/scale-stage',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                '@id': 'https://ogmedia-theta.vercel.app/ogmedia/service/website-app-design',
                'name': 'Website & App Design',
                'serviceType': 'High-Performance UI/UX Design',
                'description': 'Beautiful, fast, and easy-to-use websites and apps designed to make a strong first impression and turn visitors into customers.',
                'url': 'https://ogmedia-theta.vercel.app/ogmedia/service/website-app-design',
                'provider': { '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization' }
              }
            }
          ]
        },
        'knowsAbout': [
          'Digital Marketing',
          'Influencer Marketing',
          'Creator Partnerships',
          'Meme Marketing',
          'Viral Social Campaigns',
          'Meta Ads Management',
          'Paid Social Advertising',
          'Brand Identity Design',
          'Conversion Rate Optimization',
          'Web and Mobile App Development'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#website',
        'url': 'https://ogmedia-theta.vercel.app/ogmedia/',
        'name': 'OG Media',
        'alternateName': [
          'ogmedia',
          'OGMedia',
          'og media',
          'The OG Media',
          'OG Media Agency',
          'OG Media Premium Digital Marketing Agency'
        ],
        'description': 'OG Media (ogmedia) is a premium digital marketing agency providing high-impact creator partnerships, viral meme marketing, Meta ads management, brand identity design, scale-stage business growth, and high-performance website and app development.',
        'publisher': {
          '@id': 'https://ogmedia-theta.vercel.app/ogmedia/#organization'
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
