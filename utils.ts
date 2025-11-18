
import { type Loan, LoanStatus, type Payment } from './types';
import { OVERDUE_PENALTY_RATE } from './constants';

export const formatCurrency = (amount: number): string => {
  return `ZMW ${new Intl.NumberFormat('en-US').format(amount)}`;
};

export const getLoanStatus = (loan: Loan, totalPaid: number): LoanStatus => {
  if (loan.status === 'paid') return LoanStatus.Paid;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(loan.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const issueDate = new Date(loan.issueDate);
  issueDate.setHours(0, 0, 0, 0);
  
  if (today < issueDate) return LoanStatus.Upcoming;

  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return LoanStatus.Overdue;
  if (diffDays === 0) return LoanStatus.DueToday;

  return LoanStatus.Active;
};

export const calculateLoanTotals = (loan: Loan, payments: Payment[]) => {
  const principal = loan.principal;
  const simpleInterest = principal * (loan.interestRate / 100);
  const totalDueWithoutPenalties = principal + simpleInterest;
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  let overduePenalty = 0;
  if (today > dueDate && loan.status === 'active') {
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.max(0, diffTime / (1000 * 60 * 60 * 24));
    const weeksOverdue = Math.floor(diffDays / 7);
    if (weeksOverdue > 0) {
      overduePenalty = principal * (OVERDUE_PENALTY_RATE / 100) * weeksOverdue;
    }
  }

  const totalDue = totalDueWithoutPenalties + overduePenalty;
  const balance = totalDue - totalPaid;

  return {
    principal,
    simpleInterest,
    overduePenalty,
    totalDue,
    totalPaid,
    balance,
  };
};

export const getStatusColor = (status: LoanStatus): string => {
  switch (status) {
    case LoanStatus.Paid:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case LoanStatus.Overdue:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case LoanStatus.DueToday:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case LoanStatus.Upcoming:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};