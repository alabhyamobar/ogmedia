import { v4 as uuidv4 } from 'uuid';
import { connectDB, disconnectDB } from '../config/db.js';
import { getRedisClient, closeRedis, isRedisHealthy } from '../config/redis.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES, SERVICES, LEAD_STATUS, AUDIT_ACTIONS } from '../constants/index.js';
import { invalidateCachePattern } from '../utils/cache.js';
import 'dotenv/config';
import mongoose from 'mongoose';

async function seed() {
  console.log('\n======================================================');
  console.log('       OG MEDIA CRM - DATABASE RESET & SEEDING        ');
  console.log('======================================================\n');

  await connectDB();
  const redis = getRedisClient();

  // 1. Drop Database & Clear Redis
  console.log('1. Purging existing MongoDB database & Redis cache...');
  await mongoose.connection.db.dropDatabase();
  console.log('   ✓ MongoDB database dropped.');

  if (redis && (await isRedisHealthy())) {
    try {
      await redis.flushdb();
      console.log('   ✓ Redis buffer streams & deduplication keys cleared.');
    } catch (err) {
      console.warn('   ! Redis flush warning:', err.message);
    }
  } else {
    console.log('   ! Redis is offline or not configured. Skipped Redis cache flush.');
  }

  // Clear in-memory / redis pattern cache
  await invalidateCachePattern('analytics:*');

  // 2. Create Administrator Account
  console.log('\n2. Enrolling Executive Administrator & Developer...');
  const adminPasswordHash = await User.hashPassword('AdminPass2026!@');
  const admin = await User.create({
    name: 'Agency Administrator',
    username: 'admin',
    email: 'admin@ogmedia.agency',
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    expertise: Object.values(SERVICES),
    status: 'ACTIVE',
    mustChangePassword: false,
    lastLoginAt: new Date(Date.now() - 3600 * 1000 * 2)
  });

  const devPasswordHash = await User.hashPassword('DevPass2026!@');
  await User.create({
    name: 'Lead System Developer',
    username: 'developer',
    email: 'developer@ogmedia.agency',
    passwordHash: devPasswordHash,
    role: ROLES.DEVELOPER,
    expertise: Object.values(SERVICES),
    status: 'ACTIVE',
    mustChangePassword: false,
    lastLoginAt: new Date()
  });
  console.log('   ✓ Administrator created: @admin / AdminPass2026!@ [Audit Trail & System Config Revoked]');
  console.log('   ✓ Developer created:     @developer / DevPass2026!@ [Full Master CRM Clearance, System Debug & Audit Trail]');

  // 3. Create Team Roster (Specialized Domain Agents)
  console.log('\n3. Enrolling Specialized Domain Agents...');
  const agentPasswordHash = await User.hashPassword('AgentPass2026!@');

  const agentsData = [
    {
      name: 'Maya Lin',
      username: 'maya.ads',
      email: 'maya@ogmedia.agency',
      role: ROLES.EMPLOYEE,
      expertise: [SERVICES.META_ADS, SERVICES.GOOGLE_ADS]
    },
    {
      name: 'Devon Vance',
      username: 'devon.code',
      email: 'devon@ogmedia.agency',
      role: ROLES.EMPLOYEE,
      expertise: [SERVICES.WEB_DEVELOPMENT]
    },
    {
      name: 'Aria Sterling',
      username: 'aria.brand',
      email: 'aria@ogmedia.agency',
      role: ROLES.EMPLOYEE,
      expertise: [SERVICES.GRAPHIC_DESIGN, SERVICES.CONTENT_MARKETING]
    },
    {
      name: 'Kai Tanaka',
      username: 'kai.seo',
      email: 'kai@ogmedia.agency',
      role: ROLES.EMPLOYEE,
      expertise: [SERVICES.SEO, SERVICES.GENERAL]
    },
    {
      name: 'Chloe Bennett',
      username: 'chloe.social',
      email: 'chloe@ogmedia.agency',
      role: ROLES.EMPLOYEE,
      expertise: [SERVICES.SOCIAL_MEDIA, SERVICES.CONTENT_MARKETING]
    }
  ];

  const createdAgents = [];
  for (const a of agentsData) {
    const agent = await User.create({
      ...a,
      passwordHash: agentPasswordHash,
      status: 'ACTIVE',
      mustChangePassword: false,
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3))
    });
    createdAgents.push(agent);
    console.log(`   ✓ Agent @${agent.username} [${agent.expertise.join(', ')}]`);
  }

  // Helper to find agent matching service
  function getAgentForService(service) {
    const matches = createdAgents.filter((a) => a.expertise.includes(service));
    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * matches.length)];
    }
    return createdAgents[0];
  }

  // 4. Seed Diverse Inquiries across all 8 Services and Statuses (130+ Versatile Entries)
  console.log('\n4. Ingesting Multi-Domain Production Inquiries (> 100 entries)...');

  const now = Date.now();
  const DAY = 86400000;

  const rawLeads = [
    // ==========================================
    // 1. META ADS & PAID MEDIA (18 Leads)
    // ==========================================
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Sebastian Cruz',
      company: 'Velvet Horizon Luxury Apparel',
      email: 'cruz@velvethorizon.it',
      phone: '+39 02 8945 7712',
      message: 'Scaling our European DTC luxury silk line to US markets. Current ROAS plateaued at 2.4x on Meta with $80k/mo spend. Need high-velocity creative testing protocol.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Valerie Dupont',
      company: 'NeoGlow Skincare Tech',
      email: 'valerie@neoglow.paris',
      phone: '+33 1 42 68 55 00',
      message: 'Engineered an FDA-cleared LED peptide therapy mask. Looking for full-funnel Meta Ads media buying, lookalike refinement, and TikTok cross-attribution.',
      daysAgo: 2
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Lucas Thorne',
      company: 'ChronoPulse High-End Horology',
      email: 'l.thorne@chronopulse.ch',
      phone: '+41 22 730 4488',
      message: 'Boutique Swiss mechanical watchmaker. Seeking qualified high-net-worth customer acquisition with $45,000 monthly ad allocation on Meta platforms.',
      daysAgo: 4
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Oliver Vance',
      company: 'Aura Sound Labs',
      email: 'oliver@aurasound.io',
      phone: '+1 (415) 890-2341',
      message: 'Launching lossless spatial audio studio monitors. Seeking aggressive 6-figure monthly Meta campaigns targeted at audio producers and audiophiles.',
      daysAgo: 5
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Marlo Santos',
      company: 'Veloce Electric Bikes',
      email: 'marlo@veloce-ebikes.com',
      phone: '+1 (310) 554-9021',
      message: 'High-performance carbon commuter e-bikes. Finalizing contract terms for $60k/month Meta ad spend with performance-based bonus tiers.',
      daysAgo: 6
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Camila Reyes',
      company: 'Solaria Energy Drink',
      email: 'camila@solariadrinks.com',
      phone: '+1 (305) 774-9012',
      message: 'National retail launch in Whole Foods & Target. Need high-converting Meta UGC video campaigns driving local store velocity and DTC subscription kits.',
      daysAgo: 3
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Hannah Brooks',
      company: 'Petite Joie Organic Baby Wear',
      email: 'hannah@petitejoie.co',
      phone: '+1 (512) 690-3341',
      message: 'GOTS-certified organic childrenswear. Scaling from $20k to $100k/mo ad spend. Need dynamic product catalog ads and mom creator whitelisting.',
      daysAgo: 8,
      unassigned: true
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Julian Mercer',
      company: 'Aether Mattresses',
      email: 'julian@aethersleep.com',
      phone: '+1 (646) 381-9920',
      message: 'Next-gen thermoregulated sleep systems. Need full Meta funnel revamp targeting young professionals with chronic sleep latency.',
      daysAgo: 12
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Freja Lindqvist',
      company: 'Nordic Clean Fragrance',
      email: 'freja@nordicclean.se',
      phone: '+46 8 505 23 100',
      message: 'Zero-toxin perfumes sustainably extracted in Scandinavia. Proposal delivered for Meta international localization across DACH and US.',
      daysAgo: 16
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Mateo Rossi',
      company: 'Caffè Vergnano Import',
      email: 'm.rossi@vergnanousa.com',
      phone: '+1 (718) 420-9110',
      message: 'Artisanal espresso subscriptions for boutique offices. Retainer finalized at $8,500/mo management fee + 12% ad spend share.',
      daysAgo: 21
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Darius Vance',
      company: 'Vanguard Tactical Wear',
      email: 'darius@vanguardgear.com',
      phone: '+1 (480) 771-4402',
      message: 'Law enforcement and outdoor apparel. Looking to test Meta Advantage+ shopping campaigns with video testimonial overlays.',
      daysAgo: 26
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.LOST,
      name: 'Chloe Dubois',
      company: 'Lumière Candles Co.',
      email: 'chloe@lumierecandleshop.com',
      phone: '+1 (617) 502-3391',
      message: 'Handcrafted soy candles. Budget was too modest for minimum $5k ad spend threshold.',
      daysAgo: 34
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Stefan Koenig',
      company: 'Stuttgart Precision Eyewear',
      email: 's.koenig@koenig-optik.de',
      phone: '+49 711 8933 210',
      message: '3D printed titanium spectacles. Signed 6-month growth retainer for Meta creative sprint and localized EU funnels.',
      daysAgo: 42
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Ananya Sharma',
      company: 'Vedica Ayurveda Wellness',
      email: 'ananya@vedicaorganics.in',
      phone: '+91 98201 44552',
      message: 'Direct-to-consumer adaptogen powders. Seeking US market entry with $30k test budget on Instagram Reels ads.',
      daysAgo: 50
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Liam O’Connor',
      company: 'Kinsale Heritage Knitwear',
      email: 'liam@kinsaleknitwear.ie',
      phone: '+353 21 477 2100',
      message: 'Traditional Irish merino wool sweaters. Converted retainer for Q4 holiday peak media buying campaign.',
      daysAgo: 61
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.LOST,
      name: 'Tanya Petrova',
      company: 'Verve Activewear',
      email: 'tanya@verveactive.co.uk',
      phone: '+44 20 7946 0912',
      message: 'Gymwear brand seeking immediate ROAS 5x guarantee. Declined due to unviable short-term guarantee constraints.',
      daysAgo: 70
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Gabriel Morales',
      company: 'Alteza Agave Spirits',
      email: 'gabriel@altezaagave.com',
      phone: '+1 (214) 890-4112',
      message: 'Ultra-premium additive-free sipping tequila. Converted 12-month retainer for age-gated compliant Meta paid media.',
      daysAgo: 78
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Zane Gallagher',
      company: 'Apex Overland Rigs',
      email: 'zane@apexoverland.com',
      phone: '+1 (303) 892-1144',
      message: 'Off-road vehicle accessories and roof tents. Initial audit call conducted for Instagram carousel re-engagement.',
      daysAgo: 85
    },

    // ==========================================
    // 2. GOOGLE ADS & PPC (18 Leads)
    // ==========================================
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Elena Rostova',
      company: 'CyberShield Zero-Trust Cloud',
      email: 'elena@cybershield.cloud',
      phone: '+1 (206) 554-1189',
      message: 'B2B enterprise cybersecurity platform. Current Google Search CPL is over $380 for high-intent keywords like soc2 compliance automation. Target is sub-$160.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Harrison Sterling',
      company: 'Sterling & Croft Private Wealth',
      email: 'h.sterling@sterlingcroft.co.uk',
      phone: '+44 20 7946 0882',
      message: 'Mayfair family office advisory firm. Require hyper-targeted Google Search and Performance Max campaigns targeting high-net-worth individuals and corporate exits.',
      daysAgo: 2
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Dr. Michael Chen',
      company: 'Apex Regenerative Orthopedics',
      email: 'mchen@apexstemcells.com',
      phone: '+1 (858) 490-1200',
      message: 'Private clinics in La Jolla and Beverly Hills. High-value search terms for knee and spinal stem cell therapy with $35,000 monthly PPC budget.',
      daysAgo: 3
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Beatrice Fontaine',
      company: 'Geneva Private Aviation Charter',
      email: 'b.fontaine@genevajets.ch',
      phone: '+41 22 819 0044',
      message: 'Empty leg flights and corporate jet charters across Europe and Dubai. Detailed audit and keyword tiering proposal sent.',
      daysAgo: 5
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Trevor Belmont',
      company: 'Belmont Commercial Real Estate',
      email: 'trevor@belmontcre.com',
      phone: '+1 (312) 880-9421',
      message: 'Tenant representation for industrial logistics parks in Texas and Midwest. Negotiating contract SLA on weekly negative keyword reviews.',
      daysAgo: 6
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Siddharth Patel',
      company: 'OmniLegal IP & Patent Partners',
      email: 'spatel@omnilegalgroup.com',
      phone: '+1 (213) 441-8930',
      message: 'Patent litigation and trademark prosecution. Retainer converted at $12,000/month for national Google Search intent capture.',
      daysAgo: 4
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Kirsten Dahl',
      company: 'Copenhagen Clean Tech Heat Pumps',
      email: 'kirsten@dahlenergy.dk',
      phone: '+45 33 12 44 90',
      message: 'Industrial heat pump systems for Nordic warehouses. Seeking Google Search PPC management targeting corporate facility directors.',
      daysAgo: 9,
      unassigned: true
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Arthur Pendelton',
      company: 'Pendelton Rare Coin & Bullion',
      email: 'arthur@pendeltonbullion.com',
      phone: '+1 (212) 779-0122',
      message: 'Gold IRA rollover lead generation. High-intent search campaigns with $50k/month ad spend and strict compliance protocols.',
      daysAgo: 13
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Miriam Al-Hassan',
      company: 'Gulf Horizon Maritime Logistics',
      email: 'miriam@gulfhorizon.ae',
      phone: '+971 4 390 1122',
      message: 'Container freight and freight forwarding via Dubai Ports. Custom bidding strategy proposal submitted.',
      daysAgo: 18
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Rory Campbell',
      company: 'Loch Lomond Scotch Distillery',
      email: 'rcampbell@highlandcasks.scot',
      phone: '+44 141 552 9011',
      message: 'Cask investment program for luxury investors. Converted $9,500/mo retainer for UK and international Search campaigns.',
      daysAgo: 24
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Nicole Vance',
      company: 'Clearwater Forensic Accounting',
      email: 'nicole@clearwaterforensics.com',
      phone: '+1 (404) 890-3321',
      message: 'Fraud investigation and litigation support. Discovery call initiated regarding high-intent legal defense search terms.',
      daysAgo: 31
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.LOST,
      name: 'Barry Goldberg',
      company: 'Goldberg Auto Glass Repair',
      email: 'barry@autoglasspros.net',
      phone: '+1 (702) 441-9922',
      message: 'Local mobile windshield replacement. Local budget capped at $800/mo; below enterprise threshold.',
      daysAgo: 39
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Isabelle Mercier',
      company: 'Monaco Yacht Brokerage',
      email: 'i.mercier@monacoyachts.mc',
      phone: '+377 97 97 10 00',
      message: 'Superyacht sales and charter listings. Converted €14,000/mo retainer with global multilingual Google Search targeting.',
      daysAgo: 48
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Felix Brandt',
      company: 'Brandt Automation Robotics',
      email: 'f.brandt@brandt-robotik.de',
      phone: '+49 89 244 8900',
      message: 'Collaborative robot arms for automotive machining lines. Qualified with $25k/mo budget for Europe Search.',
      daysAgo: 57
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Victoria Song',
      company: 'OmniDent Digital Aligners',
      email: 'vsong@omnidentlabs.com',
      phone: '+1 (650) 991-3002',
      message: 'Direct-to-consumer orthodontic clear aligners. Signed conversion retainer with strict CPA target of $75/lead.',
      daysAgo: 66
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.LOST,
      name: 'Wyatt Keller',
      company: 'Keller Solar Roofing',
      email: 'wyatt@kellersolar.org',
      phone: '+1 (602) 332-9011',
      message: 'Residential solar installation. Paused bidding due to state net-metering regulatory changes.',
      daysAgo: 73
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Julianne Ward',
      company: 'Prestige Executive Search',
      email: 'jward@prestige-search.com',
      phone: '+1 (212) 554-9190',
      message: 'C-suite executive headhunting for Fortune 500 fintech. Retainer converted for executive placement intent campaigns.',
      daysAgo: 80
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Tariq Mansoor',
      company: 'Al-Noor Medical Tourism',
      email: 'tariq@alnoorhealth.qa',
      phone: '+974 4499 1234',
      message: 'Elective cosmetic and orthopedic travel to Qatar. Initial outreach initiated for regional GCC Google Ads.',
      daysAgo: 87
    },

    // ==========================================
    // 3. SEO & ORGANIC GROWTH (17 Leads)
    // ==========================================
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.NEW,
      name: 'Dr. Aris Thorne',
      company: 'Aetheria Longevity & Biohacking',
      email: 'aris@aetherialongevity.com',
      phone: '+1 (415) 609-1234',
      message: 'Preventative medicine clinic in San Francisco. Need complete technical SEO audit, entity clustering, and high-DA backlink sprint for competitive longevity keywords.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONTACTED,
      name: 'Camilla Berggren',
      company: 'Nordic Clean SaaS Solutions',
      email: 'camilla@nordicsaas.se',
      phone: '+46 8 123 4567',
      message: 'B2B carbon accounting software. Seeking organic pipeline growth across EU countries with localized programmatic SEO content.',
      daysAgo: 2
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Jonathan Drake',
      company: 'Kryptos Vault Financial Security',
      email: 'jdrake@kryptosvault.com',
      phone: '+1 (212) 555-8901',
      message: 'Institutional digital asset custody platform. Need to dominate organic search results for institutional crypto compliance and custody.',
      daysAgo: 4
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Soren Nielsen',
      company: 'Skagerrak Modular Architectural',
      email: 'soren@skagerrak.dk',
      phone: '+45 40 12 88 99',
      message: 'Sustainable prefabricated timber homes across Northern Europe. Comprehensive 12-month programmatic SEO and technical architecture proposal delivered.',
      daysAgo: 6
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Maya Goldstein',
      company: 'Tel Aviv Cyber Intelligence Group',
      email: 'maya@tacig-intel.co.il',
      phone: '+972 3 609 8812',
      message: 'Threat intelligence feed provider. Finalizing keyword exclusivity scope and monthly white-hat digital PR deliverables.',
      daysAgo: 7
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Marco Bellini',
      company: 'Bellini Olive Estates',
      email: 'marco@belliniolive.it',
      phone: '+39 055 234 9876',
      message: 'Heritage extra virgin olive oil producer in Tuscany. Converted $7,000/month 12-month organic search dominance retainer.',
      daysAgo: 5
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.NEW,
      name: 'Gemma Davies',
      company: 'Cotswolds Luxury Cottages',
      email: 'gemma@cotswoldsluxury.co.uk',
      phone: '+44 1608 654321',
      message: 'Exclusive holiday rental portfolio in the UK. Seeking local pack SEO optimization and high-intent vacation rental ranking.',
      daysAgo: 11,
      unassigned: true
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Keiichi Sato',
      company: 'Kyoto Artisan Ceramics Export',
      email: 'ksato@kyotoceramics.jp',
      phone: '+81 75 561 2233',
      message: 'Handmade Japanese tea ware and pottery. English-language organic search optimization for luxury international interior decorators.',
      daysAgo: 17
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Lucia Alvarez',
      company: 'Iberian Solar Park Engineers',
      email: 'lucia@iberiansolar.es',
      phone: '+34 91 543 2100',
      message: 'Utility-scale photovoltaic developers in Spain and Portugal. Proposal delivered for organic rankings on renewable PPA keywords.',
      daysAgo: 23
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Darren Vance',
      company: 'ProForm Ergonomics',
      email: 'darren@proformchairs.com',
      phone: '+1 (312) 670-4491',
      message: 'Executive ergonomic mesh seating. Signed annual SEO growth retainer at $8,000/mo including Core Web Vitals optimization.',
      daysAgo: 29
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONTACTED,
      name: 'Astrid Lind',
      company: 'Stockholm Biofuel Logistics',
      email: 'astrid@stockholmbio.se',
      phone: '+46 8 610 9900',
      message: 'Sustainable aviation fuel distribution. Discovery call held regarding technical content clustering for airline procurement teams.',
      daysAgo: 38
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.LOST,
      name: 'Owen Gallagher',
      company: 'Galway Surf School',
      email: 'owen@galwaysurf.ie',
      phone: '+353 91 582 345',
      message: 'Local surfing lessons and rental. Budget insufficient for national SEO retainer.',
      daysAgo: 45
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Hiroshi Tanaka',
      company: 'Ginza Knife Workshop',
      email: 'h.tanaka@ginzaknives.com',
      phone: '+81 3 3567 8901',
      message: 'Hand-forged Japanese chef knives. Retainer converted to rank #1 globally for damascus santoku and gyuto culinary search terms.',
      daysAgo: 54
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Evelyn St. Claire',
      company: 'Geneva Horological Archive',
      email: 'evelyn@horologyarchive.ch',
      phone: '+41 22 310 9988',
      message: 'Vintage watch certification and provenance records. Scope verified for historical reference encyclopedia SEO strategy.',
      daysAgo: 63
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Nathaniel Cole',
      company: 'OmniData Compliance Cloud',
      email: 'ncole@omnidatacloud.com',
      phone: '+1 (415) 789-0123',
      message: 'Automated GDPR and HIPAA compliance scanning. Converted $11,000/mo enterprise content SEO engine contract.',
      daysAgo: 72
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.LOST,
      name: 'Roxanne Dupont',
      company: 'Boutique Vintage Lyon',
      email: 'roxanne@vintagelyon.fr',
      phone: '+33 4 78 92 11 00',
      message: 'Secondhand luxury clothing shop. Needed only a one-time Google Maps pin setup.',
      daysAgo: 79
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Kallum Fraser',
      company: 'Speyside Single Malt Heritage',
      email: 'kallum@speysideheritage.co.uk',
      phone: '+44 1340 820123',
      message: 'Rare whisky collector syndicate. Converted $9,000/mo organic discovery campaign.',
      daysAgo: 86
    },

    // ==========================================
    // 4. 3D WEB & APP DESIGN (18 Leads)
    // ==========================================
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.NEW,
      name: 'Damon Vance',
      company: 'Aether Robotics & Autonomous Drones',
      email: 'damon@aetherrobotics.tech',
      phone: '+1 (415) 992-0192',
      message: 'Developing commercial delivery quadcopters. Need an ultra-premium WebGL interactive product visualizer and full marketing website in Three.js and Next.js.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONTACTED,
      name: 'Clara Oswald',
      company: 'Chronos Watches Atelier',
      email: 'clara@chronosatelier.co.uk',
      phone: '+44 20 8912 3344',
      message: 'Custom bespoke luxury timepieces. Looking for an interactive 3D watch configurator with real-time dial engraving preview.',
      daysAgo: 2
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Matteo Vivaldi',
      company: 'Vivaldi Hypercars SpA',
      email: 'm.vivaldi@vivaldihypercars.it',
      phone: '+39 059 891 2200',
      message: 'Limited edition electric hypercar project in Modena. Budget approved at $95,000 for custom 3D web experience, shaders, and booking portal.',
      daysAgo: 3
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Siddharth Rao',
      company: 'Kryptos DeFi Liquidity Protocol',
      email: 'siddharth@kryptosdefi.io',
      phone: '+65 6789 0123',
      message: 'Institutional staking interface with real-time WebGL financial graph animations and audited Web3 smart contract connection.',
      daysAgo: 4
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Frederik Lind',
      company: 'Kobenhavn Design Møbler',
      email: 'frederik@kobenhavnmobler.dk',
      phone: '+45 35 22 99 00',
      message: 'Iconic Danish modernist furniture line. Negotiating production milestones for augmented reality AR Quick Look integration.',
      daysAgo: 5
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Amara Okafor',
      company: 'Nura Health Wearables',
      email: 'amara@nurahealth.io',
      phone: '+1 (617) 443-8901',
      message: 'Continuous biochemical glucose monitoring ring. Signed contract for $65,000 3D interactive marketing web platform.',
      daysAgo: 2
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.NEW,
      name: 'Bjorn Halvorsen',
      company: 'Fjord Expedition Yachts',
      email: 'bjorn@fjordexpeditions.no',
      phone: '+47 22 34 56 78',
      message: 'Arctic exploration luxury cruise bookings. Need interactive 3D deck plans and cabin selector.',
      daysAgo: 9,
      unassigned: true
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Chloe Monet',
      company: 'Studio Luminary Architectural Lighting',
      email: 'chloe@luminarystudio.fr',
      phone: '+33 1 45 67 89 00',
      message: 'Architectural lighting simulations. Scope defined for ray-marched browser lighting interactive demo.',
      daysAgo: 14
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Julian Hayes',
      company: 'Apex Sound Modular Synthesizers',
      email: 'jhayes@apexsound.de',
      phone: '+49 30 8912 3456',
      message: 'Eurorack synthesizer modules with interactive patch-cable routing in WebGL. Final proposal sent.',
      daysAgo: 20
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Genevieve Dupré',
      company: 'Atelier Dupré Haute Joaillerie',
      email: 'genevieve@duprejoaillerie.ch',
      phone: '+41 22 849 5500',
      message: 'Place Vendôme diamond jewelry configurator. Converted CHF 85,000 custom 3D web experience contract.',
      daysAgo: 27
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONTACTED,
      name: 'Tate McAllister',
      company: 'Veloce Carbon Racing',
      email: 'tate@velocemotorsport.co.uk',
      phone: '+44 1327 850123',
      message: 'Formula race car composite parts catalog with 3D model rotation.',
      daysAgo: 35
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.LOST,
      name: 'Enzo Ferrari Jr.',
      company: 'Bella Pasta Bar Local',
      email: 'enzo@bellapasta.nyc',
      phone: '+1 (212) 334-9988',
      message: 'Neighborhood Italian restaurant looking for simple Wix menu. Out of scope for custom 3D web build.',
      daysAgo: 43
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Soren Kirkegaard',
      company: 'Nordic Audio Precision Speakers',
      email: 'soren@nordicaudio.dk',
      phone: '+45 86 12 34 56',
      message: 'Wireless electro-acoustic hi-fi system. Converted €50,000 interactive 3D product launch website.',
      daysAgo: 52
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Priya Narang',
      company: 'Vayu Electric eVTOL Flight',
      email: 'priya@vayuaero.com',
      phone: '+1 (408) 555-0199',
      message: 'Electric vertical takeoff urban flight concept. Need full 3D interactive flight experience in browser.',
      daysAgo: 60
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Alistair MacLeod',
      company: 'Hebrides Distillers Club',
      email: 'alistair@hebridesclub.com',
      phone: '+44 1851 700123',
      message: 'Private island whiskey membership portal with 3D map exploration. Signed $48,000 development package.',
      daysAgo: 69
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.LOST,
      name: 'Carlos Santana',
      company: 'Taco Libre Food Truck',
      email: 'carlos@tacolibre.la',
      phone: '+1 (323) 555-0144',
      message: 'Food truck locator. Client selected off-the-shelf Squarespace template.',
      daysAgo: 77
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Sergei Voronov',
      company: 'Zenith Orbital Space Tech',
      email: 'sergei@zenithorbital.com',
      phone: '+1 (202) 555-0177',
      message: 'Commercial satellite payload deployment portal. Signed $110,000 3D telemetry tracking web app contract.',
      daysAgo: 83
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONTACTED,
      name: 'Yuki Takahashi',
      company: 'NeoTokyo Esports Arena',
      email: 'yuki@neotokyoarena.jp',
      phone: '+81 3 5555 0122',
      message: 'Virtual gaming stadium seat selector in 3D. Discovery consultation call logged.',
      daysAgo: 88
    },

    // ==========================================
    // 5. CREATORS & INFLUENCERS (17 Leads)
    // ==========================================
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.NEW,
      name: 'Zoe Laurent',
      company: 'Maison Éthique Sustainable Perfumery',
      email: 'zoe@maisonethique.fr',
      phone: '+33 1 42 33 44 55',
      message: 'Zero-waste clean perfumes. Need a roster of 40 tier-1 micro-influencers on TikTok and Instagram Reels for autumn European release.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONTACTED,
      name: 'Jaxson Pierce',
      company: 'GhostVolt Energy Gummies',
      email: 'jaxson@ghostvolt.com',
      phone: '+1 (310) 902-1244',
      message: 'Caffeine and nootropic gummies for gamers and gym creators. Seeking full influencer whitelisting and affiliate commission management.',
      daysAgo: 2
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Scarlett Johansson-Lee',
      company: 'K-Beauty Glass Skin Rituals',
      email: 'scarlett@glassskinrituals.kr',
      phone: '+82 2 3456 7890',
      message: 'Top Seoul beauty formulation brand entering Sephora US. Budget allocated at $60k/month for creator gifting, TikTok UGC, and creator Spark ads.',
      daysAgo: 3
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Maximilian Vance',
      company: 'Veloce Cycling Apparel Collective',
      email: 'max@velocecollective.cc',
      phone: '+44 20 7123 4567',
      message: 'Gravel and road bike racing kits. Creator ambassadorship proposal delivered with monthly content deliverables and Strava club integration.',
      daysAgo: 5
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Aria Montanari',
      company: 'Milano Aperitivo Spritz Co.',
      email: 'aria@milanoaperitivo.it',
      phone: '+39 02 7654 3210',
      message: 'Ready-to-drink organic spritz for European rooftop venues. Negotiating contract terms for 25 lifestyle creators across Milan, Paris, and London.',
      daysAgo: 6
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Cody Campbell',
      company: 'RawForm Strength Equipment',
      email: 'cody@rawformstrength.com',
      phone: '+1 (512) 890-1234',
      message: 'Commercial powerlifting bars and calibrated plates. Converted $14,000/mo athlete sponsorship and creator management retainer.',
      daysAgo: 3
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.NEW,
      name: 'Talia Rose',
      company: 'Botanica Herbal Tinctures',
      email: 'talia@botanicawellness.com',
      phone: '+1 (503) 555-0188',
      message: 'Adaptogenic mushroom extracts and herbal remedies. Need authentic holistic health creators for TikTok Shop creator affiliates.',
      daysAgo: 10,
      unassigned: true
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Liam Vance',
      company: 'Apex Sound Studio Headphones',
      email: 'liam@apexheadphones.com',
      phone: '+1 (212) 555-0133',
      message: 'Wireless ANC studio headphones. Verified $45,000 creator activation budget targeting music producer YouTubers.',
      daysAgo: 15
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Ines Santos',
      company: 'Lisboa Surf & Solar Wear',
      email: 'ines@lisboasurf.pt',
      phone: '+351 21 345 6789',
      message: 'Recycled ocean plastic wetsuits and UV swim tees. Proposal sent for 15 European surf creators.',
      daysAgo: 21
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Finnegan O’Shea',
      company: 'Dublin Stout Apparel Co.',
      email: 'finnegan@dublinstout.ie',
      phone: '+353 1 496 1234',
      message: 'Irish pub lifestyle vintage apparel. Signed 6-month creator management retainer at $8,500/month.',
      daysAgo: 28
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONTACTED,
      name: 'Kiki Van Der Bilt',
      company: 'Amsterdam Flow Yoga Studios',
      email: 'kiki@flowyoga.nl',
      phone: '+31 20 624 1234',
      message: 'High-end yoga retreats across Ibiza and Bali. Reached out regarding wellness influencer ambassador roster.',
      daysAgo: 36
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.LOST,
      name: 'Randy Marsh',
      company: 'Tegridy Farms Merchandise',
      email: 'randy@tegridy.co',
      phone: '+1 (719) 555-0144',
      message: 'Custom comedy novelty t-shirts. Creator budget unfeasible for target reach.',
      daysAgo: 44
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Mia Söderberg',
      company: 'Fjäll Pure Nordic Water',
      email: 'mia@fjallwater.se',
      phone: '+46 8 714 5500',
      message: 'Artesian bottled water from Lapland. Converted €12,500/mo influencer campaign across lifestyle and wellness.',
      daysAgo: 53
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Damon Sterling',
      company: 'Veloce Custom Golf Clubs',
      email: 'damon@velocegolf.com',
      phone: '+1 (480) 555-0177',
      message: 'Milled forged putters and custom wedges. Looking to sponsor YouTube golf creator tournaments.',
      daysAgo: 62
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Zara Al-Maktoum',
      company: 'Oasis Equestrian Club',
      email: 'zara@oasisequestrian.ae',
      phone: '+971 4 345 6789',
      message: 'Luxury horse riding academy and polo apparel. Signed $16,000/mo international equestrian influencer retainer.',
      daysAgo: 71
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.LOST,
      name: 'Garth Albright',
      company: 'Albright Lawn Mower Spares',
      email: 'garth@albrightspares.com',
      phone: '+1 (816) 555-0199',
      message: 'Replacement lawn mower blades. Decided influencer marketing was not applicable to wholesale industrial parts.',
      daysAgo: 81
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Camilla Valente',
      company: 'Gelato Artigianale Roma',
      email: 'camilla@gelatoroma.it',
      phone: '+39 06 6987 6543',
      message: 'Artisanal Italian gelato franchise scaling into London. Retainer converted at £10,000/mo for food creators.',
      daysAgo: 87
    },

    // ==========================================
    // 6. MEME CULTURE & VIRAL (16 Leads)
    // ==========================================
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.NEW,
      name: 'Rico Tanaka',
      company: 'Kudasai Cyberpunk Streetwear',
      email: 'rico@kudasaistreet.jp',
      phone: '+81 3 4567 8901',
      message: 'Akihabara-inspired cyberpunk apparel. Need rapid viral meme seeding on X (Twitter), TikTok, and Reddit to drive underground hype before drop 04.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONTACTED,
      name: 'Sasha Petrova',
      company: 'BoredApe Coffee Club & Web3 Hub',
      email: 'sasha@bacoffee.xyz',
      phone: '+1 (305) 555-0122',
      message: 'Web3 crypto cafe brand in Wynwood Miami. Looking to launch a viral meme campaign capitalizing on market volatility humor.',
      daysAgo: 2
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Dexter Vance',
      company: 'HODL Hot Sauce Co.',
      email: 'dexter@hodlhotsauce.com',
      phone: '+1 (512) 555-0199',
      message: 'Carolina Reaper hot sauce aimed at crypto degens and day traders. Verified $25,000 budget for humorous video sketches.',
      daysAgo: 4
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Lola Montez',
      company: 'Chaotic Good Energy Drink',
      email: 'lola@chaoticgoodenergy.com',
      phone: '+1 (415) 555-0133',
      message: 'Gamer energy drinks with unhinged social media tone of voice. Comprehensive brand persona and TikTok meme roadmap submitted.',
      daysAgo: 6
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Brody Gallagher',
      company: 'Silly Goose Hard Seltzer',
      email: 'brody@sillygooseseltzer.com',
      phone: '+1 (303) 555-0166',
      message: 'Craft seltzer with playful cartoon mascot. Negotiating terms for 60 short-form viral skits over 90 days.',
      daysAgo: 7
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONVERTED,
      name: 'Finnian Drake',
      company: 'NeoGlitch Gaming Peripherals',
      email: 'finnian@neoglitch.gg',
      phone: '+1 (206) 555-0188',
      message: 'Custom mechanical keyboards and keycaps. Converted $12,000/mo retainer for TikTok humor sketches and Discord community memes.',
      daysAgo: 4
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.NEW,
      name: 'Kira Sterling',
      company: 'CyberKittens NFT Game',
      email: 'kira@cyberkittens.io',
      phone: '+65 6555 0122',
      message: 'Telegram and Discord viral clicker game. Need viral TikTok shorts and meme templates to accelerate user signups.',
      daysAgo: 12,
      unassigned: true
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Dustin Henderson',
      company: 'RetroWave Synthwave Radio',
      email: 'dustin@retrowaveradio.com',
      phone: '+1 (404) 555-0144',
      message: '80s nostalgic music streaming platform. Budget verified for nostalgic TikTok skits and Instagram meme reels.',
      daysAgo: 19
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Astrid Olsen',
      company: 'Viking Protein Jerky',
      email: 'astrid@vikingprotein.no',
      phone: '+47 21 55 01 22',
      message: 'Air-dried Arctic beef and elk jerky. Viral outdoor gym meme strategy proposal presented.',
      daysAgo: 26
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONVERTED,
      name: 'Toby Flenderson',
      company: 'Boring Company Socks & Lounge',
      email: 'toby@boringsocks.com',
      phone: '+1 (212) 555-0166',
      message: 'Antithesis of luxury socks for programmers. Converted $9,000/mo humor marketing retainer on LinkedIn and Twitter.',
      daysAgo: 33
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONTACTED,
      name: 'Milo Jankovic',
      company: 'Belgrade Tech Meme Syndicate',
      email: 'milo@techmemes.rs',
      phone: '+381 11 555 012',
      message: 'Developer satire software merchandise. Initial call held to structure viral giveaway contest.',
      daysAgo: 41
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.LOST,
      name: 'Eugene Krabs',
      company: 'Kraby Dollar Pawn',
      email: 'eugene@krabypawn.com',
      phone: '+1 (207) 555-0199',
      message: 'Wanted viral content guaranteed to get 10 million views for $200. Declined due to unviable expectations.',
      daysAgo: 49
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONVERTED,
      name: 'Serena Van Der Woodsen',
      company: 'Gossip Reel Media App',
      email: 'serena@gossipreel.com',
      phone: '+1 (917) 555-0133',
      message: 'Gen-Z pop culture anonymous audio sharing app. Signed $15,000/mo viral TikTok organic launch contract.',
      daysAgo: 58
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Bao Nguyen',
      company: 'Boba Run Mobile Game',
      email: 'bao@bobarungame.vn',
      phone: '+84 28 5555 012',
      message: 'Casual mobile game with cute bubble tea physics. Verified $18k budget for TikTok challenge campaign.',
      daysAgo: 67
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONVERTED,
      name: 'Lars Ulrich-Larsen',
      company: 'Heavy Metal Hot Tub Co.',
      email: 'lars@heavymetaltubs.fi',
      phone: '+358 9 555 0122',
      message: 'Wood-fired sauna and hot tubs with rock aesthetic. Converted €8,500/mo Nordic meme engine contract.',
      daysAgo: 76
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.LOST,
      name: 'Barnaby Jones',
      company: 'Old Fashioned Shoe Horns',
      email: 'barnaby@shoehorns.co.uk',
      phone: '+44 113 555 012',
      message: 'Traditional shoe horns. Product lacked organic viral angles.',
      daysAgo: 84
    },

    // ==========================================
    // 7. LUXURY BRAND DIRECTION (16 Leads)
    // ==========================================
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.NEW,
      name: 'Antoine De Saint-Germain',
      company: 'Saint-Germain Joaillier Place Vendôme',
      email: 'antoine@saintgermain-paris.fr',
      phone: '+33 1 42 68 00 22',
      message: 'Centuries-old Parisian fine jewelry house. Requesting brand redesign, bespoke typography system, luxury packaging architecture, and foil stamp guidelines.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONTACTED,
      name: 'Countess Alessandra Visconti',
      company: 'Palazzo Visconti Como Olive Oil & Wine',
      email: 'a.visconti@palazzovisconti.it',
      phone: '+39 031 998 1234',
      message: 'Exclusive vintage reserva wine and extra virgin olive oil from Lake Como. Looking for luxury hand-illustrated labels and bottle seal design.',
      daysAgo: 2
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Lord Henry Sterling',
      company: 'Sterling & Mayfair Bespoke Tailors',
      email: 'h.sterling@mayfairtailors.co.uk',
      phone: '+44 20 7493 8811',
      message: 'Savile Row bespoke tailoring establishment. Scope verified for complete luxury rebranding, coat of arms modernization, and monogram crest.',
      daysAgo: 3
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Monique Laroche',
      company: 'Laroche Parfums Grasse',
      email: 'm.laroche@larocheparfums.fr',
      phone: '+33 4 93 36 00 11',
      message: 'Niche perfume atelier in Grasse. Proposal presented for custom heavy glass flacon 3D blueprints and gold-leaf embossed box packaging.',
      daysAgo: 5
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Viktor Van Der Bilt',
      company: 'Van Der Bilt Diamond Cutters Antwerp',
      email: 'viktor@vanderbilt-diamonds.be',
      phone: '+32 3 234 5678',
      message: 'Antwerp diamond exchange merchants. Negotiating contract terms for brand bible, vault packaging, and certificate of authenticity security design.',
      daysAgo: 6
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONVERTED,
      name: 'Lady Genevieve Crawford',
      company: 'Kensington Fine Art Advisory',
      email: 'genevieve@kensingtonart.co.uk',
      phone: '+44 20 7937 4400',
      message: 'Private art acquisition for billionaires. Converted £35,000 comprehensive luxury visual identity and leather-bound catalog design.',
      daysAgo: 2
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.NEW,
      name: 'Kenjiro Watanabe',
      company: 'Watanabe Ginza Ryokan & Spa',
      email: 'k.watanabe@watanaberyokan.jp',
      phone: '+81 3 3541 2233',
      message: 'Traditional ultra-luxury hot spring inn. Seeking Japanese minimalist brand identity with washi paper stationery system.',
      daysAgo: 10,
      unassigned: true
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Soraya Al-Kuwari',
      company: 'Doha Falcon & Luxury Horology',
      email: 'soraya@dohafalcon.qa',
      phone: '+974 4488 9900',
      message: 'Custom timepiece commissions for Gulf collectors. Verified $50,000 budget for identity, seal, and presentation box design.',
      daysAgo: 16
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Maximilian Von Habsburg',
      company: 'Habsburg Leather Goods Vienna',
      email: 'm.habsburg@habsburgleder.at',
      phone: '+43 1 512 3456',
      message: 'Handcrafted bridle leather briefcases and luggage. Complete luxury visual guideline proposal sent.',
      daysAgo: 22
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONVERTED,
      name: 'Christophe Morel',
      company: 'Château Morel Bordeaux Grand Cru',
      email: 'c.morel@chateaumorel.fr',
      phone: '+33 5 56 00 12 34',
      message: 'Premier Grand Cru wine estate. Converted €28,000 label redesign and centenary commemorative wood box branding.',
      daysAgo: 30
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONTACTED,
      name: 'Vivienne Westwood-Lee',
      company: 'Vivienne Silk Atelier Seoul',
      email: 'vivienne@silkatelier.kr',
      phone: '+82 2 540 1234',
      message: 'Hanbok-inspired modern silk couture. Discovery consultation held for brand wordmark and metallic garment tags.',
      daysAgo: 37
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.LOST,
      name: 'Bob Higgins',
      company: 'Bob’s Quick Print T-Shirts',
      email: 'bob@quickprintbob.com',
      phone: '+1 (513) 555-0122',
      message: 'Quick turnaround vector clipart. Client needed local $50 logo generator; luxury agency rate rejected.',
      daysAgo: 46
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONVERTED,
      name: 'Princess Sophia Romanoff',
      company: 'Romanoff Imperial Caviar Co.',
      email: 'sophia@romanoffcaviar.ch',
      phone: '+41 22 731 5566',
      message: 'Beluga caviar in mother-of-pearl vessels. Signed CHF 42,000 brand direction package.',
      daysAgo: 55
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Demetrios Papandreou',
      company: 'Aegean Maritime Yacht Charter',
      email: 'demetrios@aegeanyachts.gr',
      phone: '+30 210 987 6543',
      message: 'Sailing mega-yachts in the Cyclades. Budget qualified for luxury flag, crew uniform, and stationery identity.',
      daysAgo: 64
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONVERTED,
      name: 'Camilla D’Orsay',
      company: 'D’Orsay Cashmere St. Moritz',
      email: 'camilla@dorsaycashmere.ch',
      phone: '+41 81 833 4455',
      message: 'Mongolian pure cashmere knitwear. Retainer converted for seasonal lookbooks and packaging suites.',
      daysAgo: 73
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.LOST,
      name: 'Frankie Valli',
      company: 'Jersey Car Wash',
      email: 'frankie@jerseycarwash.com',
      phone: '+1 (201) 555-0144',
      message: 'Car wash logo. Out of agency scope.',
      daysAgo: 82
    },

    // ==========================================
    // 8. FULL STRATEGY DECK & ENTERPRISE (16 Leads)
    // ==========================================
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.NEW,
      name: 'Baroness Caroline Von Richthofen',
      company: 'Bavaria Clean Hydro Energy AG',
      email: 'caroline@bavariahydro.de',
      phone: '+49 89 2109 8765',
      message: 'European renewable green hydrogen infrastructure consortium. Seeking comprehensive omnichannel strategy, public investor roadshow presentation, PR, and web presence.',
      daysAgo: 1,
      unassigned: true
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONTACTED,
      name: 'Sir Arthur Kingsley',
      company: 'Kingsley & Crown Global Private Equity',
      email: 'a.kingsley@kingsleycrown.co.uk',
      phone: '+44 20 7900 1122',
      message: 'Managing £2.4B in European industrial logistics assets. Need full corporate brand unification, LP pitch deck overhaul, and executive visibility strategy.',
      daysAgo: 2
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Dr. Raymond Zhao',
      company: 'Nexus Gene Therapy Biopharma',
      email: 'raymond.zhao@nexusgenetherapy.com',
      phone: '+1 (617) 555-0199',
      message: 'Clinical stage CRISPR therapeutics in Cambridge, MA. Series B round completed ($85M). Need complete marketing deck, scientific animations, and medical PR.',
      daysAgo: 3
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Sultan Mansoor Al-Nahyan',
      company: 'Emirates Quantum Computing Initiative',
      email: 'mansoor@emiratesquantum.ae',
      phone: '+971 2 444 8888',
      message: 'Government-backed deep tech quantum laboratory in Abu Dhabi. Full global marketing roadmap and launch blueprint proposal presented.',
      daysAgo: 4
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Elena Constantinescu',
      company: 'Constanta Deep Sea Wind Farms',
      email: 'elena@constantawind.ro',
      phone: '+40 21 312 4455',
      message: 'Black Sea offshore wind energy concession. Finalizing $120,000 master strategy retainer and government affairs communication suite.',
      daysAgo: 6
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONVERTED,
      name: 'Julian Montgomery',
      company: 'Montgomery Aviation Defense Systems',
      email: 'j.montgomery@montgomerydefense.com',
      phone: '+1 (703) 555-0144',
      message: 'Aerospace telemetry and radar systems contractor. Signed $150,000 annual master communications and digital transformation retainer.',
      daysAgo: 3
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.NEW,
      name: 'Guillaume De Boissieu',
      company: 'Boissieu Private Cellars Fund',
      email: 'guillaume@boissieu-fund.lu',
      phone: '+352 26 12 34 56',
      message: 'Luxembourg regulated rare wine investment fund. Inquiring about complete investor outreach architecture and institutional presentation.',
      daysAgo: 11,
      unassigned: true
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Lars Thomsen',
      company: 'Nordic Battery Megafactory Group',
      email: 'lars@nordicbattery.se',
      phone: '+46 920 123 45',
      message: 'Gigafactory for solid-state EV battery cells in Northern Sweden. Scope qualified for ESG narrative, website, and institutional media relations.',
      daysAgo: 18
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Matthias Gruber',
      company: 'Zurich Autonomous Rail Logistics',
      email: 'm.gruber@zurichrail.ch',
      phone: '+41 44 211 9900',
      message: 'Driverless alpine cargo transport network. Strategic positioning proposal submitted to board of directors.',
      daysAgo: 25
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONVERTED,
      name: 'Lady Victoria Hamilton',
      company: 'Caledonian Highland Conservation Estate',
      email: 'victoria@caledonianconservation.org',
      phone: '+44 1463 234567',
      message: 'Rewilding 50,000 acres in the Scottish Highlands with carbon credits. Converted £65,000 master strategy and donor acquisition campaign.',
      daysAgo: 32
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONTACTED,
      name: 'Ignacio Ortiz',
      company: 'Patagonia Lithium Exploration',
      email: 'ignacio@patagonialithium.ar',
      phone: '+54 11 4312 8899',
      message: 'Lithium brine extraction in Salta. Discovery call logged for international mining investor deck and sustainability positioning.',
      daysAgo: 40
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.LOST,
      name: 'Grover Cleveland Jr.',
      company: 'Local Corner Laundromat Chain',
      email: 'grover@laundromatpros.com',
      phone: '+1 (330) 555-0122',
      message: 'Laundromat expansion strategy. Budget not aligned with enterprise advisory services.',
      daysAgo: 47
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONVERTED,
      name: 'Henrik Vanger',
      company: 'Vanger Forestry & Bio-Carbon Group',
      email: 'henrik@vangergroup.se',
      phone: '+46 8 555 1234',
      message: 'Sustainable timber pulp and biochemical fuels. Signed 12-month enterprise transformation contract at €18,000/month.',
      daysAgo: 56
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Fatima Al-Sabah',
      company: 'Kuwait Renewable Desalination Initiative',
      email: 'fatima@kuwaitdesal.com',
      phone: '+965 2244 5566',
      message: 'Solar-powered seawater desalination facilities. Scope verified for GCC municipal government tenders.',
      daysAgo: 65
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONVERTED,
      name: 'Sir Charles Cavendish',
      company: 'Cavendish Space Surveillance',
      email: 'charles@cavendishspace.co.uk',
      phone: '+44 1865 270000',
      message: 'Orbital debris tracking and laser telemetry. Converted £80,000 defense strategy contract.',
      daysAgo: 74
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONTACTED,
      name: 'Benoît Blanchard',
      company: 'Monaco Private Bank Holding',
      email: 'b.blanchard@monacobank.mc',
      phone: '+377 98 98 20 00',
      message: 'Independent private banking alliance. Inbound inquiry regarding complete agency pitch deck.',
      daysAgo: 84
    }
  ];

  console.log(`   Preparing to insert ${rawLeads.length} versatile leads...`);

  let insertedCount = 0;
  for (const raw of rawLeads) {
    const assignedAgent = raw.unassigned ? null : getAgentForService(raw.service);

    // Spread timestamps across the day
    const jitterHours = Math.floor(Math.random() * 20);
    const jitterMinutes = Math.floor(Math.random() * 59);
    const createdAt = new Date(now - raw.daysAgo * DAY - (jitterHours * 3600 + jitterMinutes * 60) * 1000);

    const timeline = [
      {
        event: 'LEAD_CREATED',
        performedBy: null,
        performedByName: 'Public Web Portal',
        details: `Inbound inquiry ingested via official web booking engine. Target sector: ${raw.service}.`,
        timestamp: createdAt
      }
    ];

    const notes = [];

    if (assignedAgent) {
      timeline.push({
        event: 'LEAD_ASSIGNED',
        performedBy: admin._id,
        performedByName: admin.name,
        details: `Assigned to specialized domain specialist @${assignedAgent.username} based on sector expertise [${raw.service}].`,
        timestamp: new Date(createdAt.getTime() + 1000 * 3600 * 2)
      });
    }

    if (raw.status !== LEAD_STATUS.NEW) {
      timeline.push({
        event: `STATUS_UPDATED_${raw.status}`,
        performedBy: assignedAgent ? assignedAgent._id : admin._id,
        performedByName: assignedAgent ? assignedAgent.name : admin.name,
        details: `Pipeline milestone updated to ${raw.status}. Communication telemetry recorded.`,
        timestamp: new Date(createdAt.getTime() + 1000 * 3600 * 8)
      });

      notes.push({
        author: assignedAgent ? assignedAgent._id : admin._id,
        authorName: assignedAgent ? assignedAgent.name : admin.name,
        text: `Initial discovery protocol executed with ${raw.name} from ${raw.company}. Requirements and scope aligned.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 10)
      });
    }

    if (raw.status === LEAD_STATUS.QUALIFIED || raw.status === LEAD_STATUS.PROPOSAL || raw.status === LEAD_STATUS.NEGOTIATION || raw.status === LEAD_STATUS.CONVERTED) {
      notes.push({
        author: assignedAgent ? assignedAgent._id : admin._id,
        authorName: assignedAgent ? assignedAgent.name : admin.name,
        text: `Verified project budget and technical requirements for ${raw.company}. Ready for high-velocity execution.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 18)
      });
    }

    if (raw.status === LEAD_STATUS.CONVERTED) {
      timeline.push({
        event: 'DEAL_CONVERTED',
        performedBy: admin._id,
        performedByName: admin.name,
        details: 'Formal contract executed and signed. Onboarding protocols activated.',
        timestamp: new Date(createdAt.getTime() + 1000 * 3600 * 30)
      });

      notes.push({
        author: admin._id,
        authorName: admin.name,
        text: `Contract counter-signed. Project onboarding checklist dispatched to ${raw.email}. Retainer live.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 32)
      });
    }

    if (raw.status === LEAD_STATUS.LOST) {
      timeline.push({
        event: 'DEAL_CLOSED_LOST',
        performedBy: assignedAgent ? assignedAgent._id : admin._id,
        performedByName: assignedAgent ? assignedAgent.name : admin.name,
        details: 'Lead marked as lost/closed due to timeline, budget mismatch, or paused campaign.',
        timestamp: new Date(createdAt.getTime() + 1000 * 3600 * 24)
      });

      notes.push({
        author: assignedAgent ? assignedAgent._id : admin._id,
        authorName: assignedAgent ? assignedAgent.name : admin.name,
        text: `Opportunity closed: Budget or scope out of enterprise thresholds. Archived for future nurture.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 25)
      });
    }

    await Lead.create({
      eventId: uuidv4(),
      name: raw.name,
      email: raw.email,
      phone: raw.phone,
      company: raw.company,
      service: raw.service,
      message: raw.message,
      status: raw.status,
      assignedTo: assignedAgent ? assignedAgent._id : null,
      source: 'WEBSITE',
      notes,
      timeline,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 1000 * 3600 * 24),
      lastContactedAt: raw.status !== LEAD_STATUS.NEW ? new Date(createdAt.getTime() + 1000 * 3600 * 6) : null,
      convertedAt: raw.status === LEAD_STATUS.CONVERTED ? new Date(createdAt.getTime() + 1000 * 3600 * 30) : null
    });

    insertedCount++;
  }

  console.log(`   ✓ Successfully seeded ${insertedCount} versatile leads across all 8 service sectors.`);

  // 5. Generate Audit Logs for Enterprise Telemetry
  console.log('\n5. Generating Security Audit Logs...');
  const auditEntries = [
    {
      action: AUDIT_ACTIONS.LOGIN,
      performedBy: admin._id,
      performedByName: admin.username,
      role: 'ADMIN',
      targetType: 'AUTH',
      targetId: admin._id.toString(),
      details: { role: 'ADMIN', method: 'CREDENTIALS' },
      timestamp: new Date(now - 7200 * 1000)
    },
    ...createdAgents.map((a, i) => ({
      action: AUDIT_ACTIONS.EMPLOYEE_CREATED,
      performedBy: admin._id,
      performedByName: admin.name,
      role: 'ADMIN',
      targetType: 'USER',
      targetId: a._id.toString(),
      details: { username: a.username, role: a.role, expertise: a.expertise },
      timestamp: new Date(now - (20 - i) * DAY)
    })),
    {
      action: AUDIT_ACTIONS.LEAD_ASSIGNED,
      performedBy: admin._id,
      performedByName: admin.name,
      role: 'ADMIN',
      targetType: 'LEAD',
      targetId: 'lead-multi-sample',
      details: { assignedTo: 'maya.ads', service: 'META_ADS' },
      timestamp: new Date(now - 3 * DAY)
    }
  ];

  for (const log of auditEntries) {
    await AuditLog.create(log).catch(() => {});
  }
  console.log(`   ✓ Created ${auditEntries.length} security audit trail logs.`);

  console.log('\n======================================================');
  console.log(`✓ DATABASE SEEDING COMPLETED SUCCESSFULLY (${insertedCount} LEADS)!`);
  console.log('======================================================');
  console.log('Admin Credentials:');
  console.log('  Username: admin');
  console.log('  Password: AdminPass2026!@');
  console.log('  Role:     ADMIN (Audit Trail & System Config Revoked)\n');
  console.log('Developer Credentials (Master CRM Platform Clearance):');
  console.log('  Username: developer');
  console.log('  Password: DevPass2026!@');
  console.log('  Role:     DEVELOPER (Full Master CRM Platform Clearance, Exclusive Audit Trail & Live Debugger)\n');
  console.log('Sample Staff Credentials:');
  console.log('  Username: maya.ads (Meta/Google Ads Specialist)');
  console.log('  Username: devon.code (3D Web Specialist)');
  console.log('  Username: aria.brand (Design/Content Specialist)');
  console.log('  Username: kai.seo (SEO/General Specialist)');
  console.log('  Username: chloe.social (Social Media/Content Specialist)');
  console.log('  Password: AgentPass2026!@');
  console.log('======================================================\n');

  await closeRedis();
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n[Error during seeding]:', err);
  process.exit(1);
});
