import * as express from 'express';
import { Response, Request } from "express";
import PublicUser from '../models/PublicUser';
import PrivateUser from '../models/PrivateUser';

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function (req: Request, res: Response, next: any) {
  res.json(req.query);
});

indexRouter.get('/public_users', async (req: Request, res: Response, next: any) => {
  const users = await PublicUser.GetAllUsers();
  res.json(users);
});

indexRouter.post('/private_user', async (req: Request, res: Response, next: any) => {
  const users = await PrivateUser.GetUserForToken(req.param("token", ""));
  if (users[0]) {
    users[0].pass_hash = undefined;
    res.json(users[0]);
  }
  else
    res.status(422).json("見つかりません");
});

indexRouter.post('/register_user', async (req: Request, res: Response, next: any) => {
  const passHash = req.param("pass_hash", null);
  const userName = req.param("user_name", null);
  const sex = req.param("sex", null);
  const birthday = req.param("birthday", null);
  if (passHash === null || userName === null || sex === null || birthday === null) {
    res.status(422).json("登録できませんでした。一部項目が空です");
    return;
  }

  const userId = await PublicUser.CreateUser(userName, sex, birthday).catch(e => { console.log(e); return Promise.resolve(null); });
  if (userId) {
    res.status(422).json("登録できませんでした");
    return;
  }

  const token = await PrivateUser.CreateUser(passHash, userId).catch(e => { console.log(e); return Promise.resolve(null); });
  if (token)
    res.json(token);
  else
    res.status(422).json("登録できませんでした");
});
