
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Borrower, Loan, Payment } from './types';
import * as db from './db';
import { PASSCODE, INACTIVITY_TIMEOUT, GOOGLE_CLIENT_ID } from './constants';
import * as googleApi from './googleApi';
import Dashboard from './components/Dashboard';
import LoansScreen from './components/LoansScreen';
import BorrowersScreen from './components/BorrowersScreen';
import ReportsScreen from './components/ReportsScreen';
import { HomeIcon, ListIcon, UsersIcon, SunIcon, MoonIcon, BarChartIcon, DownloadIcon, CloudIcon, SpinnerIcon, LockIcon } from './components/common/Icons';

type Page = 'dashboard' | 'loans' | 'borrowers' | 'reports';

// AppLock Component
const AppLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    const handleInput = (char: string) => {
        if (input.length < 6) {
            setInput(input + char);
        }
    };
    const handleDelete = () => setInput(input.slice(0, -1));

    useEffect(() => {
        if (input === PASSCODE) {
            onUnlock();
        } else if (input.length >= PASSCODE.length) {
            setError(true);
            setTimeout(() => {
                setInput('');
                setError(false);
            }, 500);
        }
    }, [input, onUnlock]);

    const numpad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

    return (
        <div className="fixed inset-0 bg-secondary dark:bg-secondary-dark z-50 flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold mb-2">Mpiya</h1>
            <p className="mb-6">Enter Passcode</p>
            <div className={`flex space-x-2 mb-6 ${error ? 'animate-shake' : ''}`}>
                {Array(PASSCODE.length).fill(0).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full border-2 ${error ? 'border-red-500' : 'border-primary'} ${i < input.length ? (error ? 'bg-red-500' : 'bg-primary') : ''}`}></div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-4 w-64">
                {numpad.map((char, i) => (
                    <button key={i} onClick={() => char === '⌫' ? handleDelete() : (char && handleInput(char))} disabled={!char}
                        className="text-2xl h-16 rounded-full bg-primary-light dark:bg-slate-700 disabled:opacity-0">
                        {char}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main App Component
export function App() {
    const [page, setPage] = useState<Page>('dashboard');
    const [loans, setLoans] = useState<Loan[]>([]);
    const [borrowers, setBorrowers] = useState<Borrower[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState<Event | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const inactivityTimer = useRef<number | null>(null);

    const lockApp = useCallback(() => setIsLocked(true), []);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        inactivityTimer.current = window.setTimeout(lockApp, INACTIVITY_TIMEOUT);
    }, [lockApp]);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // Initialize Google API
        googleApi.initializeGoogleApi().then(() => {
            console.log("Google API Initialized");
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    useEffect(() => {
        const preferredTheme = localStorage.getItem('theme');
        if (preferredTheme === 'dark' || (!preferredTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        }

        if(!isLocked){
          window.addEventListener('mousemove', resetInactivityTimer);
          window.addEventListener('keypress', resetInactivityTimer);
          resetInactivityTimer();
        }

        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('keypress', resetInactivityTimer);
        };
    }, [isLocked, resetInactivityTimer]);
    
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    const handleInstallClick = async () => {
        if (!installPromptEvent) return;
        (installPromptEvent as any).prompt();
        const { outcome } = await (installPromptEvent as any).userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        setInstallPromptEvent(null);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [b, l, p] = await Promise.all([db.getAllBorrowers(), db.getAllLoans(), db.getAllPayments()]);
            setBorrowers(b);
            setLoans(l);
            setPayments(p);
        } catch (error) {
            console.error("Failed to load data from DB", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if(!isLocked) {
           loadData();
        }
    }, [isLocked, loadData]);
    
    const handleSync = async () => {
        if (GOOGLE_CLIENT_ID.includes("YOUR_CLIENT_ID")) {
            alert("To use Cloud Sync, you must configure the GOOGLE_CLIENT_ID and GOOGLE_API_KEY in constants.ts with your own credentials from the Google Cloud Console.");
            return;
        }

        setIsSyncing(true);
        try {
            // 1. Auth
            if (!googleApi.getValidToken()) {
                await googleApi.handleAuthClick();
            }
            
            // 2. Sync
            const data = { loans, borrowers, payments };
            await Promise.all([
                googleApi.syncToDrive(data),
                googleApi.syncToSheets(data)
            ]);
            alert("Synced successfully to Drive and Sheets!");
        } catch (error) {
            console.error("Sync failed", error);
            alert("Sync failed: " + JSON.stringify(error));
        } finally {
            setIsSyncing(false);
        }
    };

    // Data manipulation functions
    const addBorrower = async (borrower: Borrower) => { await db.addBorrower(borrower); await loadData(); };
    const updateBorrower = async (borrower: Borrower) => { await db.updateBorrower(borrower); await loadData(); };
    const addLoan = async (loan: Loan) => { await db.addLoan(loan); await loadData(); };
    const updateLoan = async (loan: Loan) => { await db.updateLoan(loan); await loadData(); };
    const deleteLoan = async (id: string) => { 
        try {
            await db.deleteLoan(id); 
            await loadData(); 
        } catch (e) {
            console.error("Failed to delete loan", e);
            alert("Failed to delete loan. See console for details.");
        }
    };
    const addPayment = async (payment: Payment) => { await db.addPayment(payment); await loadData(); };

    if (isLocked) {
        return <AppLock onUnlock={() => setIsLocked(false)} />;
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    const handleSelectLoan = (loan: Loan) => {
        setPage('loans');
    }

    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <Dashboard loans={loans} borrowers={borrowers} payments={payments} onSelectLoan={handleSelectLoan}/>;
            case 'loans':
                return <LoansScreen loans={loans} borrowers={borrowers} payments={payments} addLoan={addLoan} updateLoan={updateLoan} deleteLoan={deleteLoan} addPayment={addPayment} />;
            case 'borrowers':
                return <BorrowersScreen loans={loans} borrowers={borrowers} payments={payments} addBorrower={addBorrower} updateBorrower={updateBorrower} />;
            case 'reports':
                return <ReportsScreen loans={loans} borrowers={borrowers} payments={payments} />;
            default:
                return <Dashboard loans={loans} borrowers={borrowers} payments={payments} onSelectLoan={handleSelectLoan} />;
        }
    };

    const NavItem: React.FC<{ label: string; icon: React.ReactNode; targetPage: Page }> = ({ label, icon, targetPage }) => (
        <button onClick={() => setPage(targetPage)} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 ${page === targetPage ? 'text-primary dark:text-accent' : 'text-slate-500'}`}>
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );

    return (
        <div className="h-screen flex flex-col">
            <header className="p-4 flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold text-primary dark:text-accent mr-2">Mpiya</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={handleSync} title="Sync to Cloud">
                        {isSyncing ? <SpinnerIcon /> : <CloudIcon />}
                    </button>
                    {installPromptEvent && (
                        <button onClick={handleInstallClick} title="Install App">
                            <DownloadIcon />
                        </button>
                    )}
                    <button onClick={toggleDarkMode} title="Toggle dark mode">
                        {isDarkMode ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <button onClick={lockApp} title="Lock App">
                        <LockIcon />
                    </button>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto pb-20">
                <div className="max-w-2xl mx-auto">
                    {renderPage()}
                </div>
            </main>
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around z-10">
                <NavItem label="Dashboard" icon={<HomeIcon />} targetPage="dashboard" />
                <NavItem label="Loans" icon={<ListIcon />} targetPage="loans" />
                <NavItem label="Borrowers" icon={<UsersIcon />} targetPage="borrowers" />
                <NavItem label="Reports" icon={<BarChartIcon />} targetPage="reports" />
            </nav>
        </div>
    );
};
