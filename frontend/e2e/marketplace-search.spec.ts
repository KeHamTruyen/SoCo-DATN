import { expect, test } from "@playwright/test";
import { mockGuestApi } from "./helpers/apiMocks";

test("marketplace search sends the query and renders matching products", async ({ page }) => {
    await mockGuestApi(page);

    await page.goto("/marketplace");
    await expect(page.getByText("iPhone 15 Pro")).toBeVisible();

    const searchInput = page
        .getByPlaceholder(/search products|tìm sản phẩm/i)
        .first();
    await searchInput.fill("iphone");

    await expect(page).toHaveURL(/q=iphone/);
    await expect(page.getByText("iPhone 15 Pro")).toBeVisible();
    await expect(page.getByText("Ốp lưng trong suốt")).toHaveCount(0);
});
