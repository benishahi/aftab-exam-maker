import React, { useState, useMemo } from 'react';
import { ViewState } from './types';
import { storage } from './storage';
import ExamGenerator from './ExamGenerator';
import ExamList from './ExamList';
import ExamView from './ExamView';
import Login from './Login';
import AdminPanel from './AdminPanel';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(storage.getCurrentUser());
  const [view, setView] = useState(ViewState.DASHBOARD);
  const [exams, setExams] = useState(storage.getExams());
  const [selected, setSelected] = useState(null);

  const isBeni = useMemo(() => user?.email === 'beni.shahi@gmail.com', [user]);

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-vazir text-right" dir="rtl">
      <header className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-orange-600">مدارس آفتاب</h1>
        <div className="flex gap-2">
          {isBeni && (
            <button onClick={() => setView(ViewState.ADMIN)} className={`p-2 rounded ${view === ViewState.ADMIN ? 'bg-black text-white' : 'bg-orange-500 text-white'}`}>
              <ShieldCheck size={18}/>
            </button>
          )}
          <button onClick={() => setView(ViewState.CREATE_EXAM)} className="p-2 bg-orange-50 text-orange-600 rounded"><PlusCircle size={20}/></button>
          <button onClick={() => setView(ViewState.DASHBOARD)} className="p-2 bg-gray-100 text-gray-600 rounded"><LayoutDashboard size={20}/></button>
          <button onClick={() => { storage.logout(); setUser(null); }} className="p-2 text-red-400"><LogOut size={20}/></button>
        </div>
      </header>
      <main className="p-4 max-w-7xl mx-auto w-full">
        {view === ViewState.DASHBOARD && <ExamList exams={exams} onViewExam={(e) => { setSelected(e); setView(ViewState.VIEW_EXAM); }} onDeleteExam={(id) => { storage.deleteExam(id); setExams(storage.getExams()); }} />}
        {view === ViewState.CREATE_EXAM && <ExamGenerator onExamGenerated={(e) => { storage.saveExam(e); setExams(storage.getExams()); setSelected(e); setView(ViewState.VIEW_EXAM); }} />}
        {view === ViewState.VIEW_EXAM && selected && <ExamView exam={selected} onBack={() => setView(ViewState.DASHBOARD)} />}
        {view === ViewState.ADMIN && isBeni && <AdminPanel />}
      </main>
    </div>
  );
}
