import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001',
});

export const requestData = async (endpoint, options = {}) => {
  const { data } = await instance.get(endpoint, options);
  return data;
};

export default instance;
