import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn } from 'lucide-react';
import { User } from './types.ts'; // اضافه کردن تایپ کاربر

interface LoginProps {
  onLogin: (user: User) => void; // تغییر از رشته به شیء کاربر برای تزریق مستقیم نقش
  error?: string | null;
}

const AftabLogoSVG = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg viewBox="0 -30 200 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
      {`
        @keyframes rotateRays {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 0px #F59E0B); }
          50% { transform: scale(1.1); opacity: 0.8; filter: drop-shadow(0 0 15px #F59E0B); }
        }
        .rays-group { 
          transform-origin: 100px 80px;
          animation: rotateRays 40s linear infinite;
        }
        .sun-core {
          transform-origin: 100px 80px;
          animation: sunPulse 3s ease-in-out infinite;
        }
      `}
    </style>
    <g className="rays-group">
      <g stroke="#F59E0B" strokeWidth="2">
        {[...Array(36)].map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="80"
            x2={100 + 95 * Math.cos((i * 10 * Math.PI) / 180)}
            y2={80 + 95 * Math.sin((i * 10 * Math.PI) / 180)}
            opacity="0.5"
          />
        ))}
      </g>
    </g>
    <circle cx="100" cy="80" r="35" fill="#F59E0B" className="sun-core" />
    <text x="50%" y="225" textAnchor="middle" fill="#FFFFFF" fontSize="72" fontWeight="normal" style={{fontFamily: 'IranNastaliq, Vazirmatn, cursive'}}>مدارس آفتاب</text>
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- سوییچ سخت‌افزاری گاد مود (بهنام شاهی) ---
    if (username === 'beni.shahi@gmail.com' && password === 'admin') {
      onLogin({
        id: 'super-admin-god-mode',
        username: 'beni.shahi@gmail.com',
        fullName: 'بهنام شاهی',
        email: 'beni.shahi@gmail.com',
        role: 'super_admin', // فعال‌سازی دسترسی گاد مود
        password: 'admin',
        schoolName: 'دفتر مرکزی مدارس آفتاب'
      });
      return;
    }

    // منطق برای سایر کاربران (پیش‌فرض آموزگار)
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      username: username,
      fullName: 'کاربر سیستم',
      email: username,
      role: 'user', // نقش پیش‌فرض
      password: password,
      schoolName: 'واحد آموزشی آفتاب'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-[Vazirmatn] text-slate-800">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 p-12 text-center text-white relative">
          <div className="flex justify-center mb-4">
             <AftabLogoSVG className="w-64 h-64" />
          </div>
          <p className="text-amber-500 font-black text-2xl mt-8 tracking-tight">
            سامانه هوشمند مدیریت آزمون
          </p>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">
            Aftab Intelligent Education Network
          </p>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <label className="text-xs font-black text-slate-500 mr-2 flex items-center justify-end gap-1">
                 شناسه کاربری
                 <UserIcon className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ایمیل یا کد پرسنلی"
                dir="ltr"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 text-center"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="text-xs font-black text-slate-500 mr-2 flex items-center justify-end gap-1">
                 گذرواژه
                 <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-slate-800 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 text-center"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-slate-800 hover:bg-slate-900 text-white rounded-[2rem] text-lg font-black shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-95"
            >
              <LogIn className="w-6 h-6 text-amber-500" />
              ورود به میز کار
            </button>
          </form>

          <div className="mt-10 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Aftab Intelligent Education Network © 1403
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
