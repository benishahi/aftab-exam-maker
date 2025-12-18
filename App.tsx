import React, { useState, useEffect, useMemo } from 'react';
// اصلاح مهم: ایمپورت ViewState و تایپ‌ها با پسوند صریح برای سازگاری با محیط بیلد
import { ViewState } from './types.ts';
import type { Exam, GenerateExamParams, User, ActivityLog, SchoolResource } from './types.ts';
import { generateMathExam } from './geminiService.ts';
import { storage } from './storage.ts';
import ExamGenerator from './ExamGenerator.tsx';
import ExamList from './ExamList.tsx';
import ExamView from './ExamView.tsx';
import Login from './Login.tsx';
import AdminPanel from './AdminPanel.tsx';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck, UserCog } from 'lucide-react';

const AftabLogoSVG = ({ className = "w-16 h-16" }: { className?: string }) => (
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
  const [loginError, setLoginError] = useState<string>('');

  const users = storage.getUsers();
  const logs = storage.getLogs();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleLogin = (u: User) => {
    storage.setCurrentUser(u);
    setCurrentUser(u);
    setLoginError('');
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setViewState(ViewState.DASHBOARD);
  };

  const handleAddUser = (u: User) => {
    storage.saveUser(u);
  };

  const handleDeleteUser = (id: string) => {
    storage.deleteUser(id);
  };

  const filteredExams = useMemo(() => {
    if (!currentUser) return [];
    if (isSuperAdmin) return exams;
    if (isAdmin) return exams.filter(e => e.schoolName === currentUser.schoolName);
    return exams.filter(e => e.creatorId === currentUser.id);
  }, [exams, currentUser, isAdmin, isSuperAdmin]);

  const handleGenerateExam = async (params: GenerateExamParams) => {
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const exam = await generateMathExam(params, currentUser);
      storage.saveExam(exam);
      setExams(prev => [exam, ...prev]);
      setSelectedExam(exam);
      setViewState(ViewState.EXAM_VIEW);
    } catch (error) {
      console.error('Error generating exam:', error);
      alert('خطا در ارتباط با هوش مصنوعی. لطفا تنظیمات API Key را چک کنید.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;

  return (
    <div className="min-h-screen bg-slate-50 font-[Vazirmatn] text-right text-slate-800 selection:bg-amber-100" dir="rtl">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-2 flex justify-between items-center shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-95" onClick={() => setViewState(ViewState.DASHBOARD)}>
            <AftabLogoSVG className="w-24 h-24" />
            <div className="hidden lg:block -mr-4">
              <h1 className="text-5xl font-normal text-slate-800 font-nastaliq leading-none">مدارس آفتاب</h1>
              <p className="text-[9px] text-amber-600 font-black tracking-widest uppercase opacity-70">Intelligent Network</p>
            </div>
          </div>
          
          <div className="flex gap-1 mr-4 bg-slate-100/50 p-1.5 rounded-2xl">
            <button onClick={() => setViewState(ViewState.DASHBOARD)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewState === ViewState.DASHBOARD ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <LayoutDashboard className="w-4 h-4" /> داشبورد
            </button>
            <button onClick={() => setViewState(ViewState.GENERATOR)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewState === ViewState.GENERATOR ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <PlusCircle className="w-4 h-4 text-amber-500" /> طراحی آزمون
            </button>
            {isAdmin && (
              <button onClick={() => setViewState(ViewState.ADMIN_PANEL)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewState === ViewState.ADMIN_PANEL ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                {isSuperAdmin ? <ShieldCheck className="w-4 h-4 text-amber-400" /> : <UserCog className="w-4 h-4 text-amber-400" />}
                {isSuperAdmin ? 'مرکز فرماندهی' : 'مدیریت کاربران'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end border-l border-slate-200 pl-4">
            {/* اصلاح امن برای نمایش نام کامل کاربر */}
            <span className="text-sm font-black text-slate-900 leading-none mb-1">{currentUser?.fullName || 'کاربر سیستم'}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${isSuperAdmin ? 'bg-amber-100 text-amber-700' : currentUser?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
               {isSuperAdmin ? 'مدیر کل سامانه' : currentUser?.role === 'admin' ? 'مدیر واحد آموزشی' : 'آموزگار پایه'}
            </span>
          </div>
          <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {viewState === ViewState.DASHBOARD && (
          <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <div>
                {/* اصلاح امن بخش split برای جلوگیری از ارور صفحه سفید */}
                <h2 className="text-3xl font-black text-slate-900">درود بر شما، {currentUser?.fullName?.split(' ')[0] || 'همکار گرامی'}</h2>
                <p className="text-slate-500 font-bold mt-2">
                  {isSuperAdmin ? 'شما در حال مشاهده وضعیت کل شبکه مدارس آفتاب هستید.' : `پنل اختصاصی واحد آموزشی ${currentUser?.schoolName || 'آفتاب'}.`}
                </p>
              </div>
              <button onClick={() => setViewState(ViewState.GENERATOR)} className="mt-6 md:mt-0 flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-black shadow-xl hover:bg-black hover:-translate-y-1 transition-all group">
                <PlusCircle className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform" /> شروع طراحی آزمون جدید
              </button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
               <ExamList exams={filteredExams} currentUser={currentUser} onSelectExam={(e) => { setSelectedExam(e); setViewState(ViewState.EXAM_VIEW); }} onDeleteExam={(id) => setExams(prev => prev.filter(ex => ex.id !== id))} />
            </div>
          </div>
        )}

        {viewState === ViewState.GENERATOR && (
          <div className="animate-fadeIn">
            <button onClick={() => setViewState(ViewState.DASHBOARD)} className="mb-6 px-4 py-2 text-slate-400 font-black hover:text-slate-900 flex items-center gap-2 transition-colors">← بازگشت به داشبورد</button>
            <ExamGenerator onGenerate={handleGenerateExam} isGenerating={isGenerating} />
          </div>
        )}

        {viewState === ViewState.EXAM_VIEW && selectedExam && (
          <ExamView exam={selectedExam} onBack={() => setViewState(ViewState.DASHBOARD)} onUpdateExam={(e) => { storage.saveExam(e); setExams(prev => prev.map(ex => ex.id === e.id ? e : ex)); setSelectedExam(e); }} />
        )}

        {viewState === ViewState.ADMIN_PANEL && isAdmin && (
          <AdminPanel 
            users={users} 
            exams={exams} 
            logs={logs} 
            currentUser={currentUser} 
            onAddUser={handleAddUser} 
            onDeleteUser={handleDeleteUser} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
