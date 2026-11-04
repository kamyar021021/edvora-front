"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getGradesApi,
  createGradeApi,
  deleteGradeApi,
} from "../api/grades-api";
import { calculateGradeStats } from "../lib/grades";
import { getErrorMessage } from "@/lib/api-client";
import type { GradeInput } from "@/types/grade";

export function useStudentGrades(studentId: string) {
  const query = useQuery({
    queryKey: ["grades", studentId],
    queryFn: () => getGradesApi(studentId),
    enabled: !!studentId,
  });

  const grades = useMemo(() => query.data ?? [], [query.data]);
  const stats = useMemo(() => calculateGradeStats(grades), [grades]);

  return {
    grades,
    stats,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAddGrade() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: GradeInput) => createGradeApi(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["grades", variables.studentId],
      });
      toast.success("نمره ثبت شد");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return useCallback(
    (input: GradeInput) => mutation.mutateAsync(input),
    [mutation]
  );
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteGradeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("نمره حذف شد");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return useCallback(
    (id: string) => mutation.mutateAsync(id),
    [mutation]
  );
}