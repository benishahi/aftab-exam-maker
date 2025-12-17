
export type UserRole = 'super_admin' | 'admin' | 'teacher';

export interface User {
  id: string;
  username: string;
  password: string; 
  fullName: string;
  email?: string;
  role: UserRole;
  schoolName: string; // اجباری برای تفکیک محیط‌ها
}

export type SegmentType = 'text' | 'math';

export interface QuestionSegment {
  type: SegmentType;
  content: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'descriptive' | 'fill_in_blank';
  questionText: string; 
  segments?: QuestionSegment[]; 
  options?: string[]; 
  correctAnswer?: string; 
  points: number;
}

export interface Exam {
  id: string;
  userId: string; 
  authorName: string; 
  schoolName: string;
  title: string;
  topic: string;
  gradeLevel: string;
  createdAt: number;
  questions: Question[];
  rawContent: string;
  isDeletedByAuthor?: boolean; 
}

export interface SchoolResource {
  id: string;
  schoolName: string;
  title: string;
  content: string;
  tags: string[];
  addedBy: string;
  createdAt: number;
}

export interface GenerateExamParams {
  topic: string; 
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  sourceMaterial?: string;
  schoolKnowledgeBase?: string;
  previousExamsContext?: string; 
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  schoolName: string;
  action: 'CREATE_EXAM' | 'DELETE_EXAM' | 'LOGIN' | 'UPDATE_EXAM' | 'DELETE_REQUEST' | 'ADD_RESOURCE' | 'ADD_USER' | 'DELETE_USER';
  details: string;
  timestamp: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  EXAM_VIEW = 'EXAM_VIEW',
  ADMIN_PANEL = 'ADMIN_PANEL'
}
