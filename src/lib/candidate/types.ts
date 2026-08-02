/* ==========================================================
   Candidate
========================================================== */

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;

  avatar_url?: string;

  nationality?: string;

  gender?: string;

  dob?: string;

  passport_number?: string;

  passport_issue_date?: string;

  passport_expiry_date?: string;

  profile_completion?: number;

  education?: EducationEntry[];

  experience?: ExperienceEntry[];

  skills?: string[];

  languages?: LanguageEntry[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  country: string;
  start_year: string;
  end_year: string;
  grade: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  designation: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

/* ==========================================================
   Dashboard
========================================================== */

export interface CandidateDashboard {
  profileCompletion: number;

  activeApplications: number;

  interviews: number;

  offers: number;

  medicalStatus: string;

  visaStatus: string;

  deploymentStatus: string;

  recentActivity: Activity[];

  upcomingInterview?: CandidateInterview;

  latestOffer?: CandidateOffer;

  recentApplications?: CandidateApplication[];
}

/* ==========================================================
   Activity
========================================================== */

export interface Activity {
  id: string;

  title: string;

  description: string;

  created_at: string;
}

/* ==========================================================
   Job
========================================================== */

/**
 * The employer-submitted fields that only exist on the source job_orders
 * row, not on the slim `jobs` board-listing table. Only populated on the
 * single-job/single-application detail fetch, not the list views.
 */
export interface JobOrderDetails {
  vacancies?: number | null;

  contract_duration?: string | null;

  working_hours?: string | null;

  accommodation?: boolean;

  transport?: boolean;

  food?: boolean;

  benefits?: string | null;

  requirements?: string | null;

  remarks?: string | null;
}

export interface CandidateJob {
  id: string;

  title: string;

  /** Joined from the employer via job_order_id - null if not resolvable. */
  company: string | null;

  contact_email?: string | null;

  contact_phone?: string | null;

  job_order?: JobOrderDetails | null;

  country?: string;

  city?: string;

  sector?: string;

  employer_type?: string;

  salary_min?: number | null;

  salary_max?: number | null;

  currency?: string;

  experience_required?: string;

  license_required?: string;

  description?: string;

  saved: boolean;

  applied: boolean;
}

/* ==========================================================
   Application
========================================================== */

export interface CandidateApplication {
  id: string;

  created_at: string;

  updated_at?: string;

  status: string;

  remarks?: string;

  recruiter_name?: string;

  interview_date?: string;

  offer_status?: string;

  medical_status?: string;

  visa_status?: string;

  deployment_status?: string;

  job: CandidateJob;
}

/* ==========================================================
   Timeline
========================================================== */

export interface TimelineEvent {
  id: string;

  title: string;

  description: string;

  status: string;

  created_at: string;
}

/* ==========================================================
   Document
========================================================== */

export interface CandidateDocument {
  id: string;

  file_name: string;

  original_file_name?: string;

  document_type: string;

  mime_type?: string;

  file_size?: number;

  public_url: string;

  storage_path?: string;

  status: string;

  remarks?: string;

  created_at: string;

  expires_at?: string;
}

/* ==========================================================
   Interview
========================================================== */

export interface CandidateInterview {
  id: string;

  interview_date: string;

  interviewer_name: string;

  interviewer_email?: string;

  mode: string;

  meeting_link?: string;

  notes?: string;

  status: string;
}
/* ==========================================================
   Offer
========================================================== */

export interface CandidateOffer {
  id: string;

  job_title: string;

  company_name: string;

  salary: number;

  currency: string;

  location: string;

  joining_date: string;

  contract_duration?: string;

  accommodation?: boolean;

  transport?: boolean;

  food?: boolean;

  offer_letter_url?: string;

  status: string;
}

/* ==========================================================
   Medical
========================================================== */

export interface CandidateMedical {
  id: string;

  hospital_name: string;

  doctor_name?: string;

  appointment_date?: string;

  expiry_date?: string;

  report_document_id?: string;

  remarks?: string;

  status: string;
}

/* ==========================================================
   Visa
========================================================== */

export interface CandidateVisa {
  id: string;

  visa_number?: string;

  passport_number?: string;

  embassy_name?: string;

  submission_date?: string;

  approval_date?: string;

  issue_date?: string;

  expiry_date?: string;

  remarks?: string;

  status: string;
}
/* ==========================================================
   Deployment
========================================================== */

export interface CandidateDeployment {
  id: string;

  status: string;

  company_name: string;

  destination_country: string;

  flight_number: string;

  departure_date: string;

  departure_time: string;

  ticket_url?: string;

  accommodation_address?: string;

  emergency_contact?: string;
}
export interface CandidateNotification {
  id: string;

  title: string;

  message: string;

  type: string;

  read: boolean;

  link?: string;

  created_at: string;
}
export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;

  avatar_url?: string;

  nationality?: string;

  gender?: string;

  dob?: string;

  passport_number?: string;

  passport_issue_date?: string;

  passport_expiry_date?: string;

  preferred_country?: string;

  expected_salary?: number;

  salary_currency?: string;

  profile_completion?: number;

  education?: EducationEntry[];

  experience?: ExperienceEntry[];

  skills?: string[];

  languages?: LanguageEntry[];
}
