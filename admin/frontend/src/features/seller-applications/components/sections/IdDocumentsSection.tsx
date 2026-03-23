import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";

export function IdDocumentsSection({
    detail,
}: {
    detail: SellerApplicationAdmin;
}) {
    if (!detail.idCardFrontSignedUrl && !detail.idCardBackSignedUrl) {
        return null;
    }

    return (
        <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                ID documents
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                {detail.idCardFrontSignedUrl ? (
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">
                            Front
                        </p>
                        <a
                            href={detail.idCardFrontSignedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                        >
                            <img
                                src={detail.idCardFrontSignedUrl}
                                alt="ID front"
                                className="max-h-48 w-full rounded-lg border border-border object-contain"
                            />
                        </a>
                    </div>
                ) : null}
                {detail.idCardBackSignedUrl ? (
                    <div>
                        <p className="mb-1 text-xs text-muted-foreground">
                            Back
                        </p>
                        <a
                            href={detail.idCardBackSignedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                        >
                            <img
                                src={detail.idCardBackSignedUrl}
                                alt="ID back"
                                className="max-h-48 w-full rounded-lg border border-border object-contain"
                            />
                        </a>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
