import * as express from 'express';
import { Response, Request } from "express";

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function (req: Request, res: Response, next: any) {
  res.json(req.query);
});


