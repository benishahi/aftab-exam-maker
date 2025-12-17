
import React, { useState } from 'react';
import { GenerateExamParams } from '../types';
import { Sparkles, Loader2, BookOpen, GraduationCap, Calculator, FileText, AlignRight } from 'lucide-react';

interface ExamGeneratorProps {
  onGenerate: (params: GenerateExamParams) => Promise<void>;
  isGenerating: boolean;
}

type GenerationMode = 'topic' | 'content';

const ExamGenerator: React.FC<ExamGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const [mode, setMode] = useState<GenerationMode>('topic');
  const [topic, setTopic] = useState('');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [gradeLevel, setGradeLevel] = useState('اول دبستان');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ 
      topic, 
      gradeLevel, 
      difficulty, 
      questionCount,
      sourceMaterial: mode === 'content' ? sourceMaterial : undefined
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 text-white text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-black">طراحی آزمون هوشمند</h2>
          <p className="text-indigo-100 mt-2 font-medium">طراحی سوالات استاندارد با تکیه بر دانش هوش مصنوعی</p>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => setMode('topic')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              mode === 'topic' 
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            انتخاب موضوع درس
          </button>
          <button
            type="button"
            onClick={() => setMode('content')}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              mode === 'content' 
                ? 'bg-white text-indigo-700 border-b-2 border-indigo-700' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            بر اساس متن محتوا
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              {mode === 'topic' ? 'موضوع مورد نظر برای آزمون' : 'عنوان آزمون'}
            </label>
            <input
              type="text"
              required={mode === 'topic'}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={mode === 'topic' ? "مثال: کسرها، علوم زیستی، دستور زبان..." : "مثال: آزمون میان‌ترم نوبت اول"}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-800 font-bold"
            />
          </div>

          {mode === 'content' && (
            <div className="animate-fadeIn">
               <label className="block text-sm font-black text-slate-700 mb-2">متن درس یا محتوای مرجع</label>
              <textarea
                required
                value={sourceMaterial}
                onChange={(e) => setSourceMaterial(e.target.value)}
                placeholder="متن مورد نظر برای استخراج سوالات را اینجا قرار دهید..."
                className="w-full px-5 py-4 h-40 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-slate-800 resize-none font-medium"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">پایه تحصیلی</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all bg-white font-bold"
              >
                <option value="اول دبستان">اول دبستان</option>
                <option value="دوم دبستان">دوم دبستان</option>
                <option value="سوم دبستان">سوم دبستان</option>
                <option value="چهارم دبستان">چهارم دبستان</option>
                <option value="پنجم دبستان">پنجم دبستان</option>
                <option value="ششم دبستان">ششم دبستان</option>
                <option value="هفتم">هفتم (متوسطه اول)</option>
                <option value="هشتم">هشتم (متوسطه اول)</option>
                <option value="نهم">نهم (متوسطه اول)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">تعداد سوالات</label>
              <input
                type="number"
                min="1"
                max="25"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-3">سطح دشواری آزمون</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'easy', label: 'آسان', color: 'indigo' },
                { id: 'medium', label: 'متوسط', color: 'indigo' },
                { id: 'hard', label: 'پیشرفته', color: 'indigo' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id as any)}
                  className={`py-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                    difficulty === lvl.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || (!topic && mode === 'topic') || (!sourceMaterial && mode === 'content')}
            className={`w-full py-5 rounded-2xl text-white font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3
              ${isGenerating || (!topic && mode === 'topic') || (!sourceMaterial && mode === 'content')
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1'
              }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                در حال پردازش هوشمند...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                تولید سوالات آزمون
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExamGenerator;
