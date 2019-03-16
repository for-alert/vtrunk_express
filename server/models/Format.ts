export function RecordFormat(data: any) {
    Object.keys(data).forEach(k => data[k] = data[k].value);
    data["作成者"] = undefined;
    data["更新者"] = undefined;
    data["更新日時"] = undefined;
    data["作成日時"] = undefined;
    return data;
}