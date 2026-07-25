export interface Block {
  id: number;
  purchased: boolean;
  memberId?: string;
  bannerUrl?: string;
  merged?: {
    start: number;
    end: number;
    image: string;
  };
}

export interface CustomerProfile {
  memberId: string;
  fullName: string;
  country: string;
  description: string;
  website: string;
  socialLink: string;
  profileImage: string;
  purchaseDate: string;
  blocksPurchased: number;
  blocks: number[];
  approved: boolean;
  createdAt: string;
}

export interface BuyRequest {
  id: string;
  fullName: string;
  email: string;
  blocksRequested: number;
  website?: string;
  message?: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  createdAt: string;
}

export interface LiveStats {
  totalBlocks: number;
  soldBlocks: number;
  availableBlocks: number;
  totalRaised: number;
  goalAmount: number;
  totalMembers: number;
}

export interface AppSettings {
  maintenanceMode: boolean;
  wallets: Record<string, string>;
  social: Record<string, string>;
  support: {
    whatsapp: string;
    email: string;
  };
  logoUrl: string;
  siteName: string;
}

export interface WalletInfo {
  network: string;
  address: string;
  qrCode?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  publicId?: string;
  filename: string;
  createdAt: string;
  size: number;
}

export interface ActivityLogEntry {
  id?: string;
  action: string;
  timestamp: string;
  user?: string;
}
