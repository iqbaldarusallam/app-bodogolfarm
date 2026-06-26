import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as quarantineService from './quarantine.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const records = await quarantineService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getActive(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const records = await quarantineService.getActive(req.user!.farm_id);
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await quarantineService.getById(req.params.id);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await quarantineService.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await quarantineService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function clearance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const record = await quarantineService.clearance(
      req.params.id,
      req.body,
      req.user!.userId,
    );
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await quarantineService.remove(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
