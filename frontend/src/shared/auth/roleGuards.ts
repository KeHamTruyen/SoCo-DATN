/** Platform admins use `/api/admin` and are not buyer/seller `User.role`. */
export function isAdminRole(role: string | undefined | null): boolean {
    return role?.toUpperCase() === "ADMIN";
}

export function isCustomerAppRole(role: string | undefined | null): boolean {
    if (role == null || role === "") return false;
    const r = role.toUpperCase();
    return r === "BUYER" || r === "SELLER";
}
