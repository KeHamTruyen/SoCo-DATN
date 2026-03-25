import categoryService from "../services/category.service.js";

class CategoryController {
    async adminListCategories(req, res, next) {
        try {
            const includeInactive =
                req.query.includeInactive === "true" || req.query.includeInactive === "1";
            const categories = await categoryService.listCategoriesAdmin({ includeInactive });

            res.json({
                success: true,
                data: categories,
            });
        } catch (error) {
            next(error);
        }
    }

    async adminGetCategory(req, res, next) {
        try {
            const category = await categoryService.getCategoryByIdAdmin(req.params.id);

            res.json({
                success: true,
                data: category,
            });
        } catch (error) {
            if (error.message === "Category not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async adminCreateCategory(req, res, next) {
        try {
            const category = await categoryService.createCategoryAdmin(req.body);

            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        } catch (error) {
            next(error);
        }
    }

    async adminUpdateCategory(req, res, next) {
        try {
            const category = await categoryService.updateCategoryAdmin(req.params.id, req.body);

            res.json({
                success: true,
                message: "Category updated successfully",
                data: category,
            });
        } catch (error) {
            if (error.message === "Category not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (
                error.message?.includes("Slug already") ||
                error.message?.includes("Invalid parent") ||
                error.message?.includes("own parent")
            ) {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async adminDeactivateCategory(req, res, next) {
        try {
            await categoryService.deactivateCategoryAdmin(req.params.id);

            res.json({
                success: true,
                message: "Category deactivated successfully",
            });
        } catch (error) {
            if (error.message === "Category not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

export default new CategoryController();
