import axios from 'axios';

const axi = axios.create({
    baseURL: 'https://privateuploader.com/api/v3',
});

axi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.common['Authorization'] = token;
    }
    return config;
});

export default axi;
