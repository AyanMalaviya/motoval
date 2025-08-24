import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_CAR_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_CAR_API_TOKEN;
const API_SECRET = import.meta.env.VITE_CAR_API_SECRET;

// Create axios instance
const carApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// JWT token storage
let jwtToken: string;

// Authentication function
export const authenticateCarAPI = async (): Promise<string> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      api_token: API_TOKEN,
      api_secret: API_SECRET,
    });
    
    jwtToken = response.data;
    
    // Set default authorization header
    carApiClient.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    return jwtToken;

  } catch (error) {
    console.error('CarAPI authentication failed:', error);
    throw new Error('Failed to authenticate with CarAPI');
  }
};

// Request interceptor to ensure authentication
carApiClient.interceptors.request.use(async (config) => {
  if (!jwtToken && API_TOKEN && API_SECRET) {
    await authenticateCarAPI();
  }
  return config;
});

// Car API interface based on CarAPI.app structure
export interface CarAPIResponse {
  id: number;
  make_id: number;
  make_model_id: number;
  make_model_trim_id: number;
  year: number;
  make: string;
  model: string;
  trim?: string;
  body?: string;
  engine?: string;
  engine_cc?: number;
  engine_cyl?: number;
  engine_type?: string;
  engine_valves_per_cyl?: number;
  engine_power_ps?: number;
  engine_power_rpm?: number;
  engine_torque_nm?: number;
  engine_torque_rpm?: number;
  engine_bore_mm?: number;
  engine_stroke_mm?: number;
  engine_compression?: string;
  engine_fuel?: string;
  top_speed_kph?: number;
  drive?: string;
  transmission_type?: string;
  seats?: number;
  doors?: number;
  weight_kg?: number;
  length_mm?: number;
  width_mm?: number;
  height_mm?: number;
  wheelbase_mm?: number;
  lkm_hwy?: number;
  lkm_mixed?: number;
  lkm_city?: number;
  fuel_cap_l?: number;
  sold_in_us?: boolean;
  co2?: number;
  make_display?: string;
  make_country?: string;
}

// API service functions
export const carApiService = {
  // Get all makes
  getMakes: async () => {
    try {
      const response = await carApiClient.get('/makes');
      return response.data;
    } catch (error) {
      console.error('Error fetching makes:', error);
      throw error;
    }
  },

  // Get models by make
  getModelsByMake: async (makeId: number) => {
    try {
      const response = await carApiClient.get(`/models?make_id=${makeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  // Get trims (specific car configurations)
  getTrims: async (params?: {
    make_id?: number;
    model_id?: number;
    year?: number;
    limit?: number;
    page?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await carApiClient.get(`/trims?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trims:', error);
      throw error;
    }
  },

  // Get specific trim details
  getTrimById: async (trimId: number) => {
    try {
      const response = await carApiClient.get(`/trims/${trimId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trim details:', error);
      throw error;
    }
  }
};
