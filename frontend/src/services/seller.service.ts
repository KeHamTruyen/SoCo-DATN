import api from './api';

export interface SellerApplication {
  id: string;
  userId: string;
  step1Completed: boolean;
  step2Completed: boolean;
  step3Completed: boolean;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  verifiedAt?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const sellerService = {
  startApplication: async (): Promise<ApiResponse<{ application: SellerApplication }>> => {
    const response = await api.post<ApiResponse<{ application: SellerApplication }>>('/seller/apply');
    return response.data;
  },

  getStatus: async (): Promise<
    ApiResponse<{
      status: 'not_started' | 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
      step1Completed?: boolean;
      step2Completed?: boolean;
      step3Completed?: boolean;
      rejectionReason?: string | null;
      verifiedAt?: string | null;
      createdAt?: string;
    }>
  > => {
    const response = await api.get('/seller/status');
    return response.data;
  },

  submitStep1: async (payload: {
    idCardNumber: string;
    idCardFrontUrl?: string;
    idCardBackUrl?: string;
    dateOfBirth?: string;
    address?: string;
  }): Promise<ApiResponse<{ application: SellerApplication }>> => {
    const response = await api.put('/seller/step1', payload);
    return response.data;
  },

  submitStep2: async (payload: {
    businessName: string;
    businessType?: string;
    businessLicenseNumber?: string;
    businessLicenseUrl?: string;
    taxCode?: string;
  }): Promise<ApiResponse<{ application: SellerApplication }>> => {
    const response = await api.put('/seller/step2', payload);
    return response.data;
  },

  submitStep3: async (payload: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountName?: string;
    bankBranch?: string;
  }): Promise<ApiResponse<{ application: SellerApplication }>> => {
    const response = await api.put('/seller/step3', payload);
    return response.data;
  },
};

export default sellerService;
