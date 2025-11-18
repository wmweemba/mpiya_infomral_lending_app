
export type TenorType = '1_week' | '2_weeks' | '3_weeks' | '4_weeks' | 'custom';

export enum LoanStatus {
  Active = 'Active',
  Upcoming = 'Upcoming',
  DueToday = 'Due Today',
  Overdue = 'Overdue',
  Paid = 'Paid',
}

export interface Borrower {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  principal: number;
  interestRate: number; // as a percentage, e.g., 15 for 15%
  issueDate: string; // ISO string
  dueDate: string; // ISO string
  tenorType: TenorType;
  customTenorDays?: number;
  status: 'active' | 'paid'; // 'active' covers upcoming, due, overdue. 'paid' is final.
  createdAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string; // ISO string
  createdAt:string;
}
