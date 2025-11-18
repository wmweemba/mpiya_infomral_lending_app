
import React, { useState } from 'react';
import type { Borrower, Loan, Payment } from '../types';
import { formatCurrency, calculateLoanTotals } from '../utils';
import { PlusIcon, UsersIcon } from './common/Icons';

interface BorrowerFormProps {
  borrower?: Borrower;
  onSave: (borrower: Borrower) => void;
  onCancel: () => void;
}

const BorrowerForm: React.FC<BorrowerFormProps> = ({ borrower, onSave, onCancel }) => {
  const [name, setName] = useState(borrower?.name || '');
  const [phone, setPhone] = useState(borrower?.phone || '');
  const [notes, setNotes] = useState(borrower?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    onSave({
      id: borrower?.id || crypto.randomUUID(),
      createdAt: borrower?.createdAt || new Date().toISOString(),
      name,
      phone,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
      <div className="bg-secondary dark:bg-secondary-dark p-6 rounded-lg w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">{borrower ? 'Edit' : 'Add'} Borrower</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
            <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2" />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white">Save Borrower</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BorrowersScreenProps {
  borrowers: Borrower[];
  loans: Loan[];
  payments: Payment[];
  addBorrower: (borrower: Borrower) => void;
  updateBorrower: (borrower: Borrower) => void;
}

const BorrowersScreen: React.FC<BorrowersScreenProps> = ({ borrowers, loans, payments, addBorrower, updateBorrower }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBorrower, setEditingBorrower] = useState<Borrower | undefined>(undefined);

  const handleSave = (borrower: Borrower) => {
    if (borrowers.some(b => b.id === borrower.id)) {
      updateBorrower(borrower);
    } else {
      addBorrower(borrower);
    }
    setIsFormOpen(false);
    setEditingBorrower(undefined);
  };

  const borrowersWithDebt = borrowers.map(borrower => {
    const borrowerLoans = loans.filter(l => l.borrowerId === borrower.id && l.status === 'active');
    const totalDebt = borrowerLoans.reduce((acc, loan) => {
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const totals = calculateLoanTotals(loan, loanPayments);
      return acc + totals.balance;
    }, 0);
    return { ...borrower, totalDebt };
  }).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Borrowers</h1>
        <button onClick={() => { setEditingBorrower(undefined); setIsFormOpen(true); }} className="bg-primary text-white p-2 rounded-full shadow-lg">
          <PlusIcon />
        </button>
      </div>
      
      {borrowersWithDebt.length > 0 ? (
        <div className="space-y-3">
          {borrowersWithDebt.map(borrower => (
            <div key={borrower.id} onClick={() => { setEditingBorrower(borrower); setIsFormOpen(true); }} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{borrower.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{borrower.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500">{formatCurrency(borrower.totalDebt)}</p>
                  <p className="text-xs text-slate-400">Current Debt</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg">
            <UsersIcon className="mx-auto w-12 h-12 text-slate-400"/>
            <p className="mt-4 text-slate-500 dark:text-slate-400">No borrowers yet.</p>
            <p className="text-sm text-slate-400">Click the '+' button to add one.</p>
        </div>
      )}

      {isFormOpen && (
        <BorrowerForm
          borrower={editingBorrower}
          onSave={handleSave}
          onCancel={() => { setIsFormOpen(false); setEditingBorrower(undefined); }}
        />
      )}
    </div>
  );
};

export default BorrowersScreen;
