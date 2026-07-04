import type { Request, Response, NextFunction } from 'express'
import { upsertPrediction, getMyPredictions, calculateAllPoints, getRanking, getAllPredictions, getUserPredictions, getUserStats } from './predictions.service.js'
import { getIO } from '../../config/socket.js'

export async function save(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { matchId, homeScore, awayScore } = req.body
    const result = await upsertPrediction(req.user!.userId, matchId, homeScore, awayScore)
    console.log('Emitting prediction_updated')
    getIO().emit('prediction_updated')
    res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}

export async function mine(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getMyPredictions(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function calculate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await calculateAllPoints()
    getIO().emit('ranking_update')
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function ranking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getRanking()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function allPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getAllPredictions()
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function stats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getUserStats(req.user!.userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function userPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.params['userId'])
    const result = await getUserPredictions(userId)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
