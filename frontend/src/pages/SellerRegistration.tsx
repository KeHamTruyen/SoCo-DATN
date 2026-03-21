import { ArrowLeft, BadgeCheck, Building2, Clock, CreditCard, ImagePlus, Loader2 } from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type Dispatch,
    type SetStateAction,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { sellerApi } from "../features/seller/api/sellerApi";
import type {
    SellerApplicationStatus,
    SellerRegistrationStep1,
    SellerRegistrationStep2,
    SellerRegistrationStep3,
} from "../features/seller/types/seller.types";
import { HttpError } from "../shared/api/httpClient";
import { useAuthSession } from "../shared/auth/useAuthSession";
import { BrandLogo } from "../shared/ui/organisms/brand-logo/BrandLogo";
import { Button } from "../shared/ui/atoms/button";
import { cn } from "../shared/lib/cn";

type Step = 1 | 2 | 3;

const STEPS = [
    { step: 1 as Step, label: "General Info", icon: <Building2 className="h-3.5 w-3.5" /> },
    { step: 2 as Step, label: "Verification", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
    { step: 3 as Step, label: "Payment Setup", icon: <CreditCard className="h-3.5 w-3.5" /> },
];

const CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion & Apparel" },
    { value: "home", label: "Home & Living" },
    { value: "beauty", label: "Beauty & Wellness" },
    { value: "other", label: "Other" },
];

const ID_TYPES = [
    { value: "national_id", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "business_license", label: "Business License" },
];

type PreviewKey = "logo" | "cover" | "idFront" | "idBack";

function messageForSellerRegistrationSubmitError(err: unknown): string {
    if (err instanceof HttpError) {
        const code = (err.details as { code?: string } | undefined)?.code;
        if (code === "SELLER_APPLICATION_LOCKED") {
            return "Đơn đăng ký của bạn đang được xem xét. Bạn không thể gửi lại cho đến khi có kết quả từ quản trị viên.";
        }
        if (code === "SELLER_APPLICATION_ALREADY_APPROVED") {
            return "Đơn đăng ký đã được duyệt. Vui lòng tải lại trang hoặc đăng nhập lại.";
        }
        if (code === "USER_ALREADY_SELLER") {
            return "Tài khoản của bạn đã là người bán.";
        }
    }
    return err instanceof Error ? err.message : "Unknown error";
}

