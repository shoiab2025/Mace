import axios from 'axios';

const API_ENDPOINT = "https://nexgen-e.com/api";

export const fetchDatas = async (method, url, data = null) => {
    try {
        const config = {
            method: method.toLowerCase(),
            url: `${API_ENDPOINT}${url}`,
        };

        // Add data to config for POST, PUT, DELETE methods
        if (data && ['post', 'put', 'delete'].includes(config.method)) {
            config.data = data;
        }

        console.log(config);
        const response = await axios(config);
        console.log("te response", response        );
        return response.data;

    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        throw error;
    }
};