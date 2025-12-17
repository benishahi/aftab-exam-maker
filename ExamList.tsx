import React, { useState } from 'react';
import { Exam, User } from '../types';
import { Trash2, ChevronLeft, Layers, User as UserIcon, Copy, Calendar } from 'lucide-react';

interface ExamListProps {
  exams: Exam[];
  onSelectExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onDuplicateExam?: (exam: Exam) => void;
  currentUser: User;
}

const ExamList: React.FC<ExamListProps> = ({ exams, onSelectExam, onDeleteExam, onDuplicateExam, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'my_exams' | 'school_archive'>('my_exams');

  const myExams = exams.filter(e => e.userId === currentUser.id);
  const schoolArchive = exams; 

  const displayedExams = activeTab === 'my_exams' ? myExams : schoolArchive;

  // Jalali Date Formatter
  const getJalaliShort = (ts: number) => {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(ts);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('my_exams')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'my_exams' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          کارتابل شخصی ({myExams.length})
        </button>
        <button
          onClick={() => setActiveTab('school_archive')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'school_archive' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500'}`}
        >
          <Layers className="w-4 h-4" />
          بایگانی کل مدرسه ({schoolArchive.length})
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedExams.length > 0 ? displayedExams.map((exam) => {
          const isOwner = exam.userId === currentUser.id;
          
          return (
            <div 
              key={exam.id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-slate-100 overflow-hidden group cursor-pointer"
              onClick={() => onSelectExam(exam)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 text-[10px] font-black rounded-lg bg-amber-50 text-amber-600 uppercase">
                    {exam.gradeLevel}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                    <Calendar className="w-3 h-3" />
                    {getJalaliShort(exam.createdAt)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{exam.title}</h3>
                <div className="text-xs text-slate-400 mb-6 flex items-center gap-1 font-medium">
                    <UserIcon className="w-3 h-3" />
                    طراح: {exam.authorName}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-1">
                    {(isOwner || currentUser.role === 'admin') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteExam(exam.id); }}
                        className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all"
                        title="حذف دائمی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {onDuplicateExam && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); onDuplicateExam(exam); }}
                        className="text-slate-300 hover:text-blue-500 p-2 rounded-xl hover:bg-blue-50 transition-all"
                        title="کپی در کارتابل من"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center text-amber-600 text-xs font-black">
                    مشاهده و ویرایش
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-100">
             <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold">هنوز آزمونی در این بخش ثبت نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamList;