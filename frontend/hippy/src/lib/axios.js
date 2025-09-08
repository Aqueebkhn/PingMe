import axios from 'axios';


const instance = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: true,
 });// Replace with your backend URL

export default instance;