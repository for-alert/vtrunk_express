import * as Axios from "axios";
import { RecordFormat } from "./Format";
import { sha256 } from 'js-sha256';
import PublicUser from "./PublicUser";

const axios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-API-Token": process.env.PRIVATE_USERS_TOKEN
    },
});

const uuidv4 = require('uuid/v4');

export default class PrivateUser {
    //全ユーザーの取得
    static async GetAllUsers() {
        const res = await axios.get("/k/v1/records.json?app=7");
        const users = res.data.records;
        users.map((user: any) => RecordFormat(user));
        return users;
    }

    static async GetUserForToken(token: string) {
        const res = await axios.get("/k/v1/records.json?app=7", { params: { query: `token=\"${token}\"` } }).catch(e => console.log(e));
        const users = (<any>res).data.records;
        users.map((user: any) => RecordFormat(user));
        return users;
    }

    static async CreateUser(pass: string, userId: number) {
        const token = uuidv4();
        const request = {
            pass_hash: { value: sha256(pass) }, token: { value: token }, userId: { value: String(userId) }
        };
        await axios.post("/k/v1/record.json",
            { app: 7, record: request }
        );
        return token;
    }

    static async LoginUser(userName: string, pass: string) {
        const users = await PublicUser.GetUserFromName(userName);
        const passHash = sha256(pass);
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const res = await axios.get("/k/v1/records.json?app=7", { params: { query: `userId=\"${user.userId}\" and pass_hash=\"${passHash}\"` } });
            if (res.data.records.length > 0) {
                return res.data.records[0].token.value;
            }
        }
        return null;
    }


} 