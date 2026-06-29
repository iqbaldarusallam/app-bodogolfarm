import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as diseaseCatalogService from './disease-catalog.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await diseaseCatalogService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const disease = await diseaseCatalogService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const disease = await diseaseCatalogService.create(req.body, req.user!.userId, req.user!.farm_id);
    res.status(201).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const disease = await diseaseCatalogService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: disease });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await diseaseCatalogService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
