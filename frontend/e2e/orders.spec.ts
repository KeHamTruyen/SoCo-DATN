import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test("orders list loads and order detail opens", async ({ page }) => {
    await mockBuyerApi(page, { cart: "empty", seedOrders: true });

    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: /my orders/i })).toBeVisible();

    await expect(page.getByText("#1001")).toBeVisible();
    await page.getByRole("link", { name: /#1001/i }).click();

    await expect(page).toHaveURL(/\/orders\//);
    await expect(page.getByRole("heading", { name: /order #1001/i })).toBeVisible();
});
