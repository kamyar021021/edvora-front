import type { Grade, GradeStats } from "@/types/grade";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toEnglishDigits(input: string): string {
  let result = "";
  for (const ch of input) {
    const p = PERSIAN_DIGITS.indexOf(ch);
    if (p !== -1) {
      result += String(p);
      continue;
    }
    const a = ARABIC_DIGITS.indexOf(ch);
    result += a !== -1 ? String(a) : ch;
  }
  return result;
}

/**
 * عدد اعشاری را از ورودی کاربر می‌خواند؛ ارقام فارسی/عربی و جداکننده‌های
 * «٫ , ، /» را هم قبول می‌کند. اگر معتبر نباشد null برمی‌گرداند.
 */
export function parseDecimal(input: string | undefined): number | null {
  if (!input) return null;
  const normalized = toEnglishDigits(input.trim()).replace(/[٫,،/]/g, ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

export function gradePercent(grade: Pick<Grade, "score" | "maxScore">): number {
  if (grade.maxScore <= 0) return 0;
  return (grade.score / grade.maxScore) * 100;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateGradeStats(grades: Grade[]): GradeStats | null {
  if (grades.length === 0) return null;

  const percents = grades.map(gradePercent);
  const sum = percents.reduce((acc, p) => acc + p, 0);
  const averagePercent = sum / percents.length;

  return {
    count: grades.length,
    averagePercent: round1(averagePercent),
    averageOutOf20: round1((averagePercent / 100) * 20),
    bestPercent: round1(Math.max(...percents)),
    worstPercent: round1(Math.min(...percents)),
  };
}

export type GradeTone = "good" | "average" | "weak";

export function getGradeTone(percent: number): GradeTone {
  if (percent >= 75) return "good";
  if (percent >= 50) return "average";
  return "weak";
}

export const GRADE_TONE_CLASS: Record<GradeTone, string> = {
  good: "bg-success/10 text-success",
  average: "bg-secondary text-secondary-foreground",
  weak: "bg-destructive/10 text-destructive",
};