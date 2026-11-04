"use client";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import { useAddGrade } from "../hooks/use-student-grades";
import { parseDecimal } from "../lib/grades";
import type { Student } from "@/types/student";

const DEFAULT_MAX_SCORE = "20";

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .min(2, "عنوان باید حداقل ۲ کاراکتر باشد")
    .max(100, "عنوان حداکثر ۱۰۰ کاراکتر باشد")
    .required("عنوان آزمون یا تمرین الزامی است"),
  score: yup
    .string()
    .required("نمره را وارد کنید")
    .test("valid-number", "نمره معتبر نیست", (v) => parseDecimal(v) !== null)
    .test(
      "lte-max",
      "نمره نمی‌تواند از حداکثر نمره بیشتر باشد",
      function (v) {
        const score = parseDecimal(v);
        const max = parseDecimal(this.parent.maxScore);
        if (score === null || max === null) return true;
        return score <= max;
      }
    ),
  maxScore: yup
    .string()
    .required("حداکثر نمره را وارد کنید")
    .test("positive", "حداکثر نمره باید بیشتر از صفر باشد", (v) => {
      const n = parseDecimal(v);
      return n !== null && n > 0;
    }),
  date: yup.string().required("تاریخ الزامی است"),
  note: yup.string().default(""),
});

type FormValues = yup.InferType<typeof schema>;

interface GradeFormDialogProps {
  open: boolean;
  onClose: () => void;
  student: Student;
}

export function GradeFormDialog({
  open,
  onClose,
  student,
}: GradeFormDialogProps) {
  const addGrade = useAddGrade();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
      score: "",
      maxScore: DEFAULT_MAX_SCORE,
      date: "",
      note: "",
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: FormValues) {
    const score = parseDecimal(data.score);
    const maxScore = parseDecimal(data.maxScore);
    if (score === null || maxScore === null) return;

    try {
      await addGrade({
        studentId: student.id,
        title: data.title.trim(),
        score,
        maxScore,
        date: data.date,
        note: data.note || undefined,
      });
      handleClose();
    } catch {
      // پیام خطا توسط هوک نمایش داده می‌شود؛ دیالوگ باز می‌ماند
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="ثبت نمره جدید"
      description={`نمره آزمون یا تمرین ${student.name}`}
      footer={
        <>
          <Button variant="outline" type="button" onClick={handleClose}>
            انصراف
          </Button>
          <Button type="submit" form="grade-form" loading={isSubmitting}>
            ثبت نمره
          </Button>
        </>
      }
    >
      <form
        id="grade-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              label="عنوان"
              placeholder="مثلاً آزمون فصل ۳"
              value={field.value}
              onChange={field.onChange}
              error={errors.title?.message}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="score"
            render={({ field }) => (
              <Input
                label="نمره"
                placeholder="۱۷٫۵"
                inputMode="decimal"
                autoComplete="off"
                value={field.value}
                onChange={field.onChange}
                error={errors.score?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="maxScore"
            render={({ field }) => (
              <Input
                label="از"
                placeholder="۲۰"
                inputMode="decimal"
                autoComplete="off"
                value={field.value}
                onChange={field.onChange}
                error={errors.maxScore?.message}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <PersianDatePicker
              label="تاریخ"
              value={field.value}
              onChange={field.onChange}
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <Input
              label="یادداشت (اختیاری)"
              placeholder="مثلاً در حل مسئله ضعیف بود"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </form>
    </Dialog>
  );
}