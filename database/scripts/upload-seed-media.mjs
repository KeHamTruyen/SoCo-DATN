/**
 * Download seed photos and put them in Supabase Storage bucket `seed-media`.
 * Needs SUPABASE_SERVICE_ROLE_KEY (never commit it).
 *
 *   npx supabase projects api-keys --project-ref xzajhecxvfixpjrhixir
 *   SUPABASE_SERVICE_ROLE_KEY=... node database/scripts/upload-seed-media.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = "xzajhecxvfixpjrhixir";
const BUCKET = "seed-media";
const BASE = `https://${PROJECT}.supabase.co/storage/v1`;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FALLBACK = {
    "1539571696357-5b2c638e1f0c": "1560250097-0b93528c311a",
};
const SOURCE = {
    "1603314585442-ee3b3c16fbcf":
        "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1200&q=80&fm=jpg",
    "1583863788434-e58a256e6a1d":
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80&fm=jpg",
    "1570222094114-d058a4482660":
        "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "1571781926291-c77da61d1c2c":
        "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "1556228578-8d5894dbd8bf":
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80&fm=jpg",
    "1507473885765-e6cff1f5fcfb":
        "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "1555041469-a586c61ea9bc":
        "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

if (!KEY) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is required");
    process.exit(1);
}

function collectIds() {
    const files = ["prisma/seed.js", "prisma/seed-demo.js"].map((f) =>
        fs.readFileSync(path.join(ROOT, f), "utf8"),
    );
    const ids = new Set();
    for (const text of files) {
        for (const m of text.matchAll(/PHOTO\("([0-9a-z-]+)"/g)) ids.add(m[1]);
        for (const m of text.matchAll(/images\.unsplash\.com\/photo-([0-9a-z-]+)/g))
            ids.add(m[1]);
    }
    return [...ids];
}

async function downloadJpeg(id) {
    const sourceId = FALLBACK[id] || id;
    const urls = [
        SOURCE[id],
        `https://images.unsplash.com/photo-${sourceId}?auto=format&fit=crop&w=1200&q=80&fm=jpg`,
        `https://picsum.photos/seed/${id}/1200/900.jpg`,
    ].filter(Boolean);
    for (const url of urls) {
        const res = await fetch(url, {
            headers: { "User-Agent": "SoCo-DATN-seed-media/1.0" },
            redirect: "follow",
        });
        const type = res.headers.get("content-type") || "";
        if (!res.ok || !type.includes("image")) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length < 2000) continue;
        return buf;
    }
    throw new Error(`no image for ${id}`);
}

async function upload(id, buf) {
    const res = await fetch(`${BASE}/object/${BUCKET}/${id}.jpg`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${KEY}`,
            apikey: KEY,
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
        body: buf,
    });
    if (!res.ok) {
        throw new Error(`upload ${id}: ${res.status} ${await res.text()}`);
    }
}

const ids = collectIds();
let ok = 0;
for (const id of ids) {
    const buf = await downloadJpeg(id);
    await upload(id, buf);
    ok += 1;
    console.log(`stored ${id}.jpg (${buf.length} bytes)`);
}

const probeId = ids[0];
const pub = `${BASE}/object/public/${BUCKET}/${probeId}.jpg`;
const probe = await fetch(pub, { method: "HEAD" });
if (probe.status !== 200) {
    throw new Error(`public read failed ${probe.status} ${pub}`);
}
console.log(`uploaded ${ok} files; public probe 200 ${pub}`);
