export interface Grade {
  id: string;
  studentId: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface GradeInput {
  studentId: string;
  title: string;
  score: number;
  maxScore: number;
  date: string;
  note?: string;
}

export interface GradeStats {
  count: number;
  /** میانگین درصدی همه نمره‌ها (۰ تا ۱۰۰) */
  averagePercent: number;
  /** میانگین نرمال‌شده روی مقیاس ۲۰ */
  averageOutOf20: number;
  bestPercent: number;
  worstPercent: number;
}