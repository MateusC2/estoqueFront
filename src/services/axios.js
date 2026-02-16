import axios from "axios";

const BASE_URL = import.meta.env.VITE_URLAPI;
// const BASE_URL = "http://10.89.240.85:5000/api/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { accept: "application/json" },
});

const sheets = {
  getItems: (config) => api.get(`items`, config),
  getItemById: (idItem) => api.get(`items/${idItem}`),
  filterItems: (data) => api.post(`items/filter`, data),
  createItem: (itemData) => api.post(`items`, itemData),
  updateItemQuantity: (idItem, payload) => api.put(`items/${idItem}/quantity`, payload),
  updateItem: (idItem, itemData) => api.put(`items/${idItem}`, itemData),
  deleteItem: (idItem) => api.delete(`items/${idItem}`),
  getTransactions: () => api.get(`transactions`),
  getTransactionsByItem: (idItem) => api.get(`transactions/item/${idItem}`),
  getBrands: () => api.get(`items/brands`),
};

export default sheets;