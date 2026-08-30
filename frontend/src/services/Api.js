import axios from 'axios'

const url = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    },
});


export const getTransactions = async() => {
    try {
        const response = await axios.get(`${url}/transactions`);
        
        console.log('Response Data:', response);
        return response.data;
        
    } catch (error) {
        const message = error.response?.data?.message || error.message
        throw new Error(message);
    }
};

export const createTransaction = async (data) => {
    try{
        const response = await url.post(`${url}/transaction`, data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message
        throw new Error(message);
    }
}

export const createTransaction = async (data) => {
    try{
        const response = await url.post(`${url}/transaction`, data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message
        throw new Error(message);
    }
}

