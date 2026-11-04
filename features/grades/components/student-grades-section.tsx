"use client";

import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ClientDate } from "@/components/shared/client-date";
import { cn, formatNumber } from "@/lib/utils";
import { useDeleteGrade, useStudentGrades } from "../hooks/use-student-grades";
import {
  GRADE_TONE_CLASS,
  getGradeTone,
  gradePercent,
} from "../lib/grades";
import { GradeFormDialog } from "./grade-form-dialog";
import type { Student } from "@/types/student";

interface StudentGradesSectionProps {
  student: Student;
}

export function StudentGradesSection({ student }: StudentGradesSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<string | null>(null);

  const { grades, stats, isLoading, isError, refetch } = useStudentGrades(
    student.id
  );
  const deleteGrade = useDeleteGrade();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">نمره‌ها</CardTitle>
          <Button size="sm" onClick={() => setFormOpen(true)} type="button">
            <Plus className="h-4 w-4" />
            ثبت نمره
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : grades.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="هنوز نمره‌ای ثبت نشده"
              description="اولین نمره آزمون یا تمرین این شاگرد را ثبت کنید"
              className="py-8"
            />
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3">
                  <StatItem
                    label="میانگین (از ۲۰)"
                    value={formatNumber(stats.averageOutOf20)}
                  />
                  <StatItem
                    label="بهترین"
                    value={`${formatNumber(stats.bestPercent)}٪`}
                  />
                  <StatItem
                    label="تعداد نمره‌ها"
                    value={formatNumber(stats.count)}
                  />
                </div>
              )}

              <div className="divide-y divide-border">
                {grades.map((grade) => {
                  const tone = getGradeTone(gradePercent(grade));
                  return (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 min-w-[3.5rem] items-center justify-center rounded-lg px-2 text-sm font-bold",
                            GRADE_TONE_CLASS[tone]
                          )}
                        >
                          {formatNumber(grade.score)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {grade.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            <ClientDate date={grade.date} /> — از{" "}
                            {formatNumber(grade.maxScore)}
                            {grade.note && ` — ${grade.note}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGradeToDelete(grade.id)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="حذف نمره"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <GradeFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        student={student}
      />

      <ConfirmDialog
        open={!!gradeToDelete}
        onClose={() => setGradeToDelete(null)}
        onConfirm={() => {
          if (gradeToDelete) deleteGrade(gradeToDelete);
        }}
        title="حذف نمره"
        description="آیا مطمئنید که می‌خواهید این نمره را حذف کنید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف کن"
      />
    </>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}