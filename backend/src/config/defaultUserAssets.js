/** Default profile avatar (Cloudinary). Override with DEFAULT_USER_AVATAR_URL in .env */
export const DEFAULT_USER_AVATAR_URL =
    (process.env.DEFAULT_USER_AVATAR_URL &&
        process.env.DEFAULT_USER_AVATAR_URL.trim()) ||
    "https://res.cloudinary.com/dqtcggvvu/image/upload/v1773908008/default_avatar_us554i.webp";
