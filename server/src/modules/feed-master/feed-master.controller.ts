import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as feedMasterService from './feed-master.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const feeds = await feedMasterService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: feeds });
  } catch (error) {
    next(error);
  }
}

export async function getActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const feeds = await feedMasterService.getActive(req.user!.farm_id);
    res.status(200).json({ success: true, data: feeds });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const feed = await feedMasterService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const feed = await feedMasterService.create(req.body);
    res.status(201).json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const feed = await feedMasterService.update(req.params.id as string, req.body, req.user!.farm_id);
    res.status(200).json({ success: true, data: feed });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await feedMasterService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
