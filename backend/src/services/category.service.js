import prisma from '../config/database.js';

class CategoryService {
  /**
   * Get all categories with hierarchy
   */
  async getCategories() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return categories;
  }

  /**
   * Get category by ID or slug
   */
  async getCategory(identifier) {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier }
        ],
        isActive: true
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories() {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true
      },
      orderBy: { displayOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    return categories;
  }
}

export default new CategoryService();
