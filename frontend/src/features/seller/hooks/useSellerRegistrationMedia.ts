import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react";

type PreviewKey = "logo" | "cover" | "idFront" | "idBack";

export function useSellerRegistrationMedia() {
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

    const bindLocalImage = useCallback((
        key: PreviewKey,
        file: File | null,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    ) => {
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
    }, []);

    return {
        shopLogoFile, setShopLogoFile,
        shopCoverFile, setShopCoverFile,
        idFrontFile, setIdFrontFile,
        idBackFile, setIdBackFile,
        shopLogoPreview, setShopLogoPreview,
        shopCoverPreview, setShopCoverPreview,
        idFrontPreview, setIdFrontPreview,
        idBackPreview, setIdBackPreview,
        bindLocalImage
    };
}
