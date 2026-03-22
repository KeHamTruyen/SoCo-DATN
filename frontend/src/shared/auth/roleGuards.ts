/** Prisma/API roles are uppercase; UI may use lowercase. */
export function isAdminRole(role: string | undefined | null): boolean {
    return role?.toUpperCase() === "ADMIN";
}

export function isCustomerAppRole(role: string | undefined | null): boolean {
    if (role == null || role === "") return false;
    const r = role.toUpperCase();
    return r === "BUYER" || r === "SELLER";
}
