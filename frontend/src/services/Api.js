import axios from 'axios'

const url = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    },
});


export const getTransactions = async () => {
    try {
        const response = await url.get(`/transactions`);
        
        console.log('Response Data:', response);
        return response.data;
        
    } catch (error) {
        const message = error.response?.data?.message || error.message
        throw new Error(message);
    }
};

export const createTransaction = async (data) => {
    try{
        const response = await url.post(`/transactions`, data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message
        throw new Error(message);
    }
}

export const deleteTransaction = async (id) => {
    try {
        console.log("Attempting to delete ID:", id); 
        // เช็กค่า URL ที่ Axios จะยิงไปจริง ๆ
        const response = await url.delete(`/transactions/${id}`); 
        return response.data;
    } catch (error) {
        console.error("Delete Error Detail:", error); // ดู Error เชิงลึกใน Console
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
    }
}

export const updateTransaction = async (id, data) => {
    try {
        const response = await url.put(`/transactions/${id}`, data);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message;
        throw new Error(message);
    }
};