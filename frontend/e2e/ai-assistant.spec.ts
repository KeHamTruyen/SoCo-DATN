import { expect, test } from "@playwright/test";
import { mockAuthenticatedApi } from "./helpers/apiMocks";

test("AI assistant dock sends a question, renders RAG-grounded answer, and handles quick action", async ({ page }) => {
    await mockAuthenticatedApi(page);

    await page.goto("/feed");

    await page.getByRole("button", { name: /dock|mở rộng|expand/i }).click();
    await page.getByTitle("AI Shopping Assistant").click();

    await expect(page.getByText("AI Shopping Assistant")).toBeVisible();

    await page
        .getByPlaceholder(/hoi gia|hỏi giá|so sanh|so sánh/i)
        .fill("Gợi ý iPhone tầm 25 triệu");
    await page.getByRole("button", { name: /gui|gửi/i }).click();

    await expect(page.getByText(/Dựa trên dữ liệu RAG|RAG/i)).toBeVisible();
    await expect(page.getByText("iPhone 15 Pro", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Thêm vào giỏ", exact: true }).click();
    await expect(page.getByText(/Da them san pham|Đã thêm sản phẩm/i)).toBeVisible();
});
