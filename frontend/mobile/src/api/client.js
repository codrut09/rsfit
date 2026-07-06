import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Authorization expired or invalid.');
      // Clear token and prompt to re-login in frontend context
    }
    return Promise.reject(error);
  }
);

export default client;
