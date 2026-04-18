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

function parseSource(rawValue) {
    const value = String(rawValue ?? "").trim().toLowerCase();
    if (value === "follower" || value === "followee" || value === "all") return value;
    return "all";
}

function parsePostsSort(rawValue) {
    const value = String(rawValue ?? "").trim().toLowerCase();
    return value === "latest" ? "latest" : "latest";
}

function parseDate(rawValue, endOfDay = false) {
    const value = String(rawValue ?? "").trim();
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);
    return date;
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
            postsSource: parseSource(req.query.postsSource),
            peopleSource: parseSource(req.query.peopleSource),
            postsSort: parsePostsSort(req.query.postsSort),
            postedFrom: parseDate(req.query.postedFrom, false),
            postedTo: parseDate(req.query.postedTo, true),
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
