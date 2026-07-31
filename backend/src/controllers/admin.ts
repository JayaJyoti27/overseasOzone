import { Request, Response } from "express";

import * as AdminService from "../services/admin";

/*
|--------------------------------------------------------------------------
| Temporary Admin
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export async function getDashboard(req: Request, res: Response) {
  try {
    const data = await AdminService.getAdminDashboard();

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
| Candidate Management
|--------------------------------------------------------------------------
*/

export async function getCandidates(req: Request, res: Response) {
  try {
    const data = await AdminService.getCandidates({
      page: Number(req.query.page) || 1,

      limit: Number(req.query.limit) || 20,

      status: req.query.status as string,

      country: req.query.country as string,

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

export async function getCandidate(req: Request, res: Response) {
  try {
    const data = await AdminService.getCandidate(String(req.params.id));

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

export async function activateCandidate(req: Request, res: Response) {
  try {
    const data = await AdminService.activateCandidate(String(req.params.id));

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

export async function suspendCandidate(req: Request, res: Response) {
  try {
    const data = await AdminService.suspendCandidate(String(req.params.id));

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
| Employer Management
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Get Employers
|--------------------------------------------------------------------------
*/

export async function getEmployers(req: Request, res: Response) {
  try {
    const data = await AdminService.getEmployers({
      page: Number(req.query.page) || 1,

      limit: Number(req.query.limit) || 20,

      status: req.query.status as string,

      approvalStatus: req.query.approvalStatus as string,

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

/*
|--------------------------------------------------------------------------
| Employer Details
|--------------------------------------------------------------------------
*/

export async function getEmployer(req: Request, res: Response) {
  try {
    const data = await AdminService.getEmployer(String(req.params.id));

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
| Pending Employers
|--------------------------------------------------------------------------
*/

export async function getPendingEmployers(req: Request, res: Response) {
  try {
    const data = await AdminService.getPendingEmployers();

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
| Approve Employer
|--------------------------------------------------------------------------
*/

export async function approveEmployer(req: Request, res: Response) {
  try {
    const data = await AdminService.approveEmployer(String(req.params.id), req.adminId!);

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
| Suspend Employer
|--------------------------------------------------------------------------
*/

export async function suspendEmployer(req: Request, res: Response) {
  try {
    const data = await AdminService.suspendEmployer(String(req.params.id));

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
| Activate Employer
|--------------------------------------------------------------------------
*/

export async function activateEmployer(req: Request, res: Response) {
  try {
    const data = await AdminService.activateEmployer(String(req.params.id));

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
| Requirement Management
|--------------------------------------------------------------------------
*/

export async function getRequirements(req: Request, res: Response) {
  try {
    const data = await AdminService.getRequirements({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as string,
      employerId: req.query.employerId as string,
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
    const data = await AdminService.getRequirement(String(req.params.id));

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

export async function reviewRequirement(req: Request, res: Response) {
  try {
    const data = await AdminService.reviewRequirement(String(req.params.id), req.adminId!);

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

export async function requestClarification(req: Request, res: Response) {
  try {
    const data = await AdminService.requestClarification(
      String(req.params.id),
      req.adminId!,
      req.body.notes,
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

export async function approveRequirement(req: Request, res: Response) {
  try {
    const data = await AdminService.approveRequirement(String(req.params.id), req.adminId!);

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

export async function rejectRequirement(req: Request, res: Response) {
  try {
    const data = await AdminService.rejectRequirement(
      String(req.params.id),
      req.adminId!,
      req.body.reason,
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

export async function convertRequirement(req: Request, res: Response) {
  try {
    const data = await AdminService.convertRequirementToJobOrder(String(req.params.id), req.adminId!);

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
| Job Order Management
|--------------------------------------------------------------------------
*/

export async function getJobOrders(req: Request, res: Response) {
  try {
    const data = await AdminService.getJobOrders({
      page: Number(req.query.page) || 1,

      limit: Number(req.query.limit) || 20,

      status: req.query.status as string,

      employerId: req.query.employerId as string,

      country: req.query.country as string,

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

export async function getJobOrder(req: Request, res: Response) {
  try {
    const data = await AdminService.getJobOrder(String(req.params.id));

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

export async function updateJobOrder(req: Request, res: Response) {
  try {
    const data = await AdminService.updateJobOrder(String(req.params.id), req.body);

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

export async function openRecruitment(req: Request, res: Response) {
  try {
    const data = await AdminService.openRecruitment(String(req.params.id));

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

export async function closeRecruitment(req: Request, res: Response) {
  try {
    const data = await AdminService.closeRecruitment(String(req.params.id));

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
