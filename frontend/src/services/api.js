import axios from "axios";

const api = axios.create({
    baseURL: "https://jw0yvet0t5.execute-api.ap-southeast-1.amazonaws.com"
});

api.interceptors.request.use((config) => {
    const idToken = localStorage.getItem("idToken");
    const token = idToken || localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;