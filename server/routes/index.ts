import * as express from 'express';
import { Response, Request } from "express";
import PublicUser from '../models/PublicUser';

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function (req: Request, res: Response, next: any) {
  res.json(req.query);
});

indexRouter.get('/public_users', async (req: Request, res: Response, next: any) => {
  const users = await PublicUser.GetAllUsers();
  res.json(users);
});
