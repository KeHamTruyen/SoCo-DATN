import prisma from '../config/database.js';
import slugify from 'slugify';

class CategoryService {
  /**
   * Walk parent chain from nodeId upward; return true if ancestorId appears (node is under ancestor subtree).
   */
  async isAncestorOf(ancestorId, nodeId) {
    let cursor = nodeId;
    while (cursor) {
      if (cursor === ancestorId) return true;
      const row = await prisma.category.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = row?.parentId ?? null;
    }
    return false;
  }

  /**
   * Admin: list categories (optionally include inactive).
   */
  async listCategoriesAdmin({ includeInactive = false } = {}) {
    const where = includeInactive ? {} : { isActive: true };
    return prisma.category.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: true,
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Admin: get category by id (any active state).
   */
  async getCategoryByIdAdmin(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  /**
   * Admin: create category.
   */
  async createCategoryAdmin(data) {
    const {
      name,
      slug: slugInput,
      description,
      iconUrl,
      parentId,
      displayOrder = 0,
      isActive = true,
    } = data;

    let slug = slugInput?.trim()
      ? slugify(slugInput.trim(), { lower: true, strict: true })
      : slugify(name, { lower: true, strict: true });

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    return prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        iconUrl: iconUrl?.trim() || null,
        parentId: parentId || null,
        displayOrder,
        isActive,
      },
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Admin: update category.
   */
  async updateCategoryAdmin(id, data) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Category not found');
    }

    const next = { ...data };

    if (next.name !== undefined) next.name = next.name.trim();
    if (next.description !== undefined) next.description = next.description?.trim() || null;
    if (next.iconUrl !== undefined) next.iconUrl = next.iconUrl?.trim() || null;

    if (next.slug !== undefined && next.slug?.trim()) {
      next.slug = slugify(next.slug.trim(), { lower: true, strict: true });
      const slugTaken = await prisma.category.findFirst({
        where: { slug: next.slug, NOT: { id } },
      });
      if (slugTaken) {
        throw new Error('Slug already in use');
      }
    } else if (next.slug !== undefined) {
      delete next.slug;
    }

    if (next.parentId !== undefined) {
      const newParentId = next.parentId;
      if (newParentId === null) {
        next.parentId = null;
      } else {
        if (newParentId === id) {
          throw new Error('Category cannot be its own parent');
        }
        const parent = await prisma.category.findUnique({ where: { id: newParentId } });
        if (!parent) {
          throw new Error('Parent category not found');
        }
        const cycle = await this.isAncestorOf(id, newParentId);
        if (cycle) {
          throw new Error('Invalid parent: would create a cycle in the category tree');
        }
      }
    }

    return prisma.category.update({
      where: { id },
      data: next,
      include: {
        parent: true,
        children: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { products: true } },
      },
    });
  }

  /**
   * Admin: soft-delete (deactivate) category.
   */
  async deactivateCategoryAdmin(id) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Category not found');
    }
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

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
