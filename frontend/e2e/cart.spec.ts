import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test("cart empty state renders", async ({ page }) => {
    await mockBuyerApi(page, { cart: "empty" });

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /your cart is empty/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /continue shopping/i })).toBeVisible();
});

test("cart -> checkout -> success", async ({ page }) => {
    await mockBuyerApi(page, { cart: "with-item", seedOrders: true });

    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: /shopping cart/i })).toBeVisible();

    await page.getByRole("button", { name: /proceed to checkout/i }).click();

    await expect(page.getByRole("heading", { name: /^checkout$/i })).toBeVisible();

    await page.getByPlaceholder("John Doe").fill("Buyer Test");
    await page.getByPlaceholder(/\+84/i).fill("+84000000000");
    await page.getByPlaceholder(/street address/i).fill("1 Test Street");

    await page.getByRole("button", { name: /place order/i }).click();

    await expect(page).toHaveURL(/\/checkout\/success\?orderId=/);
    await expect(page.getByRole("heading", { name: /order placed/i })).toBeVisible();
});
