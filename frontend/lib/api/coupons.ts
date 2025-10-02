import ApiInstance, { AdminApiInstance } from '../api';

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableServices: ('airport' | 'yoga' | 'rental' | 'adventure')[];
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  currentUsageCount: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationRequest {
  code: string;
  serviceType: 'airport' | 'yoga' | 'rental' | 'adventure';
  orderValue: number;
  userId?: string;
  phoneNumber?: string;
}

export interface CouponValidationResponse {
  success: boolean;
  message: string;
  data?: {
    coupon: {
      code: string;
      description: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
    };
    discount: number;
    finalAmount: number;
  };
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableServices: ('airport' | 'yoga' | 'rental' | 'adventure')[];
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
}

export interface CouponsResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CouponStatistics {
  overview: {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    totalUsages: number;
    totalDiscountGiven: number;
  };
  mostUsedCoupons: Array<{
    _id: string;
    code: string;
    description: string;
    usageCount: number;
    totalDiscount: number;
  }>;
}

// Public API functions (no auth required)
export const validateCoupon = async (data: CouponValidationRequest): Promise<CouponValidationResponse> => {
  return await ApiInstance.post('/coupons/validate', data);
};

// Admin API functions (auth required)
export const couponAPI = {
  // Create new coupon
  createCoupon: async (data: CreateCouponRequest) => {
    return await AdminApiInstance.post('/coupons', data);
  },

  // Get all coupons with pagination and filters
  getAllCoupons: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    serviceType?: string;
    discountType?: string;
    validFrom?: string;
    validUntil?: string;
  }) => {
    return await AdminApiInstance.get('/coupons', { params });
  },

  // Get coupon by ID
  getCouponById: async (id: string) => {
    return await AdminApiInstance.get(`/coupons/${id}`);
  },

  // Update coupon
  updateCoupon: async (id: string, data: Partial<CreateCouponRequest>) => {
    return await AdminApiInstance.put(`/coupons/${id}`, data);
  },

  // Toggle coupon status (activate/deactivate)
  toggleCouponStatus: async (id: string) => {
    return await AdminApiInstance.patch(`/coupons/${id}/toggle-status`);
  },

  // Delete coupon
  deleteCoupon: async (id: string) => {
    return await AdminApiInstance.delete(`/coupons/${id}`);
  },

  // Get coupon statistics
  getCouponStatistics: async () => {
    return await AdminApiInstance.get('/coupons/statistics');
  },
};

// Export individual functions for backward compatibility
export const createCoupon = couponAPI.createCoupon;
export const getAllCoupons = couponAPI.getAllCoupons;
export const getCouponById = couponAPI.getCouponById;
export const updateCoupon = couponAPI.updateCoupon;
export const toggleCouponStatus = couponAPI.toggleCouponStatus;
export const deleteCoupon = couponAPI.deleteCoupon;
export const getCouponStatistics = couponAPI.getCouponStatistics;