import api from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    products: number;
  };
}

class CategoryService {
  /**
   * Get all categories
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  }

  /**
   * Get category by ID or slug
   */
  async getCategory(id: string) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  /**
   * Get root categories only
   */
  async getRootCategories() {
    const response = await api.get('/categories/root');
    return response.data;
  }
}

export default new CategoryService();
