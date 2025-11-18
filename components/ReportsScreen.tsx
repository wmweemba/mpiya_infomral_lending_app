import React from 'react';
import type { Loan, Borrower, Payment } from '../types';
import { calculateLoanTotals, formatCurrency, getLoanStatus } from '../utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Augment the window object to declare the global jsPDF variable for TypeScript
declare global {
  interface Window {
    jsPDF: typeof jsPDF;
  }
}

interface ReportsScreenProps {
  loans: Loan[];
  borrowers: Borrower[];
  payments: Payment[];
}

const StatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
  <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm ${className}`}>
    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
  </div>
);

const ReportsScreen: React.FC<ReportsScreenProps> = ({ loans, borrowers, payments }) => {
  const summary = loans.reduce((acc, loan) => {
    const loanPayments = payments.filter(p => p.loanId === loan.id);
    const totals = calculateLoanTotals(loan, loanPayments);
    
    acc.totalLent += loan.principal;
    acc.totalProfit += totals.simpleInterest + totals.overduePenalty;
    if (loan.status === 'active') {
        acc.totalOutstanding += totals.balance;
    }
    
    return acc;
  }, { totalLent: 0, totalOutstanding: 0, totalProfit: 0 });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const getFullLoanDetails = () => {
     return loans.map(loan => {
      const borrower = borrowers.find(b => b.id === loan.borrowerId)?.name || 'N/A';
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const totals = calculateLoanTotals(loan, loanPayments);
      const status = getLoanStatus(loan, totals.totalPaid);
      return {
        borrower,
        principal: loan.principal,
        interestRate: loan.interestRate,
        issueDate: new Date(loan.issueDate).toLocaleDateString(),
        dueDate: new Date(loan.dueDate).toLocaleDateString(),
        totalDue: totals.totalDue,
        totalPaid: totals.totalPaid,
        balance: totals.balance,
        status,
      };
    });
  }

  const handleExportCSV = () => {
    const loanDetails = getFullLoanDetails();
    const headers = ['Borrower', 'Principal', 'Interest Rate (%)', 'Issue Date', 'Due Date', 'Total Due', 'Total Paid', 'Balance', 'Status'];
    const csvContent = [
      headers.join(','),
      ...loanDetails.map(d => Object.values(d).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'mpiya_loans_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const loanDetails = getFullLoanDetails();

    doc.text("Mpiya Loans Report", 14, 16);
    (doc as any).autoTable({
        head: [['Borrower', 'Principal', 'Due Date', 'Total Due', 'Paid', 'Balance', 'Status']],
        body: loanDetails.map(d => [
            d.borrower,
            formatCurrency(d.principal),
            d.dueDate,
            formatCurrency(d.totalDue),
            formatCurrency(d.totalPaid),
            formatCurrency(d.balance),
            d.status
        ]),
        startY: 20,
    });
    doc.save('mpiya_loans_report.pdf');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Lent" value={formatCurrency(summary.totalLent)} />
        <StatCard title="Total Collected" value={formatCurrency(totalCollected)} className="text-green-600 dark:text-green-400" />
        <StatCard title="Total Outstanding" value={formatCurrency(summary.totalOutstanding)} className="text-red-500 dark:text-red-400" />
        <StatCard title="Expected Profit" value={formatCurrency(summary.totalProfit)} className="text-blue-500 dark:text-blue-400"/>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Export Data</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Download a full report of all your loans in CSV or PDF format.</p>
        <div className="flex space-x-4">
          <button onClick={handleExportCSV} className="flex-1 px-4 py-2 rounded-md bg-primary-light dark:bg-slate-700 text-primary-dark dark:text-primary-light font-semibold">Export as CSV</button>
          <button onClick={handleExportPDF} className="flex-1 px-4 py-2 rounded-md bg-primary-light dark:bg-slate-700 text-primary-dark dark:text-primary-light font-semibold">Export as PDF</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
