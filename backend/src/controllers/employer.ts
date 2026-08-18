import { Request, Response } from "express";
import * as EmployerService from "../services/employer";
import {
  getEmployerCandidate,
  getEmployerCandidates,
  rejectEmployerCandidate,
  scheduleEmployerInterview,
  completeEmployerInterview,
  issueOfferLetter,
  approveDocumentsVerification,
} from "../services/employer/candidate";
import * as StorageService from "../services/storage";
import {
  EmployerScheduleInterviewSchema,
  EmployerRejectCandidateSchema,
  EmployerCompleteInterviewSchema,
} from "../validators/interviewSchema";

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export async function getDocuments(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerDocuments(req.employerId!);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function uploadDocument(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const documentType = req.body?.document_type;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "document_type is required.",
      });
    }

    const employerId = req.employerId!;
    const path = `${employerId}/${documentType}/${Date.now()}-${req.file.originalname}`;

    const publicUrl = await StorageService.uploadDocument(
      "employer-documents",
      path,
      req.file.buffer,
      req.file.mimetype,
    );

    const data = await EmployerService.uploadEmployerDocument(employerId, {
      document_type: documentType,
      file_name: req.file.originalname,
      file_url: publicUrl,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function deleteDocument(req: Request, res: Response) {
  try {
    const data = await EmployerService.deleteEmployerDocument(
      req.employerId!,
      String(req.params.id),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function submitForReview(req: Request, res: Response) {
  try {
    const data = await EmployerService.submitEmployerForReview(req.employerId!);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("submitForReview error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerDashboard(req.employerId!);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/

export async function getProfile(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerProfile(req.employerId!);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const data = await EmployerService.updateEmployerProfile(req.employerId!, {
      ...req.body,
      email: req.body?.email ?? req.authUserEmail,
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("updateProfile error:", err);
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

/*
|--------------------------------------------------------------------------
| Requirements
|--------------------------------------------------------------------------
*/

export async function getRequirements(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerRequirements({
      employerId: req.employerId!,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      status: req.query.status as string,
      search: req.query.search as string,
    });

    return res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getRequirement(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerRequirementDetails(
      req.employerId!,
      String(req.params.id),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

export async function createRequirement(req: Request, res: Response) {
  try {
    const data = await EmployerService.createRequirement(req.employerId!, req.body);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function updateRequirement(req: Request, res: Response) {
  try {
    const data = await EmployerService.updateRequirement(
      req.employerId!,
      String(req.params.id),
      req.body,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function withdrawRequirement(req: Request, res: Response) {
  try {
    const data = await EmployerService.withdrawRequirement(req.employerId!, String(req.params.id));

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Interviews
|--------------------------------------------------------------------------
*/

export async function getInterviews(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerInterviews({
      employerId: req.employerId!,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      jobOrderId: req.query.jobOrderId as string,
    });

    return res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function confirmInterview(req: Request, res: Response) {
  try {
    const data = await EmployerService.confirmInterview(req.employerId!, String(req.params.id));

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Deployments
|--------------------------------------------------------------------------
*/

export async function getDeployments(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerDeployments({
      employerId: req.employerId!,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      jobOrderId: req.query.jobOrderId as string,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getDeployment(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerDeployment(
      req.employerId!,
      String(req.params.id),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export async function getNotifications(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerNotifications({
      employerId: req.employerId!,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      unreadOnly: req.query.unreadOnly === "true",
    });

    return res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const data = await EmployerService.markNotificationRead(req.employerId!, String(req.params.id));

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  try {
    const data = await EmployerService.markAllNotificationsRead(req.employerId!);

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getCandidate(req: Request, res: Response) {
  try {
    const data = await getEmployerCandidate(req.employerId!, String(req.params.id));
    res.json({ success: true, data });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
}

export async function getCandidates(req: Request, res: Response) {
  try {
    const data = await getEmployerCandidates(req.employerId!);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function rejectCandidate(req: Request, res: Response) {
  try {
    const parsed = EmployerRejectCandidateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten() });
    }

    const data = await rejectEmployerCandidate(
      req.employerId!,
      String(req.params.id),
      parsed.data.reason,
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function scheduleCandidateInterview(req: Request, res: Response) {
  try {
    const parsed = EmployerScheduleInterviewSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten() });
    }

    const data = await scheduleEmployerInterview(req.employerId!, String(req.params.id), {
      ...parsed.data,
      interview_date: parsed.data.interview_date.toISOString(),
    });

    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function completeCandidateInterview(req: Request, res: Response) {
  try {
    const parsed = EmployerCompleteInterviewSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.flatten() });
    }

    const data = await completeEmployerInterview(
      req.employerId!,
      String(req.params.id),
      parsed.data.result,
      parsed.data.feedback,
    );

    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function issueCandidateOfferLetter(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was uploaded." });
    }

    const employerId = req.employerId!;
    const candidateId = String(req.params.id);
    const path = `${employerId}/offer-letters/${candidateId}/${Date.now()}-${req.file.originalname}`;

    const publicUrl = await StorageService.uploadDocument(
      "employer-documents",
      path,
      req.file.buffer,
      req.file.mimetype,
    );

    const data = await issueOfferLetter(employerId, candidateId, publicUrl);

    return res.status(201).json({ success: true, data });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

export async function approveCandidateDocuments(req: Request, res: Response) {
  try {
    const data = await approveDocumentsVerification(req.employerId!, String(req.params.id));
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
}

/*
|--------------------------------------------------------------------------
| Legalization Documents (Demand Letter, Specimen Contract, POA)
|--------------------------------------------------------------------------
*/

export async function getJobOrderLegalizationDocuments(req: Request, res: Response) {
  try {
    const data = await EmployerService.getEmployerLegalizationDocuments(
      req.employerId!,
      String(req.params.id),
    );

    return res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(err.statusCode ?? 500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function uploadJobOrderLegalizationDocument(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
    }

    const employerId = req.employerId!;
    const jobOrderId = String(req.params.id);
    const documentId = String(req.params.docId);

    const path = `${employerId}/${jobOrderId}/${documentId}/${Date.now()}-${req.file.originalname}`;

    const publicUrl = await StorageService.uploadDocument(
      "job-order-legalization-documents",
      path,
      req.file.buffer,
      req.file.mimetype,
    );

    const data = await EmployerService.uploadEmployerLegalizationDocument(
      employerId,
      jobOrderId,
      documentId,
      publicUrl,
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(err.statusCode ?? 400).json({
      success: false,
      message: err.message,
    });
  }
}
