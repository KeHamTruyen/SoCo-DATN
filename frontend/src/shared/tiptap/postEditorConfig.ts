import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

const DEFAULT_PLACEHOLDER =
    "Soạn bài đăng tại đây — có thể dùng AI bên trái để gợi ý nội dung.";

/** Extensions dùng chung cho modal đăng bài và AI Lab. */
export function createPostEditorExtensions(placeholder: string = DEFAULT_PLACEHOLDER) {
    return [
        StarterKit.configure({
            heading: { levels: [2, 3] },
        }),
        Underline,
        Placeholder.configure({ placeholder }),
        Image.configure({
            inline: false,
            allowBase64: true,
        }),
    ];
}

/** Phiên bản mặc định (placeholder cố định) — tham chiếu ổn định cho useEditor. */
export const POST_EDITOR_EXTENSIONS = createPostEditorExtensions();

const PROSEMIRROR_INNER_CLASS =
    "min-h-[160px] w-full max-w-none px-1 py-2 text-base leading-relaxed outline-none " +
    "font-[family-name:var(--font-display)] " +
    "text-neutral-900 dark:text-neutral-100 " +
    "[&_p]:my-2 [&_p:first-child]:mt-0 " +
    "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:tracking-tight " +
    "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-lg [&_h3]:font-bold " +
    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 " +
    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 " +
    "[&_img]:max-h-48 [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-200 [&_img]:dark:border-neutral-700";

export const POST_EDITOR_HTML_PROPS = {
    attributes: {
        class: PROSEMIRROR_INNER_CLASS,
    },
} as const;

/** Editor nhỏ gọn cho modal (chiều cao tối thiểu thấp hơn AI Lab). */
const MODAL_EDITOR_CLASS =
    "min-h-[120px] w-full max-w-none px-1 py-2 text-base leading-relaxed outline-none " +
    "font-[family-name:var(--font-display)] " +
    "text-neutral-900 dark:text-neutral-100 " +
    "[&_p]:my-2 [&_p:first-child]:mt-0 " +
    "[&_h2]:mb-2 [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-bold " +
    "[&_h3]:mb-1 [&_h3]:mt-1 [&_h3]:text-base [&_h3]:font-semibold " +
    "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 " +
    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 " +
    "[&_img]:max-h-40 [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-200 [&_img]:dark:border-neutral-700";

export const POST_MODAL_EDITOR_HTML_PROPS = {
    attributes: {
        class: MODAL_EDITOR_CLASS,
    },
} as const;
