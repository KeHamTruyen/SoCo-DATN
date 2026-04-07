const VND_FORMATTER = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
});

export function formatCurrencyVnd(value: number): string {
    return VND_FORMATTER.format(Number.isFinite(value) ? value : 0);
}

