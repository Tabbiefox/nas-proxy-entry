import { Router } from 'express';
import * as WebController from '../controllers/web.controller';

/**
 * Registration of API routes
 */
const WebRouter = Router();
WebRouter.get('/', async (req, res, next) => await WebController.index(req, res, next));
//ApiRouter.post('/track', async (req, res, next) => await ApiController.postTrack(req, res, next));

export default WebRouter;
