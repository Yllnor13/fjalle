const API_URL = 'http://127.0.0.1:5000'

interface APIRequestConfig{
    method: 'GET' | 'POST';
    data?: string;
    date?: string;
}

async function apiRequest({ method = 'POST', data, date } : APIRequestConfig){
    const fetchOptions : RequestInit = {
        method,
        headers: {
            'Content-Type' : 'application/json'
        },
        mode : 'cors',
        credentials : 'omit',
    }
    if (data || date) {
        fetchOptions.body = JSON.stringify({ data, date });
    }
    console.log(fetchOptions)
    try{
        const response = await fetch(`${API_URL}`, fetchOptions);
        console.log(`${API_URL}`);
        if (!response.ok){
            throw new Error(`API call failed: ${response.statusText}`);
        }
        return response.json();
    } catch(error){
        console.error('API Request failed: ', error);
        throw error;
    }
}

export const get_Word = {
    get_Data : () =>
        apiRequest({
            method : 'GET',
        })
    }

export const send_Word = {
    send_Data : (str : string, this_date : string) =>
        apiRequest({
            method : 'POST',
            data : str,
            date : this_date,
        }),
    }