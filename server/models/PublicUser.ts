import * as Axios from "axios";

function RecordFormat(data: any) {
    Object.keys(data).forEach(k => data[k] = data[k].value);
    data["作成者"] = undefined;
    data["更新者"] = undefined;
    data["更新日時"] = undefined;
    data["作成日時"] = undefined;
    return data;
}

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
} 