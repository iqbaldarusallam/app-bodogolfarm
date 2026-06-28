import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as vaccinationService from './vaccination.service';

export async function getByLivestock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const records = await vaccinationService.getByLivestock(req.params.livestockId as string);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await vaccinationService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await vaccinationService.create(req.body, req.user!.userId);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await vaccinationService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await vaccinationService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingBoosters(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const records = await vaccinationService.getUpcomingBoosters(req.user!.farm_id);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}
