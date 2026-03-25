export function isAdminRole(role: string | undefined | null): boolean {
    return role?.toUpperCase() === "ADMIN";
}

export function isCustomerAppRole(role: string | undefined | null): boolean {
    if (role == null || role === "") return false;
    const r = role.toUpperCase();
    return r === "BUYER" || r === "SELLER";
}

/** Prisma/API return `SELLER`; compare case-insensitively for UI. */
export function isSellerRole(role: string | undefined | null): boolean {
    return role?.toUpperCase() === "SELLER";
}
