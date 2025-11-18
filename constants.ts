
import type { TenorType } from './types';

// Define ImportMeta interface to satisfy TypeScript when vite/client is missing
declare global {
  interface ImportMeta {
    env: {
      VITE_PASSCODE?: string;
      VITE_GOOGLE_CLIENT_ID?: string;
      VITE_GOOGLE_API_KEY?: string;
      [key: string]: any;
    };
  }
}

export const DB_NAME = 'MpiyaDB';
export const DB_VERSION = 2; // Version 2 includes payments index
export const LOANS_STORE = 'loans';
export const BORROWERS_STORE = 'borrowers';
export const PAYMENTS_STORE = 'payments';

// Safe Environment Variable Access
// In some preview environments, import.meta.env might be undefined.
const safeEnv = import.meta.env || {};

export const PASSCODE = safeEnv.VITE_PASSCODE || '7802'; 
export const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

// GOOGLE API CONSTANTS
export const GOOGLE_CLIENT_ID = safeEnv.VITE_GOOGLE_CLIENT_ID || ''; 
export const GOOGLE_API_KEY = safeEnv.VITE_GOOGLE_API_KEY || '';

export const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  "https://sheets.googleapis.com/$discovery/rest?version=v4"
];
export const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets";

export const TENOR_OPTIONS: { value: TenorType; label: string; interest: number; days: number }[] = [
  { value: '1_week', label: '1 Week', interest: 15, days: 7 },
  { value: '2_weeks', label: '2 Weeks', interest: 20, days: 14 },
  { value: '3_weeks', label: '3 Weeks', interest: 25, days: 21 },
  { value: '4_weeks', label: '4 Weeks', interest: 30, days: 28 },
];

export const OVERDUE_PENALTY_RATE = 5; // 5% per week