export default function SellerRegistration() {
    const navigate = useNavigate();
    const { user, refreshProfile } = useAuthSession();
    const [applicationStatus, setApplicationStatus] = useState<SellerApplicationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState<string | null>(null);

    const loadApplicationStatus = useCallback(async () => {
        setStatusLoading(true);
        setStatusError(null);
        try {
            const s = await sellerApi.getApplicationStatus();
            setApplicationStatus(s);
        } catch (e) {
            setStatusError(e instanceof Error ? e.message : "Không tải được trạng thái đơn.");
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplicationStatus();
    }, [loadApplicationStatus]);

    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);

    const handleWithdrawReviewingApplication = useCallback(async () => {
        setWithdrawError(null);
        const ok = window.confirm(
            "Thu hồi đơn đang chờ duyệt? Toàn bộ dữ liệu trong đơn sẽ bị xóa và bạn có thể điền đơn mới. Ảnh đại diện/bìa trên hồ sơ (nếu đã cập nhật khi đăng ký) sẽ không tự động đổi lại.",
        );
        if (!ok) return;

        setWithdrawLoading(true);
        try {
            await sellerApi.withdrawReviewingApplication();
            await loadApplicationStatus();
        } catch (e) {
            const msg =
                e instanceof HttpError
                    ? e.message
                    : e instanceof Error
                      ? e.message
                      : "Không thể thu hồi đơn.";
            setWithdrawError(msg);
        } finally {
            setWithdrawLoading(false);
        }
    }, [loadApplicationStatus]);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const idFrontInputRef = useRef<HTMLInputElement>(null);
    const idBackInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const previewUrlsRef = useRef<Record<PreviewKey, string | null>>({
        logo: null,
        cover: null,
        idFront: null,
        idBack: null,
    });

    const [shopLogoFile, setShopLogoFile] = useState<File | null>(null);
    const [shopCoverFile, setShopCoverFile] = useState<File | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);

    const [shopLogoPreview, setShopLogoPreview] = useState<string | null>(null);
    const [shopCoverPreview, setShopCoverPreview] = useState<string | null>(null);
    const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
    const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

    useEffect(() => {
        const ref = previewUrlsRef;
        return () => {
            (["logo", "cover", "idFront", "idBack"] as PreviewKey[]).forEach((k) => {
                const u = ref.current[k];
                if (u) URL.revokeObjectURL(u);
            });
        };
    }, []);

    function bindLocalImage(
        key: PreviewKey,
        file: File | null,
        setFile: Dispatch<SetStateAction<File | null>>,
        setPreview: Dispatch<SetStateAction<string | null>>,
    ) {
        const prev = previewUrlsRef.current[key];
        if (prev) URL.revokeObjectURL(prev);
        if (!file) {
            previewUrlsRef.current[key] = null;
            setFile(null);
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        previewUrlsRef.current[key] = url;
        setFile(file);
        setPreview(url);
    }

    const [step1, setStep1] = useState<SellerRegistrationStep1>({
        shopName: "",
        shopCategory: "",
        shopDescription: "",
        shopAddress: "",
        contactPhone: "",
    });

    const [step2, setStep2] = useState<SellerRegistrationStep2>({
        idType: "national_id",
        idNumber: "",
    });

    const [step3, setStep3] = useState<SellerRegistrationStep3>({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });

    /** When true, after successful registration apply uploaded logo/cover to profile avatar/cover. */
    const [applyShopBrandingToProfile, setApplyShopBrandingToProfile] = useState(true);

    const progress = ((step - 1) / 3) * 100 + 33.33;

    const handleShopLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;
        setError(null);
        bindLocalImage("logo", file, setShopLogoFile, setShopLogoPreview);
    };

    const handleShopCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;
        setError(null);
        bindLocalImage("cover", file, setShopCoverFile, setShopCoverPreview);
    };

    const handleIdFrontChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;
        setError(null);
        bindLocalImage("idFront", file, setIdFrontFile, setIdFrontPreview);
    };

    const handleIdBackChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) return;
        setError(null);
        bindLocalImage("idBack", file, setIdBackFile, setIdBackPreview);
    };

    const goNext = () => {
        setError(null);
        if (step === 2) {
            if (!step2.idNumber.trim()) {
                setError("Please enter your ID number.");
                return;
            }
            if (!idFrontFile || !idBackFile) {
                setError("Please select both the front and back photos of your document (upload happens when you submit).");
                return;
            }
        }
        setStep((s) => Math.min(3, s + 1) as Step);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            if (!idFrontFile || !idBackFile) {
                setError("ID document images are required. Go back to step 2 and select both sides.");
                return;
            }

            try {
                await sellerApi.registerSeller(
                    { ...step1, ...step2, ...step3 },
                    {
                        idFront: idFrontFile,
                        idBack: idBackFile,
                        shopLogo: shopLogoFile ?? undefined,
                        shopCover: shopCoverFile ?? undefined,
                    },
                    { applyShopBrandingToProfile },
                );
            } catch (regErr) {
                setError(messageForSellerRegistrationSubmitError(regErr));
                return;
            }

            await refreshProfile();
            navigate("/seller-registration/success");
        } finally {
            setIsSubmitting(false);
        }
    };

    const shellClass =
        "flex min-h-screen flex-col items-center bg-background-light px-4 py-12 text-neutral-900 dark:bg-background-dark dark:text-neutral-100";

    if (statusLoading) {
        return (
            <div className={shellClass}>
                <div className="mb-8">
                    <BrandLogo />
                </div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" aria-hidden />
                    <p className="text-sm font-medium">Đang tải trạng thái đơn đăng ký…</p>
                </div>
            </div>
        );
    }

    if (statusError) {
        return (
            <div className={shellClass}>
                <div className="mb-8">
                    <BrandLogo />
                </div>
                <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-neutral-900">
                    <p className="text-sm text-red-600 dark:text-red-400">{statusError}</p>
                    <div className="mt-4 flex gap-3">
                        <Button onClick={() => void loadApplicationStatus()}>Thử lại</Button>
                        <Link to="/feed">
                            <Button variant="outline">Về bảng tin</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (user?.role === "SELLER" || applicationStatus?.status === "APPROVED") {
        return (
            <div className={shellClass}>
                <div className="mb-8">
                    <BrandLogo />
                </div>
                <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        Bạn đã là người bán
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Tài khoản của bạn đã có quyền bán hàng. Vào trung tâm người bán để quản lý cửa hàng.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/seller/dashboard">
                            <Button>Trung tâm người bán</Button>
                        </Link>
                        <Link to="/feed">
                            <Button variant="outline">Về bảng tin</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (applicationStatus?.status === "REVIEWING") {
        return (
            <div className={shellClass}>
                <div className="mb-8">
                    <BrandLogo />
                </div>
                <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-6 w-6" aria-hidden />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                        Đang chờ duyệt
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Đơn đăng ký bán hàng của bạn đã được gửi và đang được quản trị viên xem xét. Bạn sẽ nhận được
                        thông báo khi có kết quả. Nếu bạn muốn sửa đơn, có thể thu hồi đơn hiện tại và gửi đơn mới (quản
                        trị viên sẽ không còn thấy bản đã thu hồi).
                    </p>
                    {withdrawError ? (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {withdrawError}
                        </p>
                    ) : null}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link to="/feed">
                            <Button>Về bảng tin</Button>
                        </Link>
                        <Button
                            variant="destructive"
                            disabled={withdrawLoading}
                            onClick={() => void handleWithdrawReviewingApplication()}
                        >
                            {withdrawLoading ? "Đang thu hồi…" : "Thu hồi đơn và đăng ký lại"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={shellClass}>
            <div className="mb-8">
                <BrandLogo />
            </div>
            <div className="w-full max-w-4xl space-y-6">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Step {step} of 3
                            </p>
                            <h1 className="text-2xl font-bold">
                                {step === 1 ? "Shop Information" : step === 2 ? "Identity Verification" : "Payment Setup"}
                            </h1>
                        </div>
                        <span className="text-sm font-medium text-neutral-500">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {STEPS.map(({ step: s, label }) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                        step >= s
                                            ? "bg-primary text-white"
                                            : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700",
                                    )}
                                >
                                    {s}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        step >= s ? "font-semibold text-neutral-900 dark:text-neutral-100" : "text-neutral-400",
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    <div className="col-span-1 flex flex-col items-center">
                                        <label className="mb-3 block text-sm font-semibold">Shop Logo</label>
                                        <input
                                            ref={logoInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleShopLogoChange}
                                        />
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => logoInputRef.current?.click()}
                                            className="group relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        >
                                            {shopLogoPreview ? (
                                                <img
                                                    src={shopLogoPreview}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <ImagePlus className="mb-1 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                                    <span className="text-[10px] font-medium text-neutral-500">
                                                        CHOOSE FILE
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-2 text-center text-xs text-neutral-500">
                                            Uploads on final submit · Cloudinary · tối đa 3MB · ~512×512
                                        </p>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="mb-3 block text-sm font-semibold">Cover Photo</label>
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleShopCoverChange}
                                        />
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => coverInputRef.current?.click()}
                                            className="group relative flex h-32 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        >
                                            {shopCoverPreview ? (
                                                <img
                                                    src={shopCoverPreview}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <ImagePlus className="mb-1 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                                    <span className="text-xs font-medium text-neutral-500">
                                                        Click to choose shop banner
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Uploads on final submit · Cloudinary · tối đa 5MB · banner rộng
                                        </p>
                                    </div>
                                </div>

                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 p-4 dark:border-neutral-700 dark:bg-neutral-800/40">
                                    <input
                                        type="checkbox"
                                        checked={applyShopBrandingToProfile}
                                        onChange={(e) => setApplyShopBrandingToProfile(e.target.checked)}
                                        className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                        After submitting, use shop logo and banner as my profile avatar and cover
                                        photo (uncheck to keep my current buyer photos).
                                    </span>
                                </label>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Name</label>
                                        <input
                                            type="text"
                                            value={step1.shopName}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopName: e.target.value }))}
                                            placeholder="Enter your business name"
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Category</label>
                                        <select
                                            value={step1.shopCategory}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopCategory: e.target.value }))}
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        >
                                            <option value="">Select a category</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Shop Description</label>
                                    <textarea
                                        value={step1.shopDescription}
                                        onChange={(e) => setStep1((s) => ({ ...s, shopDescription: e.target.value }))}
                                        placeholder="Tell customers about your shop, brand values, and what you sell..."
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Address</label>
                                        <input
                                            type="text"
                                            value={step1.shopAddress}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopAddress: e.target.value }))}
                                            placeholder="Business address"
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={step1.contactPhone}
                                            onChange={(e) => setStep1((s) => ({ ...s, contactPhone: e.target.value }))}
                                            placeholder="+84 000 000 000"
                                            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">ID Document Type</label>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        {ID_TYPES.map((type) => (
                                            <label
                                                key={type.value}
                                                className={cn(
                                                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                                                    step2.idType === type.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800",
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="idType"
                                                    value={type.value}
                                                    checked={step2.idType === type.value}
                                                    onChange={() =>
                                                        setStep2((s) => ({
                                                            ...s,
                                                            idType: type.value as SellerRegistrationStep2["idType"],
                                                        }))
                                                    }
                                                    className="text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">ID Number</label>
                                    <input
                                        type="text"
                                        value={step2.idNumber}
                                        onChange={(e) => setStep2((s) => ({ ...s, idNumber: e.target.value }))}
                                        placeholder="Enter your ID number"
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-3 block text-sm font-semibold">Front of ID</label>
                                        <input
                                            ref={idFrontInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleIdFrontChange}
                                        />
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => idFrontInputRef.current?.click()}
                                            className="group relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        >
                                            {idFrontPreview ? (
                                                <img
                                                    src={idFrontPreview}
                                                    alt=""
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <>
                                                    <ImagePlus className="mb-2 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                                    <span className="text-sm font-medium text-neutral-500">
                                                        Choose front image
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Uploads on final submit · tối đa 5MB · JPG/PNG/WebP
                                        </p>
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-sm font-semibold">Back of ID</label>
                                        <input
                                            ref={idBackInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            onChange={handleIdBackChange}
                                        />
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => idBackInputRef.current?.click()}
                                            className="group relative flex h-36 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-primary disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800/50"
                                        >
                                            {idBackPreview ? (
                                                <img
                                                    src={idBackPreview}
                                                    alt=""
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <>
                                                    <ImagePlus className="mb-2 h-8 w-8 text-neutral-400 group-hover:text-primary" />
                                                    <span className="text-sm font-medium text-neutral-500">
                                                        Choose back image
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Uploads on final submit · tối đa 5MB · JPG/PNG/WebP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-info/20 bg-info/10 p-4 text-sm text-info dark:border-info/20 dark:bg-info/10 dark:text-info">
                                    Your bank details are encrypted and stored securely. They are only used for payouts.
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Bank Name</label>
                                    <input
                                        type="text"
                                        value={step3.bankName}
                                        onChange={(e) => setStep3((s) => ({ ...s, bankName: e.target.value }))}
                                        placeholder="e.g. Vietcombank, Techcombank"
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Account Number</label>
                                    <input
                                        type="text"
                                        value={step3.accountNumber}
                                        onChange={(e) => setStep3((s) => ({ ...s, accountNumber: e.target.value }))}
                                        placeholder="Enter your bank account number"
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={step3.accountHolderName}
                                        onChange={(e) => setStep3((s) => ({ ...s, accountHolderName: e.target.value }))}
                                        placeholder="Full name as on bank account"
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 p-6 dark:border-neutral-800">
                        {step > 1 ? (
                            <Button
                                variant="outline"
                                onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        ) : (
                            <Link to="/feed">
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4" /> Back to Home
                                </Button>
                            </Link>
                        )}
                        {step < 3 ? (
                            <Button onClick={goNext}>Continue</Button>
                        ) : (
                            <Button
                                onClick={() => void handleSubmit()}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Uploading & submitting..." : "Submit Application"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
