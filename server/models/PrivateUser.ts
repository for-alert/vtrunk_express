import * as Axios from "axios";
import { RecordFormat } from "./Format";

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

    static async CreateUser(pass_hash: string, userId: number) {
        const token = uuidv4();
        const request = {
            pass_hash: { value: pass_hash }, token: { value: token }, userId: { value: String(userId) }
        };
        await axios.post("/k/v1/record.json",
            { app: 7, record: request }
        );
        return token;
    }


} 