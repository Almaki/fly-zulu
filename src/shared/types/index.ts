// User roles
export type UserCategory = 'FLIGHT' | 'GROUND';
export type UserPosition = 'PILOT' | 'FA' | 'OPS' | 'TRAFICO' | 'MANTTO';
export type UserRole = UserPosition | 'SUPERADMIN';

// Flight status
export type FlightStatus = 'ON_TIME' | 'DELAY' | 'GATE_CHANGE' | 'CANCELED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED';

// Subscription tier
export type SubscriptionTier = 'FREE' | 'PREMIUM';

// Ciudad base (6 main hubs)
export type CiudadBase = 'TIJ' | 'BJX' | 'GDL' | 'MTY' | 'MEX' | 'CUN';

// Base user interface
export interface User {
  id: string;
  email: string;
  nombre: string;
  whatsapp: string;
  categoria: UserCategory;
  posicion: UserPosition;
  role: UserRole;
  strikes: number;
  is_banned: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  device_fingerprint: string | null;
  last_ip: string | null;
  notifications_muted: boolean;
  last_seen_at: string | null;
  last_location: string | null;
  ciudad_base: CiudadBase | null;
  empresa: string | null;
  created_at: string;
  updated_at: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// API Response
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Sync status for offline
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error';

export interface SyncableRecord {
  id: string;
  sync_status: SyncStatus;
  local_updated_at: string;
  server_updated_at: string | null;
}
