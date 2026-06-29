import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares';
import * as treatmentProtocolService from './treatment-protocol.service';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await treatmentProtocolService.getAll(req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getByDisease(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await treatmentProtocolService.getByDisease(
      req.params.diseaseId as string,
      req.user!.farm_id,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const protocol = await treatmentProtocolService.getById(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: protocol });
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const protocol = await treatmentProtocolService.create(req.body, req.user!.userId, req.user!.farm_id);
    res.status(201).json({ success: true, data: protocol });
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const protocol = await treatmentProtocolService.update(
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.user!.farm_id,
    );
    res.status(200).json({ success: true, data: protocol });
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await treatmentProtocolService.remove(req.params.id as string, req.user!.farm_id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
