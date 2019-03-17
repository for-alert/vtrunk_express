import * as express from 'express';
import { Response, Request } from "express";
import PublicUser from '../models/PublicUser';
import PrivateUser from '../models/PrivateUser';
import GuruNavi from '../models/GuruNavi';
import { ArrayShuffle } from '../models/Unility';
import Store from '../models/Store';
import Favo from '../models/Favo';

export const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function (req: Request, res: Response, next: any) {
  res.json(req.query);
});

indexRouter.get('/public_users', async (req: Request, res: Response, next: any) => {
  const users = await PublicUser.GetAllUsers();
  res.json(users);
});

indexRouter.get('/public_user', async (req: Request, res: Response, next: any) => {
  if (req.query.userId === undefined) {
    res.status(422).json("userIdが空です");
    return;
  }
  const user = await PublicUser.GetUser(req.query.userId);
  if (user)
    res.json(user);
  else
    res.status(422).json("見つかりませんでした");
});

indexRouter.post('/public_user_from_token', async (req: Request, res: Response, next: any) => {
  const token = req.param("token", null)
  if (token === null) {
    res.status(422).json("tokenが空です");
    return;
  }
  const user = await PublicUser.GetUserForToken(token);
  if (user)
    res.json(user);
  else
    res.status(422).json("見つかりませんでした");
});


//プライベートユーザー情報取得
indexRouter.post('/private_user', async (req: Request, res: Response, next: any) => {
  const users = await PrivateUser.GetUserForToken(req.param("token", ""));
  if (users[0]) {
    users[0].pass_hash = undefined;
    res.json(users[0]);
  }
  else
    res.status(422).json("見つかりません");
});


//ユーザー新規登録
indexRouter.post('/register_user', async (req: Request, res: Response, next: any) => {
  const pass = req.param("pass", null);
  const userName = req.param("user_name", null);
  const sex = req.param("sex", null);
  const birthday = req.param("birthday", null);
  if (pass === null || userName === null || sex === null || birthday === null) {
    res.status(422).json("登録できませんでした。一部項目が空です");
    return;
  }

  const userId = await PublicUser.CreateUser(userName, sex, birthday).catch(e => { console.log(e); return Promise.resolve(null); });
  if (userId === null) {
    res.status(422).json("登録できませんでした");
    return;
  }

  const token = await PrivateUser.CreateUser(pass, userId).catch(e => { console.log(e); return Promise.resolve(null); });
  if (token)
    res.json(token);
  else
    res.status(422).json("登録できませんでした");
});

indexRouter.post('/login_user', async (req: Request, res: Response, next: any) => {
  const pass = req.param("pass", null);
  const userName = req.param("user_name", null);
  if (pass === null || userName === null) {
    res.status(422).json("ログイン失敗。項目が空です");
    return;
  }
  const token = await PrivateUser.LoginUser(userName, pass).catch(e => { console.log(e); return Promise.resolve(null); });
  if (token === null) {
    res.status(422).json("ログイン失敗。");
    return;
  } else
    res.json(token);
});

indexRouter.get('/find_store_name', async (req: Request, res: Response, next: any) => {
  const storeName = req.query.name;
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  if (storeName && latitude && longitude) {
    let data = await GuruNavi.FindStoreName(storeName, latitude, longitude).catch(e => { console.log(e); return Promise.resolve([]); });
    if (data.length == 0) {
      data = await GuruNavi.FindStoreNameFreeWhere(storeName).catch(e => { console.log(e); return Promise.resolve([]); });
    }
    res.json(data);
  }
  else res.status(422).json("要素が入力されていません");
});

indexRouter.post('/add_store', async (req: Request, res: Response, next: any) => {
  const storeId = req.param("id");
  const token = req.param("token");
  const file = req.param("file");
  const message = req.param("message");
  if (storeId && token && file && message) {
    const store = await GuruNavi.FindStoreId(storeId).catch(e => { console.log(e); return Promise.resolve([]); });
    if (store.length == 0) {
      res.status(422).json("店舗が見つかりませんでした");
      return;
    }
    const addExp = store.area === "関西" ? 200 : 100;
    const user = await PublicUser.GetUserForToken(token);
    if (user) {
      const result = await PublicUser.LevelUp(user, addExp).catch(e => { console.log(e); return Promise.resolve(null); });
      if (result) {
        await Store.CreateStore(file, storeId, store.name, store.address, user.userId, message).catch(e => console.log(e));
        res.json(result);
      }
      else
        res.status(422).json("error");

    }
    else
      res.status(422).json("ユーザーが見つかりませんでした");
  }
  else
    res.status(422).json("一部要素が入力されていません");
});

indexRouter.post('/random_battle', async (req: Request, res: Response, next: any) => {
  const token = req.param("token", null);
  if (token === null) {
    res.status(422).json("tokenが空です");
    return;
  }
  const myUser = await PublicUser.GetUserForToken(token);
  if (myUser === null) {
    res.status(422).json("ユーザーが見つかりませんでした");
    return;
  }
  const users = await PublicUser.GetAllUsers();
  const battleUser = ArrayShuffle(users.filter(user => user.$id !== myUser.$id))[0];
  res.json(await PublicUser.Battle(myUser, battleUser));

});

indexRouter.get('/stores', async (req: Request, res: Response, next: any) => {
  res.json(await Store.GetAllStores());
});


indexRouter.post('/favo', async (req: Request, res: Response, next: any) => {
  const token = req.param("token", null);
  const storeId = req.param("storeId", null);
  if (token === null || storeId === null) {
    res.status(422).json("要素が空です");
    return;
  }
  const users = await PrivateUser.GetUserForToken(token);
  if (users.length == 0) {
    res.status(422).json("tokenが不正です");
    return;
  }
  const store = await Store.GetStoreFromId(Number(storeId));
  const targetUser = await PublicUser.GetUser(store.userId);
  await PublicUser.LevelUp(targetUser, 50)
  const userId = users[0].userId;
  await Favo.CreateFavo(store.$id, userId);

  res.json("");
});

indexRouter.get('/store_of_favo', async (req: Request, res: Response, next: any) => {
  const storeId = req.query.storeId;
  if (storeId === undefined) {
    res.status(422).json("要素が空です");
    return;
  }
  res.json(await Favo.GetNumFromStoreId(Number(storeId)));
});