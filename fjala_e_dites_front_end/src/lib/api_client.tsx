import { API_URL } from "./link";
import * as backend from "./fake_backend"

interface APIRequestConfig{
    method: 'GET' | 'POST';
    data: string;
    date: string;
}

async function apiRequest({ method = 'POST', data, date } : APIRequestConfig){

    if (method === 'POST') {
        data = data.toLowerCase();
        const result = backend.checkLetters(data, date);
        const exist = backend.isWordInList(data);
        const encoded = backend.encodeData(result, exist);

        return {data: encoded};
    }
    throw new Error('Unsupported method');
}


export const send_Word = {
    send_Data : (str : string, this_date : string): Promise<{ data: number }> =>
        apiRequest({
            method : 'POST',
            data : str,
            date : this_date,
        }),
    }