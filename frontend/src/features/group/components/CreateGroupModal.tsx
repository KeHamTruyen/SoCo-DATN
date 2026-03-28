import { Globe, Lock, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupApi } from "../api/groupApi";

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (groupId: string) => void;
}

export function CreateGroupModal({ open, onClose, onCreated }: CreateGroupModalProps) {
    const navigate = useNavigate();
    const backdropRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            setName("");
            setDescription("");
            setPrivacy("public");
            setError(null);
            setTimeout(() => firstInputRef.current?.focus(), 50);
        }
    }, [open]);

    // Close via Escape
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === backdropRef.current) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Tên nhóm không được để trống.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const newGroup = await groupApi.createGroup({
                name: name.trim(),
                description: description.trim() || undefined,
                privacy,
            });
            onCreated?.(newGroup.id);
            onClose();
            navigate(`/groups/${newGroup.id}`);
        } catch {
            setError("Có lỗi xảy ra khi tạo nhóm. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-group-modal-title"
        >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <h2
                            id="create-group-modal-title"
                            className="text-lg font-bold text-neutral-900 dark:text-white"
                        >
                            Tạo nhóm mới
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5">
                    {/* Group Name */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="group-name"
                            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                        >
                            Tên nhóm <span className="text-red-500">*</span>
                        </label>
                        <input
                            ref={firstInputRef}
                            id="group-name"
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(null); }}
                            placeholder="Vd: Tech Enthusiasts, Sneakerheads..."
                            maxLength={100}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                        />
                        <p className="text-right text-[11px] text-neutral-400">{name.length}/100</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label
                            htmlFor="group-description"
                            className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                        >
                            Mô tả <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
                        </label>
                        <textarea
                            id="group-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Giới thiệu ngắn về nhóm của bạn..."
                            rows={3}
                            maxLength={500}
                            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                        />
                        <p className="text-right text-[11px] text-neutral-400">{description.length}/500</p>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                            Quyền riêng tư
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPrivacy("public")}
                                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                    privacy === "public"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                                }`}
                            >
                                <Globe className="h-6 w-6" />
                                <div className="text-center">
                                    <p className="text-sm font-bold">Công khai</p>
                                    <p className="text-[11px] opacity-70">Ai cũng có thể tham gia</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPrivacy("private")}
                                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                                    privacy === "private"
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                                }`}
                            >
                                <Lock className="h-6 w-6" />
                                <div className="text-center">
                                    <p className="text-sm font-bold">Riêng tư</p>
                                    <p className="text-[11px] opacity-70">Cần duyệt để tham gia</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Users className="h-4 w-4" />
                                    Tạo nhóm
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
