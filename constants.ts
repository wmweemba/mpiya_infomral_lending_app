
import type { TenorType } from './types';

export const DB_NAME = 'MpiyaDB';
export const DB_VERSION = 1;
export const LOANS_STORE = 'loans';
export const BORROWERS_STORE = 'borrowers';
export const PAYMENTS_STORE = 'payments';

export const PASSCODE = '7802'; // Demo passcode
export const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes

// GOOGLE API CONSTANTS
// INSTRUCTIONS:
// 1. Go to Google Cloud Console > APIs & Services > Credentials
// 2. Create an OAuth 2.0 Client ID (Web Application)
// 3. Add "http://localhost:5173" to "Authorized JavaScript origins"
// 4. Copy the Client ID and API Key below:
export const GOOGLE_CLIENT_ID = '1050557399482-o41q3olk2lru917ds0bo0rf60b32glhg.apps.googleusercontent.com'; 
export const GOOGLE_API_KEY = 'AIzaSyAN0RtHI_sZgYTCqKEgid4yGoCuNTl6AlU';

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