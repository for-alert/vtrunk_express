import * as Axios from "axios";

const axios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-API-Token": process.env.FAVO_TOKEN
    },
});

export default class Favo {
    static async CreateFavo(storeId: number, userId: number) {
        const request = { storeId: { value: storeId }, userId: { value: userId } };
        await axios.post("/k/v1/record.json",
            { app: 9, record: request }).catch(e => { console.log(e); return Promise.reject("err") });
    }

    static async GetNumFromStoreId(storeId: number) {
        let x = await axios.get("/k/v1/records.json", { params: { app: 9, query: `storeId=\"${storeId}\"` } });
        return x.data.records.length;
    }
}