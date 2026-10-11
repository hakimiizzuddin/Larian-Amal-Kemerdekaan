export type RunCategory = '10km_veteran' | '10km_open' | '5km_fun';

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL';

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  category: RunCategory;
  tshirtSize?: TShirtSize;
  bibNumber: string;
  feePaid: number;
  emergencyContact?: string;
  status: 'confirmed' | 'cancelled';
  userId?: string;
  createdAt: string;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'admin' }
  | { type: 'my-bib'; registrationId: string };

export interface CategoryInfo {
  id: RunCategory;
  name: string;
  code: string;
  distance: string;
  fee: number;
  perks: string[];
  slotsTotal: number;
  flagOffTime: string;
  description: string;
}
