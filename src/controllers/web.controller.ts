import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { getServices } from '../app';
import { isObject, isEmpty } from '../helpers';
import { IPListItem } from '../models';

export function index(req: Request, res: Response, next: NextFunction) {
    const iplist = getServices().iplist;
    if (req.connection.remoteAddress) {
        if (iplist.has(req.connection.remoteAddress, true)) {
            res.send('Address ' + req.connection.remoteAddress + ' already exists in whitelist');
        }
        else {
            iplist.add(req.connection.remoteAddress, true);
            iplist.commit();
            res.send('Added ' + req.connection.remoteAddress + ' to whitelist');
        }
    }
    else {
        res.send('Could not determine client IP');
    }
}