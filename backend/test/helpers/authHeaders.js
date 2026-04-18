/**
 * @param {string} token
 * @returns {{ Authorization: string }}
 */
export function bearerAuth(token) {
    return { Authorization: `Bearer ${token}` };
}
