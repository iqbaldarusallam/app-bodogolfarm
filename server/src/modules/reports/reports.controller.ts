import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as reportsService from './reports.service';

export async function getGrowthReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportsService.getGrowthReport(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getFeedingReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportsService.getFeedingReport(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getHealthReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportsService.getHealthReport(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getMedicationReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportsService.getMedicationReport(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getStatusReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { start_date, end_date } = req.query;
    const report = await reportsService.getStatusReport(
      req.user!.farm_id,
      start_date as string,
      end_date as string,
    );
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}
