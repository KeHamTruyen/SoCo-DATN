import { httpClient } from '../../../shared/api/httpClient';

export interface VoucherResponse {
  id: string;
  code: string;
  type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  currentUses: number;
  startsAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  creator: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface VoucherApplyResponse {
  voucherId: string;
  code: string;
  type: string;
  discount: number;
  isValid: boolean;
}

export const voucherApi = {
  /**
   * Apply voucher to order
   */
  applyVoucher: async (voucherCode: string, subtotal: number, cartDetails?: {
    categoryIds?: string[];
    productIds?: string[];
    sellerId?: string;
  }): Promise<VoucherApplyResponse> => {
    const response = (await httpClient.post('/vouchers/apply', {
      voucherCode,
      subtotal,
      ...cartDetails,
    }, { requiresAuth: true })) as any;
    return response as VoucherApplyResponse;
  },

  /**
   * Get user available vouchers
   */
  getAvailableVouchers: async (): Promise<VoucherResponse[]> => {
    const response = (await httpClient.get('/vouchers/me/available', { requiresAuth: true })) as any;
    return response?.vouchers ?? [];
  },

  /**
   * Get voucher by code (public)
   */
  getVoucherByCode: async (code: string): Promise<VoucherResponse> => {
    const response = (await httpClient.get(`/vouchers/code/${code}`)) as any;
    return response?.voucher;
  },

  /**
   * List all vouchers
   */
  listVouchers: async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<{ vouchers: VoucherResponse[]; pagination: any }> => {
    const response = (await httpClient.get('/vouchers', { /* no auth for listing */ })) as any;
    return {
      vouchers: response ?? [],
      pagination: response?.pagination ?? {},
    };
  },

  /**
   * Get voucher by ID
   */
  getVoucher: async (id: string): Promise<VoucherResponse> => {
    const response = (await httpClient.get(`/vouchers/${id}`)) as any;
    return response?.voucher;
  },

  /**
   * Create new voucher (seller/admin only)
   */
  createVoucher: async (data: {
    code: string;
    type: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING';
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    maxUses?: number;
    maxUsesPerUser?: number;
    applicableCategories?: string[];
    applicableProductIds?: string[];
    applicableSellers?: string[];
    excludedUserIds?: string[];
    startsAt: string;
    expiresAt: string;
  }): Promise<VoucherResponse> => {
    const response = (await httpClient.post('/vouchers', data, { requiresAuth: true })) as any;
    return response?.voucher;
  },

  /**
   * Update voucher
   */
  updateVoucher: async (id: string, data: Partial<{
    maxUses: number;
    status: string;
    applicableCategories: string[];
    applicableProductIds: string[];
    applicableSellers: string[];
    excludedUserIds: string[];
  }>): Promise<VoucherResponse> => {
    const response = (await httpClient.patch(`/vouchers/${id}`, data, { requiresAuth: true })) as any;
    return response?.voucher;
  },

  /**
   * Deactivate voucher
   */
  deactivateVoucher: async (id: string): Promise<VoucherResponse> => {
    const response = (await httpClient.delete(`/vouchers/${id}`, { requiresAuth: true })) as any;
    return response?.voucher;
  },
};
