
import React, { useState, useMemo } from 'react';
import type { Borrower, Loan, Payment, TenorType } from '../types';
import { LoanStatus } from '../types';
import { calculateLoanTotals, formatCurrency, getLoanStatus, getStatusColor } from '../utils';
import { TENOR_OPTIONS } from '../constants';
import { PlusIcon, PencilIcon, TrashIcon } from './common/Icons';

// Sub-component for Add/Edit Loan Form
interface LoanFormProps {
    loan?: Loan;
    borrowers: Borrower[];
    onSave: (loan: Loan) => void;
    onCancel: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, borrowers, onSave, onCancel }) => {
    const [borrowerId, setBorrowerId] = useState(loan?.borrowerId || (borrowers[0]?.id || ''));
    const [principal, setPrincipal] = useState(loan?.principal || '');
    const [tenorType, setTenorType] = useState<TenorType>(loan?.tenorType || '1_week');
    const [customTenorDays, setCustomTenorDays] = useState(loan?.customTenorDays || 7);
    const [customInterest, setCustomInterest] = useState(loan?.interestRate || 10);
    const [issueDate, setIssueDate] = useState(loan?.issueDate ? loan.issueDate.split('T')[0] : new Date().toISOString().split('T')[0]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const principalAmount = Number(principal);
        if (!borrowerId || !principalAmount || principalAmount <= 0) return;

        let interestRate = 0;
        let tenorDays = 0;

        if (tenorType === 'custom') {
            interestRate = Number(customInterest);
            tenorDays = Number(customTenorDays);
        } else {
            const selectedTenor = TENOR_OPTIONS.find(t => t.value === tenorType);
            if(selectedTenor) {
                interestRate = selectedTenor.interest;
                tenorDays = selectedTenor.days;
            }
        }
        
        const issueDateObj = new Date(issueDate);
        const dueDateObj = new Date(issueDateObj);
        dueDateObj.setDate(issueDateObj.getDate() + tenorDays);

        const newLoan: Loan = {
            id: loan?.id || crypto.randomUUID(),
            createdAt: loan?.createdAt || new Date().toISOString(),
            borrowerId,
            principal: principalAmount,
            interestRate,
            issueDate: issueDateObj.toISOString(),
            dueDate: dueDateObj.toISOString(),
            tenorType,
            customTenorDays: tenorType === 'custom' ? tenorDays : undefined,
            status: loan?.status || 'active',
        };
        onSave(newLoan);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg w-full max-w-md m-4 max-h-screen overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{loan ? 'Edit' : 'New'} Loan</h2>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="borrower" className="block text-sm font-medium">Borrower</label>
                        <select id="borrower" value={borrowerId} onChange={e => setBorrowerId(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2">
                            <option value="" disabled>Select a borrower</option>
                            {borrowers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="principal" className="block text-sm font-medium">Principal Amount (ZMW)</label>
                        <input id="principal" type="number" value={principal} onChange={e => setPrincipal(e.target.value)} required min="1" className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="tenor" className="block text-sm font-medium">Tenor</label>
                        <select id="tenor" value={tenorType} onChange={e => setTenorType(e.target.value as TenorType)} className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2">
                            {TENOR_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label} ({t.interest}%)</option>)}
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    {tenorType === 'custom' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="customTenorDays" className="block text-sm font-medium">Days</label>
                                <input id="customTenorDays" type="number" value={customTenorDays} onChange={e => setCustomTenorDays(Number(e.target.value))} required min="1" className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label htmlFor="customInterest" className="block text-sm font-medium">Interest (%)</label>
                                <input id="customInterest" type="number" value={customInterest} onChange={e => setCustomInterest(Number(e.target.value))} required min="0" className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium">Issue Date</label>
                        <input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save Loan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Sub-component for Loan Details
interface LoanDetailProps {
    loan: Loan;
    borrower?: Borrower;
    payments: Payment[];
    onClose: () => void;
    onRecordPayment: (loanId: string, amount: number) => void;
    onMarkAsPaid: (loan: Loan) => void;
    onEdit: (loan: Loan) => void;
    onDelete: (loan: Loan) => void;
}

const LoanDetail: React.FC<LoanDetailProps> = ({ loan, borrower, payments, onClose, onRecordPayment, onMarkAsPaid, onEdit, onDelete }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const totals = calculateLoanTotals(loan, payments);
    const status = getLoanStatus(loan, totals.totalPaid);

    const handlePayment = () => {
        const amount = parseFloat(paymentAmount);
        if (amount > 0) {
            onRecordPayment(loan.id, amount);
            setPaymentAmount('');
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this loan for ${borrower?.name}? This action cannot be undone.`)) {
            onDelete(loan);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
            <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg w-full max-w-md m-4 max-h-screen overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Loan Details</h2>
                     <div className="flex space-x-2">
                        <button onClick={() => onEdit(loan)} className="text-slate-500 hover:text-primary p-1">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleDelete} className="text-slate-500 hover:text-red-500 p-1">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="text-2xl leading-none ml-2">&times;</button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{borrower?.name || '...'}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Principal</span> <span>{formatCurrency(totals.principal)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Interest ({loan.interestRate}%)</span> <span>{formatCurrency(totals.simpleInterest)}</span></div>
                        <div className="flex justify-between text-red-500"><span className="text-slate-500 dark:text-slate-400">Overdue Penalty</span> <span>{formatCurrency(totals.overduePenalty)}</span></div>
                        <hr className="border-slate-200 dark:border-slate-700"/>
                        <div className="flex justify-between font-bold"><span className="">Total Due</span> <span>{formatCurrency(totals.totalDue)}</span></div>
                        <div className="flex justify-between text-green-600"><span className="text-slate-500 dark:text-slate-400">Paid</span> <span>{formatCurrency(totals.totalPaid)}</span></div>
                         <hr className="border-slate-200 dark:border-slate-700"/>
                        <div className="flex justify-between font-bold text-lg"><span className="">Balance</span> <span>{formatCurrency(totals.balance)}</span></div>
                    </div>
                    
                    {loan.status === 'active' && (
                        <div className="space-y-2">
                             <div className="flex space-x-2">
                                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Enter payment" className="flex-grow bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2"/>
                                <button onClick={handlePayment} className="px-4 py-2 rounded-md bg-accent text-white font-semibold">Pay</button>
                             </div>
                            {totals.balance > 0 && <button onClick={() => onRecordPayment(loan.id, totals.balance)} className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-sm">Pay Full Balance</button>}
                            <button onClick={() => onMarkAsPaid(loan)} className="w-full px-4 py-2 rounded-md bg-primary text-white font-semibold">Mark as Fully Paid</button>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold mb-2">Payment History</h3>
                        {payments.length > 0 ? (
                            <ul className="space-y-1 text-sm bg-white dark:bg-slate-800 p-2 rounded-lg">
                                {payments.map(p => (
                                    <li key={p.id} className="flex justify-between">
                                        <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                                        <span>{formatCurrency(p.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">No payments yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Main screen component
interface LoansScreenProps {
  loans: Loan[];
  borrowers: Borrower[];
  payments: Payment[];
  addLoan: (loan: Loan) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  addPayment: (payment: Payment) => void;
}

const LoansScreen: React.FC<LoansScreenProps> = ({ loans, borrowers, payments, addLoan, updateLoan, deleteLoan, addPayment }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | undefined>(undefined);
  const [loanToEdit, setLoanToEdit] = useState<Loan | undefined>(undefined);
  const [filter, setFilter] = useState<string>('All');
  
  const loansWithDetails = useMemo(() => {
    return loans.map(loan => {
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const totals = calculateLoanTotals(loan, loanPayments);
      const status = getLoanStatus(loan, totals.totalPaid);
      const borrower = borrowers.find(b => b.id === loan.borrowerId);
      return { loan, totals, status, borrower };
    }).sort((a,b) => new Date(b.loan.issueDate).getTime() - new Date(a.loan.issueDate).getTime());
  }, [loans, borrowers, payments]);

  const filteredLoans = useMemo(() => {
      if (filter === 'All') return loansWithDetails;
      return loansWithDetails.filter(l => l.status === filter);
  }, [loansWithDetails, filter]);
  

  const handleSaveLoan = (loan: Loan) => {
    if (loans.some(l => l.id === loan.id)) {
      updateLoan(loan);
    } else {
      addLoan(loan);
    }
    setIsFormOpen(false);
    setLoanToEdit(undefined);
  };
  
  const handleRecordPayment = (loanId: string, amount: number) => {
    addPayment({
      id: crypto.randomUUID(),
      loanId,
      amount,
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  };

  const handleMarkAsPaid = (loan: Loan) => {
      updateLoan({...loan, status: 'paid'});
      setSelectedLoan(undefined);
  };

  const handleEditLoan = (loan: Loan) => {
      setSelectedLoan(undefined);
      setLoanToEdit(loan);
      setIsFormOpen(true);
  };

  const handleDeleteLoan = (loan: Loan) => {
      deleteLoan(loan.id);
      setSelectedLoan(undefined);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Loans</h1>
        <button onClick={() => { setLoanToEdit(undefined); setIsFormOpen(true); }} className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
          <PlusIcon />
        </button>
      </div>

      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2">
            <option>All</option>
            {Object.values(LoanStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredLoans.map(({ loan, totals, status, borrower }) => (
          <div key={loan.id} onClick={() => setSelectedLoan(loan)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{borrower?.name || 'Unknown Borrower'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                <div className="mt-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(status)}`}>{status}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-semibold text-lg mb-2">{formatCurrency(totals.balance)}</p>
                <div className="flex space-x-1">
                   <button onClick={(e) => {
                        e.stopPropagation();
                        handleEditLoan(loan);
                    }} className="p-2 text-slate-400 hover:text-primary bg-slate-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Edit Loan">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete this loan for ${borrower?.name}? This cannot be undone.`)) {
                            handleDeleteLoan(loan);
                        }
                    }} className="p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors" aria-label="Delete Loan">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredLoans.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No loans found.
            </div>
        )}
      </div>

      {isFormOpen && (
        <LoanForm 
            loan={loanToEdit}
            borrowers={borrowers} 
            onSave={handleSaveLoan} 
            onCancel={() => { setIsFormOpen(false); setLoanToEdit(undefined); }}
        />
      )}
      {selectedLoan && (
        <LoanDetail 
            loan={selectedLoan}
            borrower={borrowers.find(b => b.id === selectedLoan.borrowerId)}
            payments={payments.filter(p => p.loanId === selectedLoan.id)}
            onClose={() => setSelectedLoan(undefined)}
            onRecordPayment={handleRecordPayment}
            onMarkAsPaid={handleMarkAsPaid}
            onEdit={handleEditLoan}
            onDelete={handleDeleteLoan}
        />
      )}
    </div>
  );
};

export default LoansScreen;
