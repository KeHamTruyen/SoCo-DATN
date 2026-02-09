import api from './api';

export interface Product {
  id: string;
  sellerId: string;
  categoryId?: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  weight?: number;
  dimensions?: any;
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  seller?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
    isVerified: boolean;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  _count?: {
    reviews: number;
    orderItems?: number;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantName: string;
  sku?: string;
  price?: number;
  stockQuantity: number;
  options: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  user?: {
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  sellerId?: string;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  title: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: string;
  stockQuantity?: number;
  sku?: string;
  weight?: number;
  images?: { url: string; altText?: string }[];
  variants?: {
    name: string;
    sku?: string;
    price?: number;
    stockQuantity?: number;
    options?: any;
  }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';
}

class ProductService {
  /**
   * Get all products with filters
   */
  async getProducts(filters?: ProductFilters) {
    const response = await api.get('/products', { params: filters });
    return response.data;
  }

  /**
   * Get single product by ID or slug
   */
  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  /**
   * Get current seller's products
   */
  async getMyProducts(filters?: { page?: number; limit?: number; status?: string }) {
    const response = await api.get('/products/seller/me', { params: filters });
    return response.data;
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductData) {
    const response = await api.post('/products', data);
    return response.data;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  /**
   * Delete product (archive)
   */
  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  /**
   * Publish product
   */
  async publishProduct(id: string) {
    const response = await api.post(`/products/${id}/publish`);
    return response.data;
  }

  /**
   * Add product images
   */
  async addProductImages(id: string, images: { url: string; altText?: string }[]) {
    const response = await api.post(`/products/${id}/images`, { images });
    return response.data;
  }

  /**
   * Delete product image
   */
  async deleteProductImage(productId: string, imageId: string) {
    const response = await api.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  }
}

export default new ProductService();
