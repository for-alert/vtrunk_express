import * as FormData from "form-data";
import * as Axios from "axios";
import { RecordFormat } from "./Format";

const fileAxios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-Authorization": process.env.KINTONE_TOKEN,
    },
});

const axios = Axios.default.create({
    baseURL: process.env.KINTONE_URL,
    headers: {
        "X-Cybozu-API-Token": process.env.STORES_TOKEN,
    },
});

async function StoreFormat(data: any) {
    data = RecordFormat(data);
    data.picture = await Store.GetStorePicture(data.picture[0].fileKey).catch(e => console.log(e));
    return data;
}

export default class Store {

    static async GetAllStores() {
        let x = await axios.get("/k/v1/records.json", { params: { app: 8 } });
        const stores = x.data.records;
        for (let i = 0; i < stores.length; i++) {
            stores[i] = await StoreFormat(stores[i]);
        }
        return stores;
    }

    static async GetStoreFromId(id: number) {
        let x = await axios.get("/k/v1/records.json", { params: { app: 8, query: `$id=\"${id}\"` } });
        const stores = x.data.records;
        if (stores.length == 0) return null;
        return RecordFormat(stores[0])
    }

    static async GetStorePicture(fileKey: string) {
        let x = await fileAxios.get("/k/v1/file.json", { params: { fileKey } });
        return x.data;
    }

    static async CreateStore(file: any, storeId: string, storeName: string, address: string, userId: string, message: string) {
        const form = new FormData();
        const filename = 'image.jpg';
        form.append('file', file, {
            filename,
            contentType: 'image\/jpeg',
            knownLength: file.length
        });
        const headers = form.getHeaders();
        const fileKey = (await fileAxios.post("/k/v1/file.json", form, {
            headers
        }).catch(e => { console.log(e); return Promise.reject("err") })).data.fileKey;

        const request = {
            picture: { value: [{ fileKey }] },
            storeId: { value: storeId },
            storeName: { value: storeName },
            address: { value: address },
            userId: { value: userId },
            message: { value: message }
        };

        await axios.post("/k/v1/record.json",
            { app: 8, record: request }).catch(e => { console.log(e); return Promise.reject("err") });

    }
}