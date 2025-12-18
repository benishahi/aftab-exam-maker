import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Exam, SchoolResource, ActivityLog } from './types.ts';

// تعریف God Mode برای مدیر کل کل مدارس آفتاب
const GOD_MODE_ADMIN: User = {
  id: 'super-admin-god-mode',
  username: 'beni.shahi@gmail.com',
  password: 'admin',
  fullName: 'بهنام شاهی',
  email: 'beni.shahi@gmail.com',
  role: 'super_admin',
  schoolName: 'دفتر مرکزی مدارس آفتاب'
};

const getEnvVar = (name: string): string | undefined => {
  try {
    const env = (import.meta as any).env;
    return env ? env[name] : undefined;
  } catch { return undefined; }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'undefined') {
  try { supabase = createClient(supabaseUrl, supabaseKey); } catch (e) { console.warn("Supabase failed", e); }
}

export const storage = {
  // --- متدهای اضافه شده برای رفع ارور صفحه سفید ---
  
  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('aftab_user');
    if (!user) return null;
    try { return JSON.parse(user); } catch { return null; }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('aftab_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aftab_user');
    }
  },

  logout: () => {
    localStorage.removeItem('aftab_user');
  },

  getExams: (): Exam[] => {
    const exams = localStorage.getItem('aftab_exams');
    return exams ? JSON.parse(exams) : [];
  },

  getUsers: (): User[] => {
    const users = localStorage.getItem('aftab_users');
    const list = users ? JSON.parse(users) : [];
    // همیشه بهنام شاهی را در لیست داشته باشیم
    if (!list.find((u: User) => u.email === GOD_MODE_ADMIN.email)) {
      return [GOD_MODE_ADMIN, ...list];
    }
    return list;
  },

  getLogs: (): ActivityLog[] => {
    const logs = localStorage.getItem('aftab_logs');
    return logs ? JSON.parse(logs) : [];
  },

  // --- متدهای دیتابیس و ذخیره‌سازی ---

  async saveExam(exam: Exam) {
    if (supabase) await supabase.from('exams').upsert(exam);
    const items = this.getExams();
    localStorage.setItem('aftab_exams', JSON.stringify([exam, ...items.filter((i: any) => i.id !== exam.id)]));
  },

  async saveUser(user: User) {
    if (supabase) await supabase.from('users').upsert(user);
    const items = JSON.parse(localStorage.getItem('aftab_users') || '[]');
    localStorage.setItem('aftab_users', JSON.stringify([...items.filter((i: any) => i.id !== user.id), user]));
  },

  async deleteUser(id: string) {
    if (supabase) await supabase.from('users').delete().eq('id', id);
    const items = JSON.parse(localStorage.getItem('aftab_users') || '[]');
    localStorage.setItem('aftab_users', JSON.stringify(items.filter((i: any) => i.id !== id)));
  },

  async saveLog(log: ActivityLog) {
    if (supabase) await supabase.from('activity_logs').insert(log);
    const items = this.getLogs();
    localStorage.setItem('aftab_logs', JSON.stringify([log, ...items].slice(0, 100)));
  }
};
