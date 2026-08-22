import axios from "axios";

import { API_BASE_URL } from "../config";

const API = `${API_BASE_URL}/api/auth`;
// Register
export const registerUser = async (userData) => {
  const response = await axios.post(`${API}/register`, userData);
  return response.data;
};

// Login
export const loginUser = async (userData) => {
  const response = await axios.post(`${API}/login`, userData);

  //  SAVE EVERYTHING YOU NEED
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("email", response.data.email);
  localStorage.setItem("name", response.data.name);

  return response.data;
};