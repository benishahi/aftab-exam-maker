import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from './types';
import type { Exam, GenerateExamParams, User, ActivityLog, SchoolResource } from './types';
import { generateMathExam } from './geminiService';
import { storage } from './storage';
import ExamGenerator from './ExamGenerator';
import ExamList from './ExamList';
import ExamView from './ExamView';
import Login from './Login';
import AdminPanel from './AdminPanel';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck, UserCog } from 'lucide-react';

const AftabLogoSVG = ({ className = "w-10 h-10 md:w-16 md:h-16" }: { className?: string }) => (
  <svg viewBox="0 -30 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="80" r="45" fill="url(#sunGradient)" />
    <defs>
      <linearGradient id="sunGradient" x1="100" y1="35" x2="100" y2="125" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
    <path d="M100 135 C100 135, 60 180, 100 220 C140 180, 100 135, 100 135" fill="#F59E0B" fillOpacity="0.2" />
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [exams, setExams] = useState<Exam[]>(storage.getExams());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isBeniShahi = currentUser?.email === 'beni.shahi@gmail.com';
  const isSuperAdmin = useMemo(() => isBeniShahi || currentUser?.role === 'super_admin', [currentUser, isBeniShahi]);
  const isAdmin = useMemo(() => isSuperAdmin || currentUser?.role === 'admin', [isSuperAdmin, currentUser]);

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setViewState(ViewState.DASHBOARD);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-vazir">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-2 md:h-20 gap-2">
            <div className="flex items-center gap-2">
              <AftabLogoSVG />
              <div className="flex flex-col">
                <h1 className="text-sm md:text-xl font-bold text-gray-900 leading-tight">مدارس آفتاب</h1>
                <span className="text-[10px] md:text-xs text-orange-600 font-medium hidden sm:block">INTELLIGENT NETWORK</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="text-right hidden xs:block">
                  <div className="text-xs md:text-sm font-bold text-gray-900">{currentUser.name}</div>
                  <div className="text-[10px] md:text-xs text-orange-600 font-medium">
                    {isSuperAdmin ? 'مدیر کل سامانه آفتاب' : currentUser.role === 'admin' ? 'مدیر مدرسه' : 'آموزگار پایه'}
                  </div>
                </div>
                <div className="p-1 md:p-2 bg-orange-50 rounded-full border border-orange-100">
                  <UserCog className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewState(ViewState.DASHBOARD)} className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all ${viewState === ViewState.DASHBOARD ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <LayoutDashboard className="w-3 h-3 md:w-4 md:h-4" />
                  داشبورد
                </button>
                <button onClick={() => setViewState(ViewState.CREATE_EXAM)} className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all ${viewState === ViewState.CREATE_EXAM ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <PlusCircle className="w-3 h-3 md:w-4 md:h-4" />
                  طراحی آزمون
                </button>
                {isAdmin && (
                  <button onClick={() => setViewState(ViewState.ADMIN)} className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all shadow-sm ${viewState === ViewState.ADMIN ? 'bg-black text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                    <ShieldCheck className="w-3 h-3 md:w-4 md:h-4" />
                    {isSuperAdmin ? 'مرکز فرماندهی' : 'پنل مدیریت'}
                  </button>
                )}
                <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><LogOut className="w-3 h-3 md:w-4 md:h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-3 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {viewState === ViewState.DASHBOARD && (
            <ExamList exams={exams} onViewExam={(exam) => { setSelectedExam(exam); setViewState(ViewState.VIEW_EXAM); }} onDeleteExam={(id) => { storage.deleteExam(id); setExams(storage.getExams()); }} />
          )}
          {viewState === ViewState.CREATE_EXAM && (
            <ExamGenerator onExamGenerated={(exam) => { storage.saveExam(exam); setExams(storage.getExams()); setSelectedExam(exam); setViewState(ViewState.VIEW_EXAM); }} />
          )}
          {viewState === ViewState.VIEW_EXAM && selectedExam && (
            <ExamView exam={selectedExam} onBack={() => setViewState(ViewState.DASHBOARD)} />
          )}
          {viewState === ViewState.ADMIN && isAdmin && <AdminPanel />}
        </div>
      </main>
    </div>
  );
};

export default App;
