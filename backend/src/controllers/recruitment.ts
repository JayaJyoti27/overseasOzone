import { Request, Response } from "express";
import * as RecruitmentService from "../services/admin/recruitment";

const ADMIN_ID = "admin-demo";

/*
|--------------------------------------------------------------------------
| Applications
|--------------------------------------------------------------------------
*/

export async function getApplications(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.getApplications({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      recruiterId: req.query.recruiterId as string,
      employerId: req.query.employerId as string,
      jobOrderId: req.query.jobOrderId as string,
      search: req.query.search as string,
    });

    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getApplication(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.getApplication(String(req.params.id));

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}

export async function updateApplicationStage(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.updateApplicationStage(
      String(req.params.id),
      req.body.stage,
      req.body.notes,
      req.adminId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function assignRecruiter(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.assignRecruiter(
      String(req.params.id),
      req.body.recruiterId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function rejectApplication(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.rejectApplication(
      String(req.params.id),
      req.body.reason,
      req.adminId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function withdrawApplication(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.withdrawApplication(String(req.params.id), req.adminId);

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
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
    const data = await RecruitmentService.getInterviews(req.query);

    res.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function scheduleInterview(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.scheduleInterview(
      String(req.params.applicationId),
      ADMIN_ID,
      req.body,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function completeInterview(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.completeInterview(
      String(req.params.id),
      req.body.result,
      req.body.feedback,
      req.adminId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function cancelInterview(req: Request, res: Response) {
  try {
    const data = await RecruitmentService.cancelInterview(String(req.params.id), req.body.reason);

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}
/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

export async function getDocuments(req: Request, res: Response) {
  const data = await RecruitmentService.getDocuments(req.query);
  res.json({ success: true, ...data });
}

export async function verifyDocument(req: Request, res: Response) {
  const data = await RecruitmentService.verifyDocument(String(req.params.id), ADMIN_ID);

  res.json({
    success: true,
    data,
  });
}

export async function rejectDocument(req: Request, res: Response) {
  const data = await RecruitmentService.rejectDocument(
    String(req.params.id),
    ADMIN_ID,
    req.body.reason,
  );

  res.json({
    success: true,
    data,
  });
}
/*
|--------------------------------------------------------------------------
| Medical
|--------------------------------------------------------------------------
*/

export async function getMedicals(req: Request, res: Response) {
  const data = await RecruitmentService.getMedicals(req.query);

  res.json({
    success: true,
    ...data,
  });
}

export async function scheduleMedical(req: Request, res: Response) {
  const data = await RecruitmentService.scheduleMedical(
    String(req.params.applicationId),
    req.adminId!,
    req.body,
  );

  res.json({
    success: true,
    data,
  });
}

export async function markMedicalFit(req: Request, res: Response) {
  const data = await RecruitmentService.markMedicalFit(
    String(req.params.id),
    ADMIN_ID,
    req.body.reportDocumentId,
    req.body.expiryDate,
  );

  res.json({
    success: true,
    data,
  });
}

export async function markMedicalUnfit(req: Request, res: Response) {
  const data = await RecruitmentService.markMedicalUnfit(
    String(req.params.id),
    ADMIN_ID,
    req.body.remarks,
  );

  res.json({
    success: true,
    data,
  });
}
/*
|--------------------------------------------------------------------------
| Visa
|--------------------------------------------------------------------------
*/

export async function getVisas(req: Request, res: Response) {
  const data = await RecruitmentService.getVisas(req.query);

  res.json({
    success: true,
    ...data,
  });
}

export async function createVisa(req: Request, res: Response) {
  const data = await RecruitmentService.createVisa(
    String(req.params.applicationId),
    req.adminId!,
    req.body,
  );

  res.json({
    success: true,
    data,
  });
}

export async function approveVisa(req: Request, res: Response) {
  const data = await RecruitmentService.approveVisa(
    String(req.params.id),
    ADMIN_ID,
    req.body.visaNumber,
    req.body.issueDate,
    req.body.expiryDate,
  );

  res.json({
    success: true,
    data,
  });
}

export async function issueVisa(req: Request, res: Response) {
  const data = await RecruitmentService.issueVisa(String(req.params.id), req.adminId);

  res.json({
    success: true,
    data,
  });
}
/*
|--------------------------------------------------------------------------
| Deployment
|--------------------------------------------------------------------------
*/

export async function getDeployments(req: Request, res: Response) {
  const data = await RecruitmentService.getDeployments(req.query);

  res.json({
    success: true,
    ...data,
  });
}

export async function createDeployment(req: Request, res: Response) {
  const data = await RecruitmentService.createDeployment(
    String(req.params.applicationId),
    ADMIN_ID,
    req.body,
  );

  res.json({
    success: true,
    data,
  });
}

export async function addTicket(req: Request, res: Response) {
  const data = await RecruitmentService.addTicket(String(req.params.id), req.body);

  res.json({
    success: true,
    data,
  });
}

export async function confirmTravel(req: Request, res: Response) {
  const data = await RecruitmentService.confirmTravel(String(req.params.id));

  res.json({
    success: true,
    data,
  });
}

export async function markDeparted(req: Request, res: Response) {
  const data = await RecruitmentService.markDeparted(String(req.params.id));

  res.json({
    success: true,
    data,
  });
}

export async function markArrived(req: Request, res: Response) {
  const data = await RecruitmentService.markArrived(String(req.params.id));

  res.json({
    success: true,
    data,
  });
}

export async function completeDeployment(req: Request, res: Response) {
  const data = await RecruitmentService.completeDeployment(
    String(req.params.id),
    req.body.remarks,
    req.adminId,
  );

  res.json({
    success: true,
    data,
  });
}
/*
|--------------------------------------------------------------------------
| Timeline
|--------------------------------------------------------------------------
*/

export async function getTimeline(req: Request, res: Response) {
  const data = await RecruitmentService.getTimeline(String(req.params.applicationId));

  res.json({
    success: true,
    data,
  });
}
export async function markMedicalRetest(req: Request, res: Response) {
  const data = await RecruitmentService.markMedicalRetest(
    String(req.params.id),
    ADMIN_ID,
    req.body.remarks,
  );

  res.json({
    success: true,
    data,
  });
}
export async function getVisa(req: Request, res: Response) {
  const data = await RecruitmentService.getVisa(String(req.params.id));

  res.json({
    success: true,
    data,
  });
}

export async function submitVisa(req: Request, res: Response) {
  const data = await RecruitmentService.submitVisa(String(req.params.id), req.adminId);

  res.json({
    success: true,
    data,
  });
}

export async function rejectVisa(req: Request, res: Response) {
  const data = await RecruitmentService.rejectVisa(
    String(req.params.id),
    req.body.remarks,
    req.adminId,
  );

  res.json({
    success: true,
    data,
  });
}
export async function getDeployment(req: Request, res: Response) {
  const data = await RecruitmentService.getDeployment(String(req.params.id));

  res.json({
    success: true,
    data,
  });
}
