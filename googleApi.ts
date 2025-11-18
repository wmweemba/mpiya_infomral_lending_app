
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, DISCOVERY_DOCS, SCOPES } from './constants';
import type { Loan, Borrower, Payment } from './types';

// Global types for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Promise resolvers for the current auth request
let authResolve: (() => void) | null = null;
let authReject: ((reason?: any) => void) | null = null;

export const initializeGoogleApi = async (): Promise<void> => {
  return new Promise((resolve) => {
    const checkGapi = setInterval(() => {
      if (window.gapi) {
        clearInterval(checkGapi);
        window.gapi.load('client', async () => {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          gapiInited = true;
          if (gisInited) resolve();
        });
      }
    }, 100);

    const checkGis = setInterval(() => {
      if (window.google) {
        clearInterval(checkGis);
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (resp: any) => {
            if (resp.error !== undefined) {
               if (authReject) authReject(resp);
            } else {
               if (authResolve) authResolve();
            }
          },
        });
        gisInited = true;
        if (gapiInited) resolve();
      }
    }, 100);
  });
};

export const handleAuthClick = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Token client not initialized");
    
    authResolve = resolve;
    authReject = reject;

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

export const getValidToken = (): boolean => {
    return window.gapi?.client?.getToken() !== null;
}

// --- DRIVE & SHEETS OPERATIONS ---

const BACKUP_FILE_NAME = 'ShylockZMW_backup.json';
const SHEET_NAME = 'Shylock ZMW Loans Master';

// Helper to construct multipart body for Drive API
const createMultipartBody = (metadata: object, content: string, mimeType: string) => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    return delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content +
        close_delim;
};

export const syncToDrive = async (data: { loans: Loan[], borrowers: Borrower[], payments: Payment[] }) => {
  try {
    // 1. Find if backup file exists
    const response = await window.gapi.client.drive.files.list({
      q: `name = '${BACKUP_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
    });
    
    const files = response.result.files;
    const fileContent = JSON.stringify(data, null, 2);
    const mimeType = 'application/json';
    const metadata = {
      name: BACKUP_FILE_NAME,
      mimeType: mimeType,
    };

    if (files && files.length > 0) {
        // Update existing file
        const fileId = files[0].id;
        const body = createMultipartBody(metadata, fileContent, mimeType);
        
        await window.gapi.client.request({
            path: `/upload/drive/v3/files/${fileId}`,
            method: 'PATCH',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': 'multipart/related; boundary="-------314159265358979323846"' },
            body: body
        });
        console.log("Updated Drive backup");
    } else {
        // Create new file
        const body = createMultipartBody(metadata, fileContent, mimeType);

        await window.gapi.client.request({
            path: '/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            headers: { 'Content-Type': 'multipart/related; boundary="-------314159265358979323846"' },
            body: body
        });
        console.log("Created Drive backup");
    }
  } catch (err) {
    console.error("Drive Sync Error", err);
    throw err;
  }
};

export const syncToSheets = async (data: { loans: Loan[], borrowers: Borrower[], payments: Payment[] }) => {
    try {
        // 1. Find Sheet
        const response = await window.gapi.client.drive.files.list({
            q: `name = '${SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
            fields: 'files(id, name)',
        });
        
        let spreadsheetId;
        if (response.result.files && response.result.files.length > 0) {
            spreadsheetId = response.result.files[0].id;
        } else {
            const createRes = await window.gapi.client.sheets.spreadsheets.create({
                properties: { title: SHEET_NAME },
            });
            spreadsheetId = createRes.result.spreadsheetId;
        }

        // 2. Prepare Data
        const loansHeader = ['ID', 'Borrower ID', 'Principal', 'Interest %', 'Status', 'Issue Date', 'Due Date'];
        const loansRows = data.loans.map(l => [l.id, l.borrowerId, l.principal, l.interestRate, l.status, l.issueDate, l.dueDate]);
        
        // 3. Update Sheet1 (Loans)
        await window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            resource: { values: [loansHeader, ...loansRows] }
        });

    } catch (err) {
        console.error("Sheets Sync Error", err);
        throw err;
    }
}
