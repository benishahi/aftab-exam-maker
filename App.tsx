import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from './types';
import type { Exam, GenerateExamParams, User, ActivityLog, SchoolResource } from './types';
import { generateMathExam } from './geminiService';
import { storage } from './storage';
import ExamGenerator from './ExamGenerator';
import ExamList from './ExamList';
import ExamView from './ExamView';
import Login from './Login';
import AdminPanel from './AdminPanel';
import { LogOut, PlusCircle, LayoutDashboard, ShieldCheck, UserCog } from 'lucide-react';

const AftabLogoSVG = ({ className = "w-10 h-10 md:w-16 md:h-16" }: { className?: string }) => (
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

  // سوییچ سخت‌افزاری و قطعی گاد مود
  const isBeniShahi = currentUser?.email === 'beni.shahi@gmail.com';
  const isSuperAdmin = useMemo(() => isBeniShahi || currentUser?.role === 'super_admin', [currentUser, isBeniShahi]);
  const isAdmin = useMemo(() => isSuperAdmin || currentUser?.role === 'admin', [isSuperAdmin, currentUser]);

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setViewState(ViewState.DASHBOARD);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-vazir">
      {/* Header - واکنشی شده برای موبایل */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-2 md:h-20 gap-2">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <AftabLogoSVG />
              <div className="flex flex-col">
                <h1 className="text-sm md:text-xl font-bold text-gray-900 leading-tight">مدارس آفتاب</h1>
                <span className="text-[10px] md:text-xs text-orange-600 font-medium hidden sm:block">INTELLIGENT NETWORK</span>
              </div>
            </div>

            {/* Navigation & User Profile */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="text-right hidden xs:block">
                  <div className="text-xs md:text-sm font-bold text-gray-900">{currentUser.name}
