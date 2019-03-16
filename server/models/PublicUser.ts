import * as Axios from "axios";
import { RecordFormat } from "./Format";

const axios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-API-Token": process.env.PUBLIC_USERS_TOKEN
    },
});


export default class PublicUser {
    //全ユーザーの取得
    static async GetAllUsers() {
        const res = await axios.get("/k/v1/records.json?app=6");
        const users = res.data.records;
        users.map((user: any) => RecordFormat(user));
        return users;
    }

    static async CreateUser(userName: string, sex: string, birthday: string) {
        const request = {
            userName: { value: userName },
            sex: { value: sex },
            birthday: { value: birthday },
            level: { value: "1" },
            exp: { value: "0" }
        };
        const x = await axios.post("/k/v1/record.json",
            { app: 6, record: request }
        );
        return x.data.userId;
    }
} 