/**
 * Shared CASL ability factory for SoCo admin (BE + FE).
 * @see docs/adr/0003-admin-casl-authz-and-demo.md
 */
import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export const ADMIN_PROFILES = Object.freeze([
    "super",
    "moderator",
    "ops",
    "demo",
]);

/**
 * @param {unknown} permissions - `admins.permissions` Json
 * @returns {"super"|"moderator"|"ops"|"demo"}
 */
export function resolveAdminProfile(permissions) {
    if (
        permissions &&
        typeof permissions === "object" &&
        !Array.isArray(permissions) &&
        typeof permissions.profile === "string" &&
        ADMIN_PROFILES.includes(permissions.profile)
    ) {
        return permissions.profile;
    }
    // Legacy rows without profile keep full access until reseed.
    return "super";
}

/**
 * @param {string} [profile]
 */
export function createAdminAbility(profile = "super") {
    const { can, build } = new AbilityBuilder(createMongoAbility);
    const p = ADMIN_PROFILES.includes(profile) ? profile : "super";

    if (p === "super") {
        can("manage", "all");
        return build();
    }

    can("read", "Dashboard");
    can("read", "Settings");

    if (p === "moderator") {
        can("read", "Report");
        can("resolve", "Report");
        can("read", "Post");
        can("delete", "Post");
        can("read", "Product");
        can("delete", "Product");
        can("read", "User");
    }

    if (p === "ops") {
        can("read", "Category");
        can("manage", "Category");
        can("read", "SellerApplication");
        can("review", "SellerApplication");
        can("read", "SensitiveChange");
        can("review", "SensitiveChange");
    }

    if (p === "demo") {
        can("read", "User");
        can("read", "Post");
        can("read", "Product");
        can("read", "Category");
        can("read", "Report");
        can("resolve", "Report");
        can("read", "SellerApplication");
        can("review", "SellerApplication");
        can("read", "SensitiveChange");
        can("review", "SensitiveChange");
    }

    return build();
}

/** Map SPA path → subject required to see the page (read). */
export const ADMIN_NAV_ABILITY = Object.freeze([
    { to: "/", subject: "Dashboard" },
    { to: "/reports", subject: "Report" },
    { to: "/users", subject: "User" },
    { to: "/content", subject: "Post" },
    { to: "/categories", subject: "Category" },
    { to: "/sellers", subject: "SellerApplication" },
    { to: "/settings", subject: "Settings" },
]);

const ABILITY_SUBJECTS = Object.freeze([
    "Dashboard",
    "Settings",
    "User",
    "Post",
    "Product",
    "Category",
    "Report",
    "SellerApplication",
    "SensitiveChange",
]);

const ABILITY_ACTIONS = Object.freeze([
    "read",
    "update",
    "delete",
    "resolve",
    "review",
    "manage",
]);

/**
 * Read-only labels for Settings UI (not a security boundary).
 * @param {string} [profile]
 * @returns {string[]}
 */
export function listAbilityLabels(profile = "super") {
    const ability = createAdminAbility(profile);
    if (ability.can("manage", "all")) return ["manage all"];

    const labels = [];
    for (const subject of ABILITY_SUBJECTS) {
        for (const action of ABILITY_ACTIONS) {
            if (ability.can(action, subject)) {
                labels.push(`${action} ${subject}`);
            }
        }
    }
    return labels;
}
