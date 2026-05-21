import { expect, test } from "@playwright/test";
import { mockGuestApi } from "./helpers/apiMocks";

test("login without 2FA takes user to feed", async ({ page }) => {
    await mockGuestApi(page, { directLogin: true });

    await page.goto("/login");
    await page.getByLabel(/email or username/i).fill("buyer@soco.test");
    await page.locator('input[name="password"]').fill("Password123");
    await page.getByRole("button", { name: /^login$/i }).click();

    await expect(page).toHaveURL(/\/feed$/);
    await expect(page.getByRole("link", { name: /marketplace/i })).toBeVisible();
});
