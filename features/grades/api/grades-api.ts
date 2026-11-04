import { api } from "@/lib/api-client";
import type { Grade, GradeInput } from "@/types/grade";

interface ApiGrade {
  id: string;
  userId: string;
  studentId: string;
  title: string;
  score: string | number;
  maxScore: string | number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

function normalize(raw: ApiGrade): Grade {
  return {
    id: raw.id,
    studentId: raw.studentId,
    title: raw.title,
    score: Number(raw.score),
    maxScore: Number(raw.maxScore),
    date: raw.date,
    note: raw.note ?? undefined,
    createdAt: raw.createdAt,
  };
}

export async function getGradesApi(studentId?: string): Promise<Grade[]> {
  const url = studentId ? `/grades?studentId=${studentId}` : "/grades";
  const { data } = await api.get<ApiGrade[]>(url);
  return data.map(normalize);
}

export async function createGradeApi(input: GradeInput): Promise<Grade> {
  const { data } = await api.post<ApiGrade>("/grades", input);
  return normalize(data);
}

export async function updateGradeApi(
  id: string,
  input: Partial<GradeInput>
): Promise<Grade> {
  const { data } = await api.patch<ApiGrade>(`/grades/${id}`, input);
  return normalize(data);
}

export async function deleteGradeApi(id: string): Promise<void> {
  await api.delete(`/grades/${id}`);
}