
import React, { useState, useEffect, useMemo } from 'react';
import { Exam, GenerateExamParams, ViewState, User, ActivityLog, SchoolResource } from './types';
import { generateMathExam } from './services/geminiService';
import { storage } from './services/storage';
import ExamGenerator from './components/ExamGenerator';
import ExamList from './components/ExamList';
import ExamView from './components/ExamView';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck, UserCog } from 'lucide-react';

const AftabLogoSVG = ({ className = "w-16 h-16", animate = true }: { className?: string; animate?: boolean }) => (
  <svg viewBox="0 -30 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      {`
        @keyframes rotateRays { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sunPulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
        .rays-group { transform-origin: 100px 80px; animation: ${animate ? 'rotateRays 60s linear infinite' : 'none'}; }
        .sun-core { transform-origin: 100px 80px; animation: ${animate ? 'sunPulse 4s ease-in-out infinite' : 'none'}; }
        .nastaliq-text { font-family: 'IranNastaliq', 'Vazirmatn', cursive; }
      `}
    </style>
    <g className="rays-group">
      <g stroke="#F59E0B" strokeWidth="1.5">
        {[...Array(36)].map((_, i) => (
          <line key={i} x1="100" y1="80" x2={100 + 95 * Math.cos((i * 10 * Math.PI) / 180)} y2={80 + 95 * Math.sin((i * 10 * Math.PI) / 180)} opacity="0.4" />
        ))}
      </g>
    </g>
    <circle cx="100" cy="80" r="35" fill="#F59E0B" className="sun-core" />
    <text x="50%" y="225" textAnchor="middle" fill="#1E293B" fontSize="72" fontWeight="normal" className="nastaliq-text">مدارس آفتاب</text>
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>(ViewState.DASHBOARD);
  const [exams, setExams] = useState<Exam[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

  useEffect(() => {
    const initData = async () => {
      try {
        const data = await storage.loadAllData();
        setExams(data.exams || []);
        setUsers(data.users || []);
        setLogs(data.logs || []);
      } catch (e) {
        console.error("Initial data load failed:", e);
      }
    };
    initData();
  }, []);

  const filteredExams = useMemo(() => {
    if (!currentUser) return [];
    if (isSuperAdmin) return exams;
    return exams.filter(e => e.schoolName === currentUser.schoolName);
  }, [exams, currentUser, isSuperAdmin]);

  const handleLogin = (username: string, password: string) => {
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
    if (user) {
      setCurrentUser(user);
      setLoginError(null);
      storage.saveLog({
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.fullName,
        schoolName: user.schoolName,
        action: 'LOGIN',
        details: `ورود کاربر ${user.fullName} با نقش ${user.role}`,
        timestamp: Date.now()
      });
    } else {
      setLoginError('اطلاعات کاربری نامعتبر است.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewState(ViewState.DASHBOARD);
  };

  const handleAddUser = async (u: Omit<User, 'id'>) => {
    if (!isAdmin) return;
    const newUser: User = { ...u, id: `user-${Date.now()}` };
    await storage.saveUser(newUser);
    setUsers(prev => [...prev, newUser]);
    storage.saveLog({
      id: `log-${Date.now()}`,
      userId: currentUser!.id,
      userName: currentUser!.fullName,
      schoolName: currentUser!.schoolName,
      action: 'ADD_USER',
      details: `کاربر جدید تعریف شد: ${u.fullName} (${u.role}) برای واحد ${u.schoolName}`,
      timestamp: Date.now()
    });
  };

  const handleDeleteUser = async (id: string) => {
    if (!isAdmin) return;
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    if (!isSuperAdmin && targetUser.role === 'admin') {
      alert('شما اجازه حذف یک مدیر دیگر را ندارید.');
      return;
    }

    if (window.confirm(`آیا از حذف دسترسی ${targetUser.fullName} اطمینان دارید؟`)) {
      await storage.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      storage.saveLog({
        id: `log-${Date.now()}`,
        userId: currentUser!.id,
        userName: currentUser!.fullName,
        schoolName: currentUser!.schoolName,
        action: 'DELETE_USER',
        details: `حذف دسترسی کاربر: ${targetUser.fullName}`,
        timestamp: Date.now()
      });
    }
  };

  const handleGenerateExam = async (params: GenerateExamParams) => {
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const examData = await generateMathExam(params);
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        userId: currentUser.id,
        authorName: currentUser.fullName,
        schoolName: currentUser.schoolName,
        title: examData.title || params.topic,
        topic: params.topic,
        gradeLevel: params.gradeLevel,
        createdAt: Date.now(),
        questions: (examData.questions as any) || [],
        rawContent: examData.rawContent || ''
      };

      await storage.saveExam(newExam);
      setExams(prev => [newExam, ...prev]);
      setSelectedExam(newExam);
      setViewState(ViewState.EXAM_VIEW);
    } catch (error) {
      alert('خطا در برقراری ارتباط با هوش مصنوعی.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;

  return (
    <div className="min-h-screen bg-slate-50 font-[Vazirmatn] text-right text-slate-800 selection:bg-amber-100" dir="rtl">
      {/* نوار راهبری اختصاصی با تفکیک نقش‌ها */}
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
            {/* فقط مدیران این دکمه را می‌بینند */}
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
            <span className="text-sm font-black text-slate-900 leading-none mb-1">{currentUser.fullName}</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${isSuperAdmin ? 'bg-amber-100 text-amber-700' : currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
               {isSuperAdmin ? 'مدیر کل سامانه' : currentUser.role === 'admin' ? 'مدیر واحد آموزشی' : 'آموزگار پایه'}
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
                <h2 className="text-3xl font-black text-slate-900">درود بر شما، {currentUser.fullName.split(' ')[0]}</h2>
                <p className="text-slate-500 font-bold mt-2">
                  {isSuperAdmin ? 'شما در حال مشاهده وضعیت کل شبکه مدارس آفتاب هستید.' : `پنل اختصاصی واحد آموزشی ${currentUser.schoolName}.`}
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
