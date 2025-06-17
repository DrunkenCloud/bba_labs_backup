import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

export interface UserIdentity {
  jwk: string;
  did: string;
}

export interface CredentialRequest {
  subject_did: string;
  name: string;
  job_title: string;
}

export interface CredentialResponse {
  credential: any;
}

export interface PresentationRequest {
  verifiable_credential: any;
  holder_jwk: string;
}

export interface PresentationResponse {
  presentation: any;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  signed_presentation: any;
  email: string;
  password: string;
  otp: string;
  VP: any;
}

const api = {
  generateIdentity: async (): Promise<UserIdentity> => {
    const response = await axios.post(`${API_BASE_URL}/generate-identity`);
    return response.data;
  },

  createCredential: async (data: CredentialRequest): Promise<CredentialResponse> => {
    const response = await axios.post(`${API_BASE_URL}/create-credential`, data);
    return response.data;
  },

  createPresentation: async (data: PresentationRequest): Promise<PresentationResponse> => {
    const response = await axios.post(`${API_BASE_URL}/create-presentation`, data);
    return response.data;
  },

  register: async (data: UserCreate) => {
    const response = await axios.post(`${API_BASE_URL}/register`, data);
    return response.data;
  },

  getOTP: async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/get-otp`, { email });
    return response.data;
  },

  login: async (data: UserLogin) => {
    const response = await axios.post(`${API_BASE_URL}/login`, data);
    return response.data;
  },
};

export default api; 