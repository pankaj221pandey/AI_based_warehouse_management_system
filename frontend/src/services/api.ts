import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Metrics {
  total_products: number;
  total_orders: number;
  total_sales: number;
  total_revenue: number;
  avg_revenue: number;
  top_products: any[];
}

export interface Product {
  id: string;
  sku: string;
  msku?: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  cost?: number;
}

export interface AIQueryRequest {
  query: string;
  chart_type?: string;
  openai_key?: string;
}

export interface AIQueryResponse {
  query: string;
  sql: string;
  result: any;
  chart_data?: any;
}

// API functions
export const getMetrics = async (): Promise<Metrics> => {
  const response = await api.get('/api/metrics');
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/api/products');
  return response.data.products;
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post('/api/products', product);
  return response.data.product;
};

export const uploadSalesData = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getSKUMappings = async (): Promise<any[]> => {
  const response = await api.get('/api/sku-mappings');
  return response.data.mappings;
};

export const createSKUMapping = async (sku: string, msku: string, marketplace?: string): Promise<any> => {
  const response = await api.post('/api/sku-mappings', {
    sku,
    msku,
    marketplace,
  });
  return response.data.mapping;
};

export const submitAIQuery = async (query: AIQueryRequest): Promise<AIQueryResponse> => {
  const response = await api.post('/api/query', query);
  return response.data;
};

export default api; 