import { ApplicationStatus } from "./applicationStatus";

/*
|--------------------------------------------------------------------------
| Application Status Notification Copy
|--------------------------------------------------------------------------
| One entry per status in APPLICATION_STATUSES. `candidate`/`employer` are
| templates sent to that audience when an application moves to this status
| — omit one to skip notifying that audience for this stage (e.g. nobody
| is notified for the 2 internal-only stages; the employer isn't notified
| before `employer_shortlisted`, matching the visibility rules already
| enforced elsewhere in the codebase).
|
| Placeholders: {job} -> job order title, {candidate} -> candidate name.
*/

interface StatusMessage {
  title: string;
  candidate?: string;
  employer?: string;
}

export const APPLICATION_STATUS_MESSAGES: Record<ApplicationStatus, StatusMessage> = {
  applied: {
    title: "Application Submitted",
    candidate: 'Your application for "{job}" has been submitted.',
  },

  application_received: {
    title: "Application Received",
    // internal-only stage — no candidate or employer notification
  },

  cv_under_review: {
    title: "CV Under Review",
    // internal-only stage — no candidate or employer notification
  },

  employer_shortlisted: {
    title: "You've Been Shortlisted",
    candidate: 'Good news — you\'ve been shortlisted for "{job}".',
    employer:
      '{candidate} has been shortlisted for "{job}". Review their profile to schedule an interview.',
  },

  interview_scheduled: {
    title: "Interview Scheduled",
    candidate: 'An interview has been scheduled for your application to "{job}".',
    employer: 'An interview has been scheduled with {candidate} for "{job}".',
  },

  interview_completed: {
    title: "Interview Completed",
    candidate: 'Your interview for "{job}" has been marked complete.',
    employer: "{candidate}'s interview has been marked complete.",
  },

  selected: {
    title: "You've Been Selected",
    candidate: 'Congratulations — you\'ve been selected for "{job}".',
    employer: '{candidate} has been selected for "{job}".',
  },

  offer_letter_issued: {
    title: "Offer Letter Issued",
    candidate: 'Your offer letter for "{job}" has been issued.',
    employer: 'Offer letter issued to {candidate} for "{job}".',
  },

  documents_verification: {
    title: "Documents Under Verification",
    candidate: "Your submitted documents are being verified.",
    employer: "{candidate}'s documents are under verification.",
  },

  medical: {
    title: "Medical Stage",
    candidate: "Your medical examination process has started.",
    employer: "{candidate}'s medical examination process has started.",
  },

  visa_processing: {
    title: "Visa Processing",
    candidate: "Your visa is now being processed.",
    employer: "{candidate}'s visa is now being processed.",
  },

  visa_approved: {
    title: "Visa Approved",
    candidate: "Your visa has been approved.",
    employer: "{candidate}'s visa has been approved.",
  },

  ticket_confirmed: {
    title: "Travel Ticket Confirmed",
    candidate: "Your travel ticket has been confirmed.",
    employer: "{candidate}'s travel ticket has been confirmed.",
  },

  deployed: {
    title: "Deployed",
    candidate: 'You\'ve been marked as deployed for "{job}". Welcome to your new role!',
    employer: '{candidate} has been deployed for "{job}".',
  },

  rejected: {
    title: "Application Update",
    candidate: 'Your application for "{job}" was not selected to move forward.',
    employer: '{candidate}\'s application for "{job}" was marked as rejected.',
  },

  withdrawn: {
    title: "Application Withdrawn",
    candidate: 'Your application for "{job}" has been withdrawn.',
    employer: '{candidate} withdrew their application for "{job}".',
  },
};
