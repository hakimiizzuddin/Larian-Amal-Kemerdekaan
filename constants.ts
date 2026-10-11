import { CategoryInfo } from './types';

export const EVENT_NAME = 'LARIAN AMAL MERDEKA // 31.08';
export const EVENT_DATE = '31 AUGUST 2026';
export const EVENT_VENUE = 'DATARAN MERDEKA // CYBER_CORE KL';
export const TARGET_FUNDS = 50000; // RM 50,000 target charity fund

export const RUN_CATEGORIES: CategoryInfo[] = [
  {
    id: '10km_veteran',
    name: '10 KM VETERAN RUN',
    code: 'VET-10K',
    distance: '10.0 KM',
    fee: 50,
    slotsTotal: 500,
    flagOffTime: '06:30 AM',
    perks: ['Holographic Finisher Medal', 'Glitch Tech-Weave Jersey', 'Cyber Timing RFID Bib', 'E-Certificate of Valor'],
    description: 'Reserved for veteran runners age 45+. Conquer the heritage streets under dawn light.'
  },
  {
    id: '10km_open',
    name: '10 KM OPEN CHALLENGE',
    code: 'OPN-10K',
    distance: '10.0 KM',
    fee: 50,
    slotsTotal: 1500,
    flagOffTime: '06:45 AM',
    perks: ['Holographic Finisher Medal', 'Glitch Tech-Weave Jersey', 'Cyber Timing RFID Bib', 'Podium Cash Token Eligible'],
    description: 'The premier open road race. Test your pace against the nation’s swiftest circuit runners.'
  },
  {
    id: '5km_fun',
    name: '5 KM NEON FUN RUN',
    code: 'FUN-05K',
    distance: '5.0 KM',
    fee: 50,
    slotsTotal: 2000,
    flagOffTime: '07:15 AM',
    perks: ['Commemorative Merdeka Medal', 'Neon Synth Apparel', 'Charity Pass Token', 'Free Cyber Refreshments'],
    description: 'Family-friendly, all-ages neon jog through the heart of the city in celebration of freedom.'
  }
];

export const CHARITY_BENEFICIARIES = [
  {
    name: 'Tabung Kebajikan Veteran Perwira',
    sector: 'Armed Forces & Police Veteran Welfare',
    share: '40%',
    desc: 'Medical aid and rehabilitation devices for elderly military veterans and their dependents.'
  },
  {
    name: 'Yayasan Anak Yatim & Asnaf Merdeka',
    sector: 'Underprivileged Youth Education',
    share: '35%',
    desc: 'STEM and robotics scholarship funds for underprivileged and orphaned students across Malaysia.'
  },
  {
    name: 'Inisiatif Pemulihan Hutan Tropika',
    sector: 'Borneo & Peninsular Reforestation',
    share: '25%',
    desc: 'Direct tree planting and biodiversity sensors along critical wildlife corridors.'
  }
];

export const EVENT_SCHEDULE = [
  { time: '05:30 AM', event: 'SYS_BOOT // BAGGAGE DROP & HYDRATION MATRIX INITIALIZED' },
  { time: '06:15 AM', event: 'WARM_UP ROUTINE // CYBER-AEROBIC CADENCE SYNC' },
  { time: '06:30 AM', event: 'FLAG_OFF: 10KM VETERAN DIVISION' },
  { time: '06:45 AM', event: 'FLAG_OFF: 10KM OPEN DIVISION' },
  { time: '07:15 AM', event: 'FLAG_OFF: 5KM NEON FUN RUN' },
  { time: '09:00 AM', event: 'PODIUM CEREMONY & CHARITY FUND HANDOVER TO BENEFICIARIES' },
];
