import React, { useState, useMemo } from 'react';
import { ViewState } from './types';
import type { Exam, User } from './types';
import { storage } from './storage';
import ExamGenerator from './ExamGenerator';
import ExamList from './ExamList';
import ExamView from './ExamView';
import Login from './Login';
import AdminPanel from './AdminPanel';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck, UserCog } from 'lucide-react';

const Logo = () => (
  <svg viewBox="0 0 200 200" className="w-8 h-8 md:w-12 md:h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="80" fill="#F59E0B" />
    <path d="M100 50 L130 150 L70 150 Z" fill="white" />
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [exams, setExams] = useState<Exam[]>(storage.getExams());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const isBeniShahi = currentUser?.email === 'beni.shahi@gmail.com';
  const isSuperAdmin = useMemo(() => isBeniShahi || currentUser?.role === 'super_admin', [currentUser, isBeniShahi]);

  if (!currentUser) return <Login onLoginSuccess={setCurrentUser} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-vazir text-right" dir="rtl">
      <header className="bg-white border-b sticky top-0 z-50 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-sm md:text-xl font-bold">مدارس آفتاب</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            {isSuperAdmin && (
              <button onClick={() => setViewState(ViewState.ADMIN)} className={`px-2 py-1 rounded-md text-[10px] md:text-xs flex items-center gap-1 ${viewState === ViewState.ADMIN ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}>
                <ShieldCheck size={14} /> <span className="hidden sm:inline">گاد مود</span>
              </button>
            )}
            <button onClick={() => setViewState(ViewState.CREATE_EXAM)} className="p-1.5 bg-gray-100 rounded-md text-orange-600"><PlusCircle size={18} /></button>
            <button onClick={() => setViewState(ViewState.DASHBOARD)} className="p-1.5 bg-gray-100 rounded-md text-gray-600"><LayoutDashboard size={18} /></button>
            <button onClick={() => { storage.logout(); setCurrentUser(null); }} className="p-1.5 text-red-500"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 max-w-7xl mx-auto w-full">
        {viewState === ViewState.DASHBOARD && <ExamList exams={exams} onViewExam={(e) => { setSelectedExam(e); setViewState(ViewState.VIEW_EXAM); }} onDeleteExam={(id) => { storage.deleteExam(id); setExams(storage.getExams()); }} />}
        {viewState === ViewState.CREATE_EXAM && <ExamGenerator onExamGenerated={(e) => { storage.saveExam(e); setExams(storage.getExams()); setSelectedExam(e); setViewState(ViewState.VIEW_EXAM); }} />}
        {viewState === ViewState.VIEW_EXAM && selectedExam && <ExamView exam={selectedExam} onBack={() => setViewState(ViewState.DASHBOARD)} />}
        {viewState === ViewState.ADMIN && isSuperAdmin && <AdminPanel />}
      </main>
    </div>
  );
};

export default App;
