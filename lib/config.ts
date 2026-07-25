/**
 * Central Application Configuration – SELF‑CONTAINED
 * সব তথ্য সরাসরি এখানে দেওয়া আছে। .env.local ফাইলের প্রয়োজন নেই।
 */

// ───────────────────────────────────────
// 1. Firebase Configuration
// ───────────────────────────────────────

export const firebaseConfigData = {
  apiKey: "AIzaSyBXs5K-6pdWxFQ8l-WtjS3pqH8v6ocXZMM",
  authDomain: "create-project-62743.firebaseapp.com",
  databaseURL:
    "https://create-project-62743-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "create-project-62743",
  storageBucket: "create-project-62743.firebasestorage.app",
  messagingSenderId: "923135050962",
  appId: "1:923135050962:web:03a91ebd311ee052f1d90b",
  measurementId: "G-16C3SYFNJY",
};

// ───────────────────────────────────────
// 2. Cloudinary Configuration
// ───────────────────────────────────────

export const cloudinaryConfig = {
  cloudName: "qq3tygjl",
  uploadPreset: "gallery_upload",
  apiKey: "649921912794173",
};

// ───────────────────────────────────────
// 3. Wallet Addresses (৯টি নেটওয়ার্ক)
// ───────────────────────────────────────

export const wallets = {
  binance: "912221034",
  usdtTrc20: "TTapBkTqrDnzHbWzek6wSBUTcJKFmR8Ws6",
  usdtBep20: "0xA5b4F9A5Cc4b570973aeac5c087c8B562308ceFe",
  ethereum: "0x443792A4884e8e855f954ccEF910778Aff1eb78E",
  bnb: "0x443792A4884e8e855f954ccEF910778Aff1eb78E",
  bitcoin: "bc1qgqgclgahn2sp4f3vyz8cqxsjjvdtjhxlytwaan",
  solana: "E9Vy8tUXrDuMt8zr94bbS7JBtUUfzdELrknTVNfpxzHi",
  matic: "0x443792A4884e8e855f954ccEF910778Aff1eb78E",
  tron: "TGrzg1SVkNcmzeprnwAhmN6wFWZVewyygs",
};

// ───────────────────────────────────────
// 4. Support & Admin
// ───────────────────────────────────────

export const support = {
  whatsapp: "+8801576940717",
  email: "kawsar40761@gmail.com",
};

export const ADMIN_EMAIL = "kawsar40761@gmail.com";

// ───────────────────────────────────────
// 5. Site Constants & Branding
// ───────────────────────────────────────

export const SITE_NAME = "Digital Blocks";
export const SITE_DESCRIPTION =
  "Premium digital blocks platform. Own a permanent piece of the internet.";
export const SITE_TAGLINE = "Own a piece of the digital future.";
export const GOAL_AMOUNT = 1_000_000;
export const MAX_BLOCKS = 1000;
export const CURRENCY = "USD";
export const DEFAULT_THEME = "system";

export const siteLogo = {
  src: "/logo.svg",
  alt: SITE_NAME,
  width: 36,
  height: 36,
};

// ───────────────────────────────────────
// 6. Project Metadata
// ───────────────────────────────────────

export const PROJECT_VERSION = "1.0.0";
export const PROJECT_AUTHOR = "Digital Blocks Team";
export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_TIMEZONE = "UTC";
export const DEFAULT_COUNTRY = "US";
export const DATE_FORMAT = "MMMM d, yyyy";
export const MAX_UPLOAD_SIZE_MB = 10;
export const SUPPORTED_IMAGE_FORMATS = [
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
];

// ───────────────────────────────────────
// 7. Application Settings
// ───────────────────────────────────────

export const APP_CONFIG = {
  pagination: { defaultPageSize: 20, maxPageSize: 100 },
  cache: { short: 60_000, medium: 300_000, long: 3_600_000 },
  animation: { fast: 150, normal: 250, slow: 400 },
  toastDuration: 4000,
  sessionTimeout: 1_800_000,
  apiTimeout: 10_000,
  retryAttempts: 3,
} as const;

// ───────────────────────────────────────
// 8. Feature Flags
// ───────────────────────────────────────

export const FEATURES = {
  enableRegistration: false,
  enableDonations: true,
  enableGallery: true,
  enableStatistics: true,
  enableMaintenanceMode: false,
  enableAdminPanel: true,
} as const;

// ───────────────────────────────────────
// 9. Routes
// ───────────────────────────────────────

export const ROUTES = {
  home: "/",
  faq: "/faq",
  contact: "/contact",
  admin: {
    login: "/admin/login",
    dashboard: "/admin",
    blocks: "/admin/blocks",
    requests: "/admin/requests",
    settings: "/admin/settings",
  },
  profile: (id: string) => `/profile/${id}`,
} as const;

// ───────────────────────────────────────
// 10. Navigation & Section IDs
// ───────────────────────────────────────

export const SECTION_IDS = {
  statistics: "statistics",
  buy: "buy",
  gallery: "gallery",
  faq: "faq",
  contact: "contact",
} as const;

export const mainNavLinks = [
  { label: "Statistics", href: `/#${SECTION_IDS.statistics}` },
  { label: "FAQ", href: `/#${SECTION_IDS.faq}` },
  { label: "Contact", href: `/#${SECTION_IDS.contact}` },
] as const;

export const ctaButton = {
  label: "Buy Blocks",
  href: `/#${SECTION_IDS.buy}`,
} as const;

// ───────────────────────────────────────
// 11. Social Media Links
// ───────────────────────────────────────

export const social = {
  website: "",
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  tiktok: "",
  telegram: "",
  discord: "",
  github: "",
  reddit: "",
  pinterest: "",
} as const;

// ───────────────────────────────────────
// Public env (for compatibility)
// ───────────────────────────────────────

export const publicEnv = {
  firebase: firebaseConfigData,
  cloudinary: cloudinaryConfig,
  wallets: wallets,
  support: support,
} as const;
