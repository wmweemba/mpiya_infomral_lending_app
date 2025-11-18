
import React from 'react';
import type { Loan, Borrower, Payment } from '../types';
import { calculateLoanTotals, formatCurrency, getLoanStatus, getStatusColor } from '../utils';

interface DashboardProps {
  loans: Loan[];
  borrowers: Borrower[];
  payments: Payment[];
  onSelectLoan: (loan: Loan) => void;
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
  <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm ${className}`}>
    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ loans, borrowers, payments, onSelectLoan }) => {
  const activeLoans = loans.filter(l => l.status === 'active');
  const stats = activeLoans.reduce((acc, loan) => {
    const loanPayments = payments.filter(p => p.loanId === loan.id);
    const totals = calculateLoanTotals(loan, loanPayments);

    acc.totalPrincipal += totals.principal;
    acc.totalInterest += totals.simpleInterest;
    if (getLoanStatus(loan, totals.totalPaid) === 'Overdue') {
        acc.totalOverdue += totals.balance > 0 ? totals.balance : 0;
    }
    return acc;
  }, { totalPrincipal: 0, totalInterest: 0, totalOverdue: 0 });

  const loansDueNext7Days = activeLoans.filter(loan => {
      const dueDate = new Date(loan.dueDate);
      const today = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(today.getDate() + 7);
      return dueDate >= today && dueDate <= oneWeekFromNow;
  }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Active Loans" value={activeLoans.length.toString()} />
        <StatCard title="Outstanding Principal" value={formatCurrency(stats.totalPrincipal)} />
        <StatCard title="Expected Interest" value={formatCurrency(stats.totalInterest)} />
        <StatCard title="Total Overdue" value={formatCurrency(stats.totalOverdue)} className="text-red-500 dark:text-red-400" />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Due Soon</h2>
        <div className="space-y-3">
          {loansDueNext7Days.length > 0 ? (
            loansDueNext7Days.map(loan => {
              const borrower = borrowers.find(b => b.id === loan.borrowerId);
              const loanPayments = payments.filter(p => p.loanId === loan.id);
              const totals = calculateLoanTotals(loan, loanPayments);
              const status = getLoanStatus(loan, totals.totalPaid);

              return (
                <div key={loan.id} onClick={() => onSelectLoan(loan)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex justify-between items-center cursor-pointer">
                  <div>
                    <p className="font-bold">{borrower?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(totals.balance)}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg">
              <p className="text-slate-500 dark:text-slate-400">No loans due in the next 7 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
