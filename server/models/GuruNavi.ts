import * as Axios from "axios";

const axios = Axios.default.create({
    baseURL: process.env.GURUNAVI_URL,
});


export default class GuruNavi {
    static async FindStoreName(name: string) {
        let x = await axios.get("/", { params: { keyid: process.env.GURUNAVI_TOKEN, name, hit_per_page: 100 } });
        return x.data.rest.map((x: any) => { return { id: x.id, address: x.address, name: x.name, area: x.code.areaname } });
    }
    static async FindStoreId(id: string) {
        let x = await axios.get("/", { params: { keyid: process.env.GURUNAVI_TOKEN, id } });
        return x.data.rest.map((x: any) => { return { id: x.id, address: x.address, name: x.name, area: x.code.areaname } })[0];
    }
}