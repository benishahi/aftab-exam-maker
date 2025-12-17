
import React, { useState, useMemo } from 'react';
import { User, Exam, ActivityLog } from '../types';
import { Users, UserPlus, Trash2, ShieldCheck, School, Activity, Info, X } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  exams: Exam[];
  logs: ActivityLog[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, exams, logs, currentUser, onAddUser, onDeleteUser }) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    password: '',
    fullName: '',
    role: 'teacher', // پیش‌فرض برای مدیران مدرسه فقط آموزگار است
    schoolName: isSuperAdmin ? '' : currentUser.schoolName
  });

  // فیلتر کاربران بر اساس سطح دسترسی و مدرسه
  const filteredUsers = useMemo(() => {
    if (isSuperAdmin) return users;
    return users.filter(u => u.schoolName === currentUser.schoolName && u.role !== 'super_admin');
  }, [users, isSuperAdmin, currentUser.schoolName]);

  const filteredLogs = useMemo(() => {
    if (isSuperAdmin) return logs;
    return logs.filter(l => l.schoolName === currentUser.schoolName);
  }, [logs, isSuperAdmin, currentUser.schoolName]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin && !newUser.schoolName) {
      alert('لطفاً نام واحد آموزشی را وارد کنید.');
      return;
    }
    await onAddUser(newUser);
    setNewUser({
      username: '',
      password: '',
      fullName: '',
      role: 'teacher',
      schoolName: isSuperAdmin ? '' : currentUser.schoolName
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* سربرگ هوشمند پنل مدیریت */}
      <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" /></svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
           <div className="p-5 bg-amber-500 rounded-[2rem] shadow-xl shadow-amber-500/20">
              {isSuperAdmin ? <ShieldCheck className="w-10 h-10 text-white" /> : <Users className="w-10 h-10 text-white" />}
           </div>
           <div>
              <h2 className="text-4xl font-black mb-2">
                {isSuperAdmin ? 'مدیریت کل سیستم' : `مدیریت ${currentUser.schoolName}`}
              </h2>
              <p className="text-slate-400 font-bold flex items-center gap-2">
                <School className="w-4 h-4" /> وضعیت فعلی: {filteredUsers.length} کاربر تحت مدیریت شما
              </p>
           </div>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="relative z-10 flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-black shadow-lg hover:scale-105 transition-all"
        >
           {isAdding ? <X className="w-6 h-6" /> : <UserPlus className="w-6 h-6 text-amber-500" />}
           {isAdding ? 'بستن فرم' : (isSuperAdmin ? 'تعریف مدیر جدید' : 'افزودن آموزگار')}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2 mb-8 border-r-4 border-amber-500 pr-4">
             <h3 className="text-2xl font-black">ثبت اطلاعات دسترسی جدید</h3>
          </div>
          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 block mr-2">نام و نام‌خانوادگی</label>
                <input required placeholder="مثال: مریم سعیدی" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 block mr-2">نام کاربری (ایمیل)</label>
                <input required placeholder="username@aftab.ir" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" dir="ltr" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 block mr-2">گذرواژه ورود</label>
                <input required type="password" placeholder="••••••••" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" dir="ltr" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
             </div>
             
             {isSuperAdmin ? (
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 block mr-2">تخصیص واحد آموزشی</label>
                  <input required placeholder="مثال: شعبه سعادت‌آباد" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none font-bold transition-all" value={newUser.schoolName} onChange={e => setNewUser({...newUser, schoolName: e.target.value})} />
               </div>
             ) : (
                <div className="space-y-2 opacity-50">
                  <label className="text-xs font-black text-slate-400 block mr-2">واحد آموزشی (سیستمی)</label>
                  <input disabled className="w-full px-6 py-4 rounded-2xl bg-slate-100 border-none font-bold cursor-not-allowed" value={currentUser.schoolName} />
                </div>
             )}
             
             <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 block mr-2">سطح دسترسی</label>
                <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white font-black outline-none transition-all appearance-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                   {isSuperAdmin && <option value="admin">مدیر واحد آموزشی</option>}
                   <option value="teacher">آموزگار (Teacher)</option>
                </select>
             </div>

             <div className="flex items-end">
                <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all">تایید و فعال‌سازی دسترسی</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* لیست کاربران فعال */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-10 py-6 bg-slate-50 border-b border-slate-100">
                 <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                    <Users className="w-6 h-6 text-slate-400" /> اعضای کادر آموزشی و مدیریت
                 </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-400 border-b border-slate-50">
                         <th className="px-10 py-5">نام و مشخصات</th>
                         <th className="px-10 py-5">واحد فعالیت</th>
                         <th className="px-10 py-5">سمت</th>
                         <th className="px-10 py-5 text-center">عملیات</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map(u => (
                         <tr key={u.id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="px-10 py-5">
                               <div className="font-black text-slate-900">{u.fullName}</div>
                               <div className="text-[10px] text-slate-400 font-bold" dir="ltr">{u.username}</div>
                            </td>
                            <td className="px-10 py-5 text-slate-500 font-bold text-xs">{u.schoolName}</td>
                            <td className="px-10 py-5">
                               <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${u.role === 'super_admin' ? 'bg-indigo-50 text-indigo-600' : u.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                  {u.role === 'super_admin' ? 'مدیر ارشد' : u.role === 'admin' ? 'مدیر واحد' : 'آموزگار'}
                               </span>
                            </td>
                            <td className="px-10 py-5 text-center">
                               {u.id !== currentUser.id && (
                                  <button 
                                    onClick={() => onDeleteUser(u.id)} 
                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                    title="ابطال دسترسی"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
        
        {/* وقایع‌نگاری زنده */}
        <div className="lg:col-span-1">
           <div className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl h-full border border-slate-800 sticky top-24">
              <h3 className="font-black flex items-center gap-3 mb-10 text-amber-500">
                <Activity className="w-6 h-6" /> ردپای فعالیت‌ها (Logs)
              </h3>
              <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                 {filteredLogs.slice(0, 15).map(l => (
                    <div key={l.id} className="relative pr-6 border-r-2 border-slate-700/50 pb-2">
                       <div className="absolute top-0 -right-[7px] w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-900 group-hover:bg-amber-500 transition-colors"></div>
                       <div className="text-[10px] font-black text-slate-500 mb-1 flex justify-between">
                          <span>{new Intl.DateTimeFormat('fa-IR', {hour:'2-digit', minute:'2-digit'}).format(l.timestamp)}</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded-md">{l.schoolName}</span>
                       </div>
                       <div className="font-black text-xs text-slate-200 mb-1">{l.userName}</div>
                       <div className="text-[10px] text-slate-400 font-medium leading-relaxed">{l.details}</div>
                    </div>
                 ))}
                 {filteredLogs.length === 0 && <div className="text-center py-20 text-slate-700 font-black text-xs">گزارشی ثبت نشده است.</div>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
