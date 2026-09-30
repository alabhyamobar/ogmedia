import { v4 as uuidv4 } from 'uuid';
import { connectDB, disconnectDB } from '../config/db.js';
import { getRedisClient, closeRedis } from '../config/redis.js';
import { User } from '../models/User.js';
import { Lead } from '../models/Lead.js';
import { AuditLog } from '../models/AuditLog.js';
import { ROLES, SERVICES, LEAD_STATUS, AUDIT_ACTIONS } from '../constants/index.js';
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
  console.log('   ✓ MongoDB database "ogmedia_crm" dropped.');

  try {
    await redis.flushdb();
    console.log('   ✓ Redis buffer streams & deduplication keys cleared.');
  } catch (err) {
    console.warn('   ! Redis flush warning:', err.message);
  }

  // 2. Create Administrator Account
  console.log('\n2. Enrolling Executive Administrator...');
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

  // Secondary admin alias
  await User.create({
    name: 'Admin Root',
    username: 'superadmin',
    email: 'superadmin@ogmedia.agency',
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    expertise: Object.values(SERVICES),
    status: 'ACTIVE',
    mustChangePassword: false
  });
  console.log('   ✓ Administrator created: @admin / AdminPass2026!@');
  console.log('   ✓ Alias created: @superadmin / AdminPass2026!@');

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

  // 4. Seed Diverse Inquiries across all 8 Services and Statuses
  console.log('\n4. Ingesting Multi-Domain Production Inquiries...');

  const now = Date.now();
  const DAY = 86400000;

  const rawLeads = [
    // --- META ADS & PAID MEDIA ---
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Sebastian Cruz',
      company: 'Velvet Horizon Luxury Apparel',
      email: 'cruz@velvethorizon.it',
      phone: '+39 02 8945 7712',
      message: 'Scaling our European direct-to-consumer luxury silk line to US markets. Current ROAS plateaued at 2.4x on Meta with $80k/mo spend. Need your high-velocity creative testing protocol.',
      daysAgo: 1
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONTACTED,
      name: 'Valerie Dupont',
      company: 'NeoGlow Skincare Tech',
      email: 'valerie@neoglow.paris',
      phone: '+33 1 42 68 55 00',
      message: 'We engineered an LED peptide therapy mask. Looking for full-funnel Meta Ads media buying, lookalike refinement, and TikTok cross-attribution.',
      daysAgo: 4
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Oliver Vance',
      company: 'Aura Sound Labs',
      email: 'oliver@aurasound.io',
      phone: '+1 (415) 890-2341',
      message: 'Launching lossless spatial audio monitors. Seeking aggressive 6-figure monthly Meta campaigns targeted at producers and audiophiles.',
      daysAgo: 10
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Camila Reyes',
      company: 'Solaria Energy Drink',
      email: 'camila@solariadrinks.com',
      phone: '+1 (305) 774-9012',
      message: 'National retail launch in Whole Foods & Target. Need high-converting Meta UGC video campaigns driving local store velocity and DTC subscription kits.',
      daysAgo: 22
    },

    // --- GOOGLE ADS & PPC ---
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.NEW,
      name: 'Dr. Alistair Finch',
      company: 'Apex Regenerative Clinic',
      email: 'afinch@apexregenerative.ch',
      phone: '+41 22 731 99 44',
      message: 'High-intent Google Search PPC for our private Zurich and Geneva longevity clinics. Zero-tolerance for click fraud or low-yield keywords.',
      daysAgo: 0.5
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Rachel Sterling',
      company: 'Equinox Prime Real Estate',
      email: 'rachel@equinoxprime.ae',
      phone: '+971 4 399 2200',
      message: 'Dubai ultra-prime villa developments ($5M-$25M). Need targeted Google Search & Performance Max targeting ultra-high-net-worth investors across GCC and London.',
      daysAgo: 6
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Darius Thorne',
      company: 'ChronoVault Fine Timepieces',
      email: 'darius@chronovault.ch',
      phone: '+41 22 900 11 22',
      message: 'Pre-owned Patek Philippe and Audemars Piguet marketplace. Our Google Ads CPA is currently $420; looking to drive it under $260 with exact-match search arbitrage.',
      daysAgo: 14
    },
    {
      service: SERVICES.GOOGLE_ADS,
      status: LEAD_STATUS.CONVERTED,
      name: 'Marcus Thorne',
      company: 'Bespoke Aviation Charter',
      email: 'mthorne@bespokeaviation.co.uk',
      phone: '+44 20 7946 0912',
      message: 'Private jet empty-leg charter campaigns. Contract signed for $15,000/mo retainer + 3% ad spend management.',
      daysAgo: 25
    },

    // --- SEO & ORGANIC GROWTH ---
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.NEW,
      name: 'Viktor Krumm',
      company: 'OmniChain Decentralized Prime',
      email: 'viktor@omnichain.network',
      phone: '+44 7700 900341',
      message: 'Decentralized bridge protocol. We lost organic search rankings following Google Core update. Need programmatic programmatic technical audit and backlink rehabilitation.',
      daysAgo: 2
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONTACTED,
      name: 'Helena Berg',
      company: 'Nordic Clean Interior',
      email: 'helena@nordicclean.se',
      phone: '+46 8 123 4567',
      message: 'Scandinavian furniture brand expanding to US and UK. We want to own high-volume keywords like "modular minimalist sofa" and "sustainable ash wood desks".',
      daysAgo: 5
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Nikhil Agarwal',
      company: 'FinFlow Cloud ERP',
      email: 'nikhil@finflow.io',
      phone: '+91 80 4123 8899',
      message: 'B2B SaaS platform for treasury automation. Looking to scale organic inbound pipeline from 2,000 to 25,000 monthly qualified enterprise sessions.',
      daysAgo: 11
    },
    {
      service: SERVICES.SEO,
      status: LEAD_STATUS.CONVERTED,
      name: 'Genevieve Roy',
      company: 'Atelier Montaigne Fragrance',
      email: 'genevieve@ateliermontaigne.fr',
      phone: '+33 1 47 20 00 11',
      message: 'Niche artisan perfumery. Organic search revenue tripled after month 2 of technical restructuring. Project extended to 12-month retainer.',
      daysAgo: 28
    },

    // --- 3D WEB & APP DESIGN ---
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.NEW,
      name: 'Christian Bale-Jones',
      company: 'Kinetix Cybernetics',
      email: 'christian@kinetix.tech',
      phone: '+1 (212) 555-0199',
      message: 'Designing an interactive WebGL 3D showroom for our bionic prosthetic limbs. Must match the aesthetic of Cyberpunk 2077 meets Apple hardware design. 60 FPS mobile requirement.',
      daysAgo: 1.5
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Tatsuya Mori',
      company: 'HyperShift EV Motors',
      email: 'mori@hypershiftev.jp',
      phone: '+81 3 5555 0143',
      message: 'Full Three.js car configurator for our electric hypercar. Need camera interpolation, real-time paint shader reflections, and interior 360 viewer.',
      daysAgo: 8
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Sofia Al-Mansoor',
      company: 'Mirage Mirage Virtual Pavilion',
      email: 'sofia@miragepavilion.ae',
      phone: '+971 4 888 1234',
      message: 'Architectural walkthrough web application for private museum. Reviewing milestone deliverables and SLA agreement.',
      daysAgo: 13
    },
    {
      service: SERVICES.WEB_DEVELOPMENT,
      status: LEAD_STATUS.CONVERTED,
      name: 'Julian Ross',
      company: 'Synthetix Soundscapes',
      email: 'julian@synthetix.audio',
      phone: '+1 (323) 441-9080',
      message: 'Interactive canvas audio synthesizer website launched. Won Site of the Day on Awwwards and FWA of the Day.',
      daysAgo: 26
    },

    // --- CREATORS & INFLUENCERS ---
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.NEW,
      name: 'Tara Higgins',
      company: 'Volt Energy Chews',
      email: 'tara@voltchews.com',
      phone: '+1 (512) 341-9988',
      message: 'Gamer and extreme athlete influencer activations. Want to recruit 40 micro-streamers and 5 Tier-1 YouTubers for Q4 holiday push.',
      daysAgo: 3
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONTACTED,
      name: 'Liam Gallagher',
      company: 'Rebel Riot Apparel',
      email: 'liam@rebelriot.co.uk',
      phone: '+44 161 832 9000',
      message: 'Streetwear drop brand. Need high-engagement creator seeding across London underground music and drill scene.',
      daysAgo: 7
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Sora Takahashi',
      company: 'PixelBite Arcade Snacks',
      email: 'sora@pixelbite.tokyo',
      phone: '+81 90 1234 5678',
      message: 'Viral TikTok creator agency network management. Targeting Gen Z anime and gaming subcultures with blind taste test formats.',
      daysAgo: 12
    },
    {
      service: SERVICES.SOCIAL_MEDIA,
      status: LEAD_STATUS.CONVERTED,
      name: 'Chloe Monet',
      company: 'Lumiere Cinema Glasses',
      email: 'chloe@lumiereglasses.com',
      phone: '+1 (310) 902-1133',
      message: 'Contract executed for 50 creator unboxing videos and whitelisted creator ad spark ads.',
      daysAgo: 20
    },

    // --- MEME CULTURE & VIRAL CONTENT ---
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.NEW,
      name: 'Zack Kowalski',
      company: 'PumpKey Hardware Wallet',
      email: 'zack@pumpkey.org',
      phone: '+1 (702) 881-0021',
      message: 'Crypto hardware wallet launch. Need meme warfare on X (Twitter) and Reddit. Edgy, culture-native memes that actually drive product conversions.',
      daysAgo: 2.5
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Freja Lind',
      company: 'Oats & Riot Milk',
      email: 'freja@oatsriot.dk',
      phone: '+45 33 12 34 56',
      message: 'Disruptive plant-based milk taking shots at legacy dairy. Need unhinged TikTok comments strategy and satirical billboard content.',
      daysAgo: 9
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Dante Rossi',
      company: 'Apex Predator Energy',
      email: 'dante@apexenergy.io',
      phone: '+1 (480) 991-3211',
      message: 'Meme accounts syndication strategy across 12 parody pages totaling 18M followers.',
      daysAgo: 16
    },
    {
      service: SERVICES.CONTENT_MARKETING,
      status: LEAD_STATUS.CONVERTED,
      name: 'Beau Stirling',
      company: 'Degen Arcade Bets',
      email: 'beau@degenarcade.com',
      phone: '+1 (305) 555-8812',
      message: 'Campaign generated 4.2M organic impressions on X within first 72 hours. Converted to monthly retainer.',
      daysAgo: 29
    },

    // --- LUXURY BRAND DIRECTION ---
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.NEW,
      name: 'Countess Beatrix Von Hapsburg',
      company: 'Hapsburg Fine Porcelains',
      email: 'beatrix@hapsburg-vienna.at',
      phone: '+43 1 515 9000',
      message: '300-year-old heritage Austrian manufacturer modernizing visual identity. Need ultra-luxury brand guidelines, gold-embossed typography, and digital art direction.',
      daysAgo: 1.8
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONTACTED,
      name: 'Matteo Moretti',
      company: 'Officina Moretti Yachting',
      email: 'matteo@morettiyachts.it',
      phone: '+39 010 246 8890',
      message: 'Custom superyacht builder in Genoa. Brand identity refresh including custom monograms, hull livery typography, and VIP client book.',
      daysAgo: 6.5
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.NEGOTIATION,
      name: 'Giselle Chen',
      company: 'Maison Noir Botanical Gin',
      email: 'giselle@maisonnoirgin.com',
      phone: '+1 (604) 990-2211',
      message: 'Glass bottle debossing, bespoke gothic-luxury packaging, and tactile unboxing experience.',
      daysAgo: 15
    },
    {
      service: SERVICES.GRAPHIC_DESIGN,
      status: LEAD_STATUS.CONVERTED,
      name: 'Laurent Mercier',
      company: 'Mercier Horology',
      email: 'laurent@mercier-geneve.com',
      phone: '+41 22 819 00 00',
      message: 'Comprehensive luxury identity complete. Delivered brand book, custom typography vectors, and high-res 3D physical mockups.',
      daysAgo: 27
    },

    // --- FULL GROWTH STRATEGY ---
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.NEW,
      name: 'Anthony Starkwood',
      company: 'Nexus Mobility Systems',
      email: 'tony@nexusmobility.io',
      phone: '+1 (650) 800-4491',
      message: 'Autonomous drone delivery network raising Series B. Need complete omnichannel growth strategy: enterprise PR, Google Ads, programmatic SEO, and brand overhaul.',
      daysAgo: 0.2
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.QUALIFIED,
      name: 'Serena Vance',
      company: 'OmniHealth Diagnostics',
      email: 'serena@omnihealth.co',
      phone: '+1 (617) 890-1122',
      message: 'Direct-to-consumer genetic health biomarkers. Full growth architecture audit needed across conversion rate optimization, email retention, and paid acquisition.',
      daysAgo: 8.5
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.PROPOSAL,
      name: 'Hamdan Al-Zubair',
      company: 'Emirates Venture Studio',
      email: 'hamdan@evstudio.ae',
      phone: '+971 4 200 8899',
      message: 'Incubating 6 consumer tech portfolio companies. Seeking agency of record agreement for entire digital growth and brand acceleration.',
      daysAgo: 17
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.CONVERTED,
      name: 'Jonathan Drake',
      company: 'Titanium Capital Partners',
      email: 'jdrake@titaniumcap.com',
      phone: '+1 (212) 800-9900',
      message: 'Turnaround growth plan approved and signed. $35,000/mo enterprise retainer active.',
      daysAgo: 24
    },
    {
      service: SERVICES.GENERAL,
      status: LEAD_STATUS.LOST,
      name: 'Greg Peterson',
      company: 'OldSchool Industrial Supplies',
      email: 'greg@oldschoolmfg.com',
      phone: '+1 (414) 220-1100',
      message: 'Wanted traditional print catalog mailers and yellow-page listings. Not aligned with OG Media cyberpunk digital-first thesis.',
      daysAgo: 18
    },
    {
      service: SERVICES.META_ADS,
      status: LEAD_STATUS.LOST,
      name: 'Barry Miller',
      company: 'Budget Dropship Goods',
      email: 'barry@budgetgoods.net',
      phone: '+1 (813) 440-1200',
      message: 'Inquired about $300/mo total ad budget. Failed minimum ad spend threshold for dedicated agency management.',
      daysAgo: 19
    }
  ];

  let insertedCount = 0;
  for (const raw of rawLeads) {
    const createdAt = new Date(now - raw.daysAgo * DAY);
    const assignedAgent = raw.status === LEAD_STATUS.NEW ? null : getAgentForService(raw.service);

    const timeline = [
      {
        event: 'TRANSMISSION_RECEIVED',
        performedByName: 'BUFFER_INGESTION_QUEUE',
        details: `Transmission ingested into Redis buffer stream and committed to CRM. Source: PUBLIC_TRANSMISSION`,
        timestamp: createdAt
      }
    ];

    const notes = [];

    if (assignedAgent) {
      timeline.push({
        event: 'ASSIGNED_TO_SPECIALIST',
        performedBy: admin._id,
        performedByName: admin.name,
        details: `Assigned domain oversight to @${assignedAgent.username} based on sector clearance for ${raw.service}.`,
        timestamp: new Date(createdAt.getTime() + 1000 * 60 * 45)
      });
    }

    if (raw.status !== LEAD_STATUS.NEW) {
      timeline.push({
        event: `STATUS_UPDATED_${raw.status}`,
        performedBy: assignedAgent ? assignedAgent._id : admin._id,
        performedByName: assignedAgent ? assignedAgent.name : admin.name,
        details: `Status advanced to ${raw.status}. Communication logs synchronized.`,
        timestamp: new Date(createdAt.getTime() + 1000 * 3600 * 12)
      });

      notes.push({
        author: assignedAgent ? assignedAgent._id : admin._id,
        authorName: assignedAgent ? assignedAgent.name : admin.name,
        text: `Initial discovery protocol executed with ${raw.name}. Discussed specific KPIs and timeline for ${raw.company}.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 14)
      });
    }

    if (raw.status === LEAD_STATUS.CONVERTED) {
      notes.push({
        author: admin._id,
        authorName: admin.name,
        text: `Formal contract counter-signed. Onboarding checklist dispatched to client via encrypted channel.`,
        createdAt: new Date(createdAt.getTime() + 1000 * 3600 * 48)
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
      convertedAt: raw.status === LEAD_STATUS.CONVERTED ? new Date(createdAt.getTime() + 1000 * 3600 * 36) : null
    });

    insertedCount++;
  }

  console.log(`   ✓ Successfully seeded ${insertedCount} realistic leads across all 8 service sectors.`);

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
  console.log('✓ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Admin Credentials:');
  console.log('  Username: admin  (or superadmin)');
  console.log('  Password: AdminPass2026!@');
  console.log('  Role:     ADMIN\n');
  console.log('Sample Staff Credentials:');
  console.log('  Username: maya.ads (Meta/Google Ads Specialist)');
  console.log('  Username: devon.code (3D Web Specialist)');
  console.log('  Username: aria.brand (Design/Content Specialist)');
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
