import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test("login without 2FA takes user to feed", async ({ page }) => {
    await mockBuyerApi(page);

    // `mockBuyerApi` pre-seeds auth tokens for authenticated flows.
    // Clear them for the login test so the app doesn't redirect away from /login.
    await page.addInitScript(() => {
        window.localStorage.removeItem("soco.accessToken");
        window.localStorage.removeItem("soco.refreshToken");
    });

    await page.goto("/login");
    await page.getByLabel(/email or username/i).fill("buyer@soco.test");
    await page.locator('input[name="password"]').fill("Password123");
    await page.getByRole("button", { name: /^login$/i }).click();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByRole("link", { name: /marketplace/i })).toBeVisible();
});
