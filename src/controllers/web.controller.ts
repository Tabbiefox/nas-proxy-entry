import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { getServices } from '../app';
import { isObject, isEmpty } from '../helpers';
import { IPListItem } from '../models';

export function index(req: Request, res: Response, next: NextFunction) {
    res.send('Helo');
}
