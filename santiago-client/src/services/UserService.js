import axios from 'axios';
import constants from '../constants';

const API = axios.create({
  baseURL: `${constants.HOST}/users`,
});

export const fetchUsers = (config) => API.get('/', config);
export const createUser = (user) => API.post('/', user);
export const updateUser = (id, user) => API.put(`/${id}`, user);
export const deleteUser = (id) => API.delete(`/${id}`);
export const loginUser = (credentials) => API.post('/login', credentials);
