import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as farmChecklistService from './farm-checklist.service';

export async function getTodayChecklist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await farmChecklistService.getTodayChecklist(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function completeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { checklistId, itemCode } = req.params;
    const result = await farmChecklistService.completeItem(checklistId as string, itemCode as string, req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function skipItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { checklistId, itemCode } = req.params;
    const { reason } = req.body;
    const result = await farmChecklistService.skipItem(checklistId as string, itemCode as string, reason);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { type } = req.query;
    const result = await farmChecklistService.getHistory(req.user!.farm_id, type as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOverdue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await farmChecklistService.getOverdue(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
