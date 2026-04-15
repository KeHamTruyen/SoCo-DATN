import { searchAll } from "../services/search.service.js";

function parseTypes(rawTypes) {
    if (!rawTypes) return ["products", "users", "posts"];
    const allowed = new Set(["products", "users", "posts"]);
    const parsed = String(rawTypes)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter((value) => allowed.has(value));
    return parsed.length > 0 ? parsed : ["products", "users", "posts"];
}

export const search = async (req, res, next) => {
    try {
        const q = String(req.query.q ?? "").trim();
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "q is required",
            });
        }

        const result = await searchAll({
            query: q,
            page: req.query.page,
            limit: req.query.limit,
            types: parseTypes(req.query.types),
            userId: req.user?.id ?? null,
        });

        return res.json({
            success: true,
            query: q,
            data: result,
        });
    } catch (error) {
        return next(error);
    }
};
