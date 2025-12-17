
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Exam, SchoolResource, ActivityLog } from '../types';

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
  async loadAllData() {
    let data = {
      users: [] as User[],
      exams: [] as Exam[],
      logs: [] as ActivityLog[]
    };

    if (supabase) {
      try {
        const [usersRes, examsRes, logsRes] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('exams').select('*').order('created_at', { ascending: false }),
          supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(100)
        ]);
        data.users = usersRes.data as User[] || [];
        data.exams = examsRes.data as Exam[] || [];
        data.logs = logsRes.data as ActivityLog[] || [];
      } catch (error) { data = this.loadFromLocal(); }
    } else {
      data = this.loadFromLocal();
    }

    // اطمینان از وجود بهنام شاهی به عنوان مدیر کل در صدر لیست
    const adminIndex = data.users.findIndex(u => u.email === GOD_MODE_ADMIN.email);
    if (adminIndex === -1) {
      data.users = [GOD_MODE_ADMIN, ...data.users];
    } else {
      data.users[adminIndex] = { ...GOD_MODE_ADMIN, ...data.users[adminIndex], role: 'super_admin' };
    }

    return data;
  },

  loadFromLocal() {
    const get = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
    return {
      users: get('aftab_users'),
      exams: get('aftab_exams'),
      logs: get('aftab_logs')
    };
  },

  async saveExam(exam: Exam) {
    if (supabase) await supabase.from('exams').upsert(exam);
    const items = JSON.parse(localStorage.getItem('aftab_exams') || '[]');
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
    const items = JSON.parse(localStorage.getItem('aftab_logs') || '[]');
    localStorage.setItem('aftab_logs', JSON.stringify([log, ...items].slice(0, 100)));
  }
};
