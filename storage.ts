import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Exam, SchoolResource, ActivityLog } from './types.ts';

// مشخصات دقیق گاد مود
const GOD_MODE_EMAIL = 'beni.shahi@gmail.com';

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
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('aftab_user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      // شرط طلایی: اگر ایمیل شما بود، همیشه نقش سوپر ادمین (گاد مود) را اعمال کن
      if (user.email === GOD_MODE_EMAIL) {
        return { ...user, role: 'super_admin', fullName: 'بهنام شاهی' };
      }
      return user;
    } catch { return null; }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      // اگر کاربر بهنام شاهی وارد شد، اطلاعات گاد مود را ذخیره کن
      if (user.email === GOD_MODE_EMAIL) {
        localStorage.setItem('aftab_user', JSON.stringify(GOD_MODE_ADMIN));
      } else {
        localStorage.setItem('aftab_user', JSON.stringify(user));
      }
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
    if (!list.find((u: User) => u.email === GOD_MODE_EMAIL)) {
      return [GOD_MODE_ADMIN, ...list];
    }
    return list;
  },

  getLogs: (): ActivityLog[] => {
    const logs = localStorage.getItem('aftab_logs');
    return logs ? JSON.parse(logs) : [];
  },

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
