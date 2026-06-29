import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as earlyWarningService from './early-warning.service';

export async function getActiveAlerts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await earlyWarningService.getActiveAlerts(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAlertSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await earlyWarningService.getAlertSummary(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function acknowledgeAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await earlyWarningService.acknowledgeAlert(
      req.params.id as string,
      req.user!.userId,
      req.user!.farm_id,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resolveAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { notes } = req.body;
    const result = await earlyWarningService.resolveAlert(
      req.params.id as string,
      req.user!.userId,
      req.user!.farm_id,
      notes,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createAlert(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await earlyWarningService.createAlert(req.user!.farm_id, req.body, req.user!.userId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAlertHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const result = await earlyWarningService.getAlertHistory(req.user!.farm_id, status as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
