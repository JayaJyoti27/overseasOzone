import { z } from "zod";

export const INTERVIEW_STATUS = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
] as const;

export const INTERVIEW_MODE = ["online", "offline", "phone"] as const;

export const INTERVIEW_RESULT = ["selected", "rejected", "hold", "next_round"] as const;

export const CreateInterviewSchema = z.object({
  application_id: z.string().uuid(),

  job_order_id: z.string().uuid(),

  interview_date: z.coerce.date(),

  mode: z.enum(INTERVIEW_MODE),

  meeting_link: z.string().optional(),

  location: z.string().optional(),

  interviewer_name: z.string().min(2),

  interviewer_email: z.string().email(),

  interviewer_phone: z.string().optional(),

  notes: z.string().optional(),
});

export const RescheduleInterviewSchema = z.object({
  interview_date: z.coerce.date(),

  meeting_link: z.string().optional(),

  location: z.string().optional(),

  notes: z.string().optional(),
});

export const CompleteInterviewSchema = z.object({
  result: z.enum(INTERVIEW_RESULT),

  feedback: z.string().optional(),
});

export const CancelInterviewSchema = z.object({
  reason: z.string().min(5),
});

/*
|--------------------------------------------------------------------------
| Employer Candidate Actions
|--------------------------------------------------------------------------
*/

export const EmployerScheduleInterviewSchema = z.object({
  interview_date: z.coerce.date(),

  mode: z.enum(INTERVIEW_MODE),

  meeting_link: z.string().optional(),

  location: z.string().optional(),

  interviewer_name: z.string().min(2).optional(),

  interviewer_email: z.string().email().optional(),

  interviewer_phone: z.string().optional(),

  notes: z.string().optional(),
});

export const EmployerRejectCandidateSchema = z.object({
  reason: z.string().min(5),
});
