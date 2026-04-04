import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "del",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "span",
    "div",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt", "class", "title"];

/** HTML an toàn để đưa vào dangerouslySetInnerHTML. */
export function sanitizePostHtml(html: string): string {
    if (!html?.trim()) return "";
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ADD_ATTR: ["target"],
    });
}

/** Nội dung có vẻ là HTML (TipTap / rich) thay vì plain text cũ. */
export function looksLikeRichPostContent(raw: string): boolean {
    const t = raw?.trim() ?? "";
    if (!t) return false;
    return /<[a-z][\s\S]*?>/i.test(t);
}

function escapePlainForHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Chuỗi khởi tạo cho TipTap: HTML có sẵn, hoặc plain text cũ → bọc &lt;p&gt; / &lt;br/&gt;.
 */
export function plainOrLegacyToPostHtml(raw: string | undefined | null): string {
    const t = raw?.trim() ?? "";
    if (!t) return "<p></p>";
    if (looksLikeRichPostContent(t)) return t;
    const blocks = t.split(/\n\n+/);
    return (
        blocks
            .map((block) => {
                const inner = block.split("\n").map(escapePlainForHtml).join("<br/>");
                return `<p>${inner}</p>`;
            })
            .join("") || "<p></p>"
    );
}

/** Preview một dòng (saved items, grid): bỏ HTML rồi cắt độ dài. */
export function truncatePlainPreview(raw: string | undefined | null, maxLen: number): string {
    const plain = stripHtmlToPlain(raw ?? "");
    if (plain.length <= maxLen) return plain;
    return `${plain.slice(0, maxLen).trimEnd()}…`;
}

/** Kiểm tra body TipTap rỗng (chỉ p trống / br). */
export function isPostBodyHtmlEmpty(html: string): boolean {
    const t = html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
    return t.length === 0;
}

/** Dùng cho preview / line-clamp: bỏ tag, giữ xuống dòng đơn giản. */
export function stripHtmlToPlain(html: string): string {
    if (!html) return "";
    if (typeof document !== "undefined") {
        const d = document.createElement("div");
        d.innerHTML = html;
        return (d.textContent ?? "").replace(/\s+/g, " ").trim();
    }
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
