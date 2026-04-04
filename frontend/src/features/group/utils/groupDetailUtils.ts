export const GRADIENT_PAIRS = [
    "from-orange-400 to-rose-500",
    "from-blue-500 to-purple-600",
    "from-emerald-400 to-teal-600",
    "from-pink-400 to-violet-500",
    "from-amber-400 to-orange-600",
    "from-cyan-400 to-blue-600",
    "from-lime-400 to-emerald-600",
    "from-fuchsia-400 to-pink-600",
];

export const AVATAR_COLORS = [
    "bg-blue-600",
    "bg-primary",
    "bg-emerald-600",
    "bg-red-600",
    "bg-yellow-600",
    "bg-violet-600",
];

export function getGradient(name: string): string {
    return GRADIENT_PAIRS[name.charCodeAt(0) % GRADIENT_PAIRS.length];
}

export function getAvatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3);
}

export async function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
}
