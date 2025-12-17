
import React, { useState, useEffect } from 'react';
import { Exam, Question, QuestionSegment } from '../types';
import { Printer, ArrowRight, Save, Edit3 } from 'lucide-react';

interface ExamViewProps {
  exam: Exam;
  onBack: () => void;
  onUpdateExam?: (updatedExam: Exam) => void;
}

const ExamView: React.FC<ExamViewProps> = ({ exam, onBack, onUpdateExam }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localExam, setLocalExam] = useState<Exam>(exam);

  const getJalaliDate = (timestamp?: number) => {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(timestamp ? new Date(timestamp) : new Date());
  };

  useEffect(() => {
    setLocalExam(exam);
  }, [exam]);

  const handlePrint = () => window.print();

  const handleSave = () => {
    if (onUpdateExam) {
      onUpdateExam(localExam);
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn relative pb-32 font-[Vazirmatn] text-slate-800">
      {/* بخش کنترل پنل - فقط در حالت وب نمایش داده می‌شود */}
      <div className="flex justify-between items-center mb-6 print:hidden sticky top-20 z-20 bg-slate-50/90 backdrop-blur-sm p-4 -mx-4 rounded-xl border-b border-slate-200">
        <button onClick={onBack} className="flex items-center text-slate-600 font-black hover:text-slate-900 transition-colors">
          <ArrowRight className="w-5 h-5 ml-2" />
          بازگشت به لیست
        </button>
        <div className="flex gap-3">
          {isEditing ? (
             <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-md">
               <Save className="w-4 h-4" /> ذخیره تغییرات
             </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-800 font-bold">
              <Edit3 className="w-4 h-4" /> ویرایش سوالات
            </button>
          )}
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-black font-bold">
            <Printer className="w-4 h-4 text-amber-500" /> چاپ برگه
          </button>
        </div>
      </div>

      {/* برگه اصلی آزمون */}
      <div className={`bg-white shadow-sm border border-slate-200 p-10 md:p-16 print:shadow-none print:border-none print:p-0 transition-all ${isEditing ? 'ring-8 ring-slate-100' : ''}`}>
        
        {/* هدر رسمی آزمون (بدون برندینگ) */}
        <div className="border-b-4 border-slate-900 pb-8 mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-900 mb-8">{localExam.title}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold text-slate-800 text-right px-4">
            <div className="border-b border-slate-300 pb-1">نام و نام‌خانوادگی: .............................</div>
            <div className="border-b border-slate-300 pb-1">تاریخ آزمون: {getJalaliDate(localExam.createdAt)}</div>
            <div className="border-b border-slate-300 pb-1">پایه تحصیلی: {localExam.gradeLevel}</div>
            <div className="border-b border-slate-300 pb-1 text-center">نمره: ............</div>
          </div>
        </div>

        {/* لیست سوالات */}
        <div className="space-y-12 min-h-[600px]">
          {localExam.questions.map((q, idx) => (
            <div key={q.id} className="relative group break-inside-avoid">
              <div className="flex gap-4">
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-900 text-white font-black text-sm print:border print:border-slate-900 print:bg-transparent print:text-slate-900">
                  {idx + 1}
                </span>
                <div className="flex-grow pt-1">
                  <div className="text-lg text-slate-900 leading-relaxed font-bold flex flex-wrap items-center gap-2">
                    {(q.segments || []).map((seg, sIdx) => (
                      <span key={sIdx} className={seg.type === 'math' ? 'font-mono text-amber-600 px-1 text-xl' : ''} dir={seg.type === 'math' ? 'ltr' : 'rtl'}>
                        {isEditing ? (
                           <input 
                            value={seg.content} 
                            onChange={e => {
                                const newQs = [...localExam.questions];
                                newQs[idx].segments![sIdx].content = e.target.value;
                                setLocalExam({...localExam, questions: newQs});
                            }}
                            className="bg-slate-50 border-b border-slate-200 outline-none px-1 rounded focus:bg-white"
                            style={{ width: `${Math.max(seg.content.length * 0.8, 2)}em` }}
                           />
                        ) : seg.content}
                      </span>
                    ))}
                    <span className="mr-auto text-[10px] font-black text-slate-400 print:text-slate-900 border border-slate-100 px-2 py-0.5 rounded">({q.points} نمره)</span>
                  </div>
                  
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-2 gap-6 mt-6 pr-4">
                       {q.options.map((opt, i) => (
                         <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 print:border-slate-900"></div>
                            <span className="text-slate-800 font-bold text-sm">{opt}</span>
                         </div>
                       ))}
                    </div>
                  )}

                  {q.type === 'descriptive' && <div className="mt-8 h-32 w-full border-b border-x border-slate-50 rounded-b-xl print:border-slate-100"></div>}
                  {q.type === 'fill_in_blank' && <div className="mt-6 h-6 w-1/3 border-b-2 border-dotted border-slate-300"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* فوتر عمومی */}
        <div className="mt-24 pt-10 border-t border-slate-200 text-center">
           <p className="font-black text-xl text-slate-800">با آرزوی موفقیت و پیروزی</p>
        </div>
      </div>
    </div>
  );
};

export default ExamView;
