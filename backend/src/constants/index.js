export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'ADMIN', // Unified single entity: Admin and Super Admin are one
  DEVELOPER: 'DEVELOPER',
  EMPLOYEE: 'EMPLOYEE'
};

export const SERVICES = {
  META_ADS: 'META_ADS',
  GOOGLE_ADS: 'GOOGLE_ADS',
  SEO: 'SEO',
  WEB_DEVELOPMENT: 'WEB_DEVELOPMENT',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
  CONTENT_MARKETING: 'CONTENT_MARKETING',
  GRAPHIC_DESIGN: 'GRAPHIC_DESIGN',
  GENERAL: 'GENERAL'
};

export const SERVICE_LABELS = {
  META_ADS: 'Meta Ads & Paid Media',
  GOOGLE_ADS: 'Google Ads & PPC',
  SEO: 'SEO & Organic Growth',
  WEB_DEVELOPMENT: '3D Web & App Design',
  SOCIAL_MEDIA: 'Creators & Influencers',
  CONTENT_MARKETING: 'Meme Culture & Viral Content',
  GRAPHIC_DESIGN: 'Luxury Brand Direction',
  GENERAL: 'Full Growth Strategy'
};

// Mapping friendly frontend labels to enum values
export const LABEL_TO_SERVICE = {
  'Meta Ads & Paid Media': 'META_ADS',
  'Creators & Influencers': 'SOCIAL_MEDIA',
  'Meme Culture & Viral': 'CONTENT_MARKETING',
  'Meme Culture & Viral Content': 'CONTENT_MARKETING',
  'Luxury Brand Direction': 'GRAPHIC_DESIGN',
  '3D Web & App Design': 'WEB_DEVELOPMENT',
  'Full Growth Strategy': 'GENERAL',
  'Google Ads & PPC': 'GOOGLE_ADS',
  'SEO & Organic Growth': 'SEO'
};

export const LEAD_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
  CLOSED: 'CLOSED'
};

export const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  EMPLOYEE_CREATED: 'EMPLOYEE_CREATED',
  EMPLOYEE_DISABLED: 'EMPLOYEE_DISABLED',
  EMPLOYEE_ENABLED: 'EMPLOYEE_ENABLED',
  PASSWORD_RESET: 'PASSWORD_RESET',
  LEAD_CREATED: 'LEAD_CREATED',
  LEAD_ASSIGNED: 'LEAD_ASSIGNED',
  LEAD_UPDATED: 'LEAD_UPDATED',
  LEAD_STATUS_CHANGED: 'LEAD_STATUS_CHANGED',
  EMPLOYEE_EXPERTISE_CHANGED: 'EMPLOYEE_EXPERTISE_CHANGED',
  EMPLOYEE_ROLE_CHANGED: 'EMPLOYEE_ROLE_CHANGED',
  EMPLOYEE_UPDATED: 'EMPLOYEE_UPDATED'
};

export const QUEUE_CONFIG = {
  STREAM_NAME: 'lead-submissions',
  CONSUMER_GROUP: 'crm-lead-consumers',
  DLQ_STREAM_NAME: 'lead-submissions-dlq',
  DEFAULT_BATCH_SIZE: 50,
  MAX_RETRIES: 5,
  DUPLICATE_WINDOW_SECONDS: 300
};
