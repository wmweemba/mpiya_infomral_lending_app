
import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, LOANS_STORE, BORROWERS_STORE, PAYMENTS_STORE } from './constants';
import type { Loan, Borrower, Payment } from './types';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(LOANS_STORE)) {
          db.createObjectStore(LOANS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(BORROWERS_STORE)) {
          db.createObjectStore(BORROWERS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PAYMENTS_STORE)) {
          const store = db.createObjectStore(PAYMENTS_STORE, { keyPath: 'id' });
          store.createIndex('loanId', 'loanId', { unique: false });
        }
      },
    });
  }
  return dbPromise;
};

// Generic CRUD operations
const getAll = async <T,>(storeName: string): Promise<T[]> => {
  const db = await getDb();
  return db.getAll(storeName);
};

const add = async <T,>(storeName: string, item: T): Promise<IDBValidKey> => {
  const db = await getDb();
  return db.add(storeName, item);
};

const put = async <T,>(storeName: string, item: T): Promise<IDBValidKey> => {
  const db = await getDb();
  return db.put(storeName, item);
};

const remove = async (storeName: string, id: string): Promise<void> => {
  const db = await getDb();
  return db.delete(storeName, id);
};

// Borrowers
export const getAllBorrowers = () => getAll<Borrower>(BORROWERS_STORE);
export const addBorrower = (borrower: Borrower) => add(BORROWERS_STORE, borrower);
export const updateBorrower = (borrower: Borrower) => put(BORROWERS_STORE, borrower);
export const deleteBorrower = (id: string) => remove(BORROWERS_STORE, id);

// Loans
export const getAllLoans = () => getAll<Loan>(LOANS_STORE);
export const addLoan = (loan: Loan) => add(LOANS_STORE, loan);
export const updateLoan = (loan: Loan) => put(LOANS_STORE, loan);

export const deleteLoan = async (id: string): Promise<void> => {
  const db = await getDb();
  const tx = db.transaction([LOANS_STORE, PAYMENTS_STORE], 'readwrite');
  const loans = tx.objectStore(LOANS_STORE);
  const payments = tx.objectStore(PAYMENTS_STORE);
  const paymentsIndex = payments.index('loanId');

  // 1. Get all payments for this loan
  const relatedPayments = await paymentsIndex.getAllKeys(id);
  
  // 2. Delete all related payments
  await Promise.all(relatedPayments.map(pid => payments.delete(pid)));
  
  // 3. Delete the loan
  await loans.delete(id);
  
  await tx.done;
};

// Payments
export const getAllPayments = () => getAll<Payment>(PAYMENTS_STORE);
export const getPaymentsForLoan = async (loanId: string): Promise<Payment[]> => {
  const db = await getDb();
  return db.getAllFromIndex(PAYMENTS_STORE, 'loanId', loanId);
};
export const addPayment = (payment: Payment) => add(PAYMENTS_STORE, payment);
export const deletePayment = (id: string) => remove(PAYMENTS_STORE, id);
