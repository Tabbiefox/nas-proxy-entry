import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { getServices } from '../app';
import { isObject, isEmpty } from '../helpers';
import { IPListItem } from '../models';

export function index(req: Request, res: Response, next: NextFunction) {
    const iplist = getServices().iplist;
    var ip = (<string>req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if (ip) {
        if (iplist.has(ip, true)) {
            res.send('Address ' + ip + ' already exists in whitelist');
        }
        else {
            iplist.add(ip, true);
            iplist.commit();
            res.send('Added ' + ip + ' to whitelist');
        }
    }
    else {
        res.send('Could not determine client IP');
    }
}