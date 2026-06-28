import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as pensService from './pens.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pens = await pensService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: pens });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pen = await pensService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: pen });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pen = await pensService.create(req.body);
    res.status(201).json({ success: true, data: pen });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pen = await pensService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: pen });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await pensService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getByType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const pens = await pensService.getByType(req.user!.farm_id, req.params.type as string);
    res.status(200).json({ success: true, data: pens });
  } catch (error) {
    next(error);
  }
}
