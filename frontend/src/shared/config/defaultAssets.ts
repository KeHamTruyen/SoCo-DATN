/** Matches backend DEFAULT_USER_AVATAR_URL / Cloudinary default. */
export const DEFAULT_USER_AVATAR_URL =
    (import.meta.env.VITE_DEFAULT_USER_AVATAR_URL as string | undefined)?.trim() ||
    "https://res.cloudinary.com/dqtcggvvu/image/upload/v1773908008/default_avatar_us554i.webp";
