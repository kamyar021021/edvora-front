"use client";

import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { StudentDetailSkeleton } from "@/components/skeletons/student-detail-skeleton";
import { ROUTES } from "@/lib/constants";
import { useStudent } from "../hooks/use-students";
import { StudentHeader } from "./student-header";
import { StudentInfoCard } from "./student-info-card";
import { StudentFinancialSummary } from "./student-financial-summary";
import { StudentProgramCard } from "./student-program-card";
import { BalanceCard } from "./balance-card";
import { StudentSessionsSection } from "./student-sessions-section";
import { StudentGradesSection } from "@/features/grades/components/student-grades-section";
import { useStudentSessions } from "../hooks/use-student-sessions";

export function StudentDetailView() {
  const params = useParams();
  const id = params.id as string;
  const { student, isLoading, isError, refetch } = useStudent(id);

  if (isLoading) return <StudentDetailSkeleton />;

  if (isError) {
    return (
      <div className="p-4 sm:p-6">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 sm:p-6">
        <EmptyState
          icon={<UserX className="h-8 w-8" />}
          title="شاگرد پیدا نشد"
          description="این شاگرد حذف شده یا آدرس اشتباه است"
          action={
            <Link href={ROUTES.STUDENTS} className={buttonVariants()}>
              بازگشت به لیست
            </Link>
          }
        />
      </div>
    );
  }

  return <StudentDetailContent student={student} />;
}

function StudentDetailContent({
  student,
}: {
  student: NonNullable<ReturnType<typeof useStudent>["student"]>;
}) {
  const { balance } = useStudentSessions(student.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <StudentHeader student={student} />

      <StudentFinancialSummary student={student} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudentInfoCard student={student} />
        {balance && <BalanceCard balance={balance} />}
      </div>

      <StudentProgramCard student={student} />

      <StudentSessionsSection student={student} />
      
      <StudentGradesSection student={student} />
    </div>
  );
}
