import * as Axios from "axios";
import { RecordFormat } from "./Format";
import PrivateUser from "./PrivateUser";

function PublicUserFormat(data: any) {
    data = RecordFormat(data);
    data.nextExp = NextLevelExp(data.level) - data.exp;
    return data;
}

const axios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-API-Token": process.env.PUBLIC_USERS_TOKEN
    },
});

//次のレベルに必要な経験値
function NextLevelExp(nowLevel: number) {
    return Math.floor((nowLevel * nowLevel * nowLevel) / 3 + 100);
}


export default class PublicUser {
    userId: string;
    userName: string;
    level: number;
    birthday: string;
    exp: number;
    sex: string;
    $id: number;
    nextExp: number;
    win: number;
    lose: number;

    static async Battle(myUser: PublicUser, otherUser: PublicUser) {
        const fix = Math.random();
        if (myUser.level * fix > otherUser.level * (1 - fix)) {
            const addExp = 400;
            const levelUp = await PublicUser.LevelUp(myUser, addExp);
            await PublicUser.Update(myUser, "win", Number(myUser.win) + 1);
            return { win: true, levelUp, battleUser: otherUser, fix };
        }
        await PublicUser.Update(myUser, "lose", Number(myUser.lose) + 1);
        return { win: false, battleUser: otherUser, fix };
    }

    static async GetUserForToken(token: string) {
        const users = await PrivateUser.GetUserForToken(token);
        if (users[0]) {
            const user2 = await PublicUser.GetUser(users[0].userId);
            if (user2)
                return user2;
            else
                return null;
        }
        else
            return null;
    }

    static async LevelUp(user: PublicUser, addExp: number) {
        let exp = Number(user.exp) + addExp;
        let nextExp = NextLevelExp(user.level);
        let level = Number(user.level);
        while (nextExp <= exp) {
            level++;
            exp = exp - nextExp;
            nextExp = NextLevelExp(level);
        }
        await PublicUser.Update(user, "level", level);
        await PublicUser.Update(user, "exp", exp);
        return { getExp: addExp, levelUp: user.level != level };
    }

    static async Update(user: PublicUser, name: string, value: any) {
        const request: any = {};
        request[name] = { value: String(value) };
        const res = await axios.put("/k/v1/record.json", { app: 6, id: user.$id, record: request });
    }

    //全ユーザーの取得
    static async GetAllUsers(): Promise<PublicUser[]> {
        const res = await axios.get("/k/v1/records.json?app=6");
        const users = res.data.records;
        users.map((user: any) => PublicUserFormat(user));
        return users;
    }

    static async GetUser(userId: number): Promise<PublicUser> {
        const res = await axios.get("/k/v1/records.json?app=6", { params: { query: `userId=\"${userId}\"` } });
        const users = res.data.records;
        users.map((user: any) => PublicUserFormat(user));
        return users[0];
    }

    static async GetUserFromName(name: string): Promise<PublicUser[]> {
        const res = await axios.get("/k/v1/records.json?app=6", { params: { query: `userName=\"${name}\"` } });
        const users = res.data.records;
        users.map((user: any) => PublicUserFormat(user));
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
        return x.data.id;
    }
} 