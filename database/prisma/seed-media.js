/** Public files in Supabase Storage bucket `seed-media` (not Unsplash hotlinks). */
export const SEED_MEDIA_BASE =
    "https://xzajhecxvfixpjrhixir.supabase.co/storage/v1/object/public/seed-media";

export const PHOTO = (id, _w = 800) => `${SEED_MEDIA_BASE}/${id}.jpg?v=2`;
