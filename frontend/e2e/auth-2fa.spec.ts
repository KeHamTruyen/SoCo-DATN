import { expect, test } from "@playwright/test";
import { mockGuestApi } from "./helpers/apiMocks";

test("login with a 2FA-enabled account opens the OTP verification screen", async ({ page }) => {
    await mockGuestApi(page);

    await page.goto("/login");
    await page.getByLabel(/email or username/i).fill("buyer@soco.test");
    await page.locator('input[name="password"]').fill("Password123");
    await page.getByRole("button", { name: /^login$/i }).click();

    await expect(page).toHaveURL(/\/verify$/);
    await expect(page.getByRole("heading", { name: /two-factor authentication/i })).toBeVisible();
    await expect(page.getByText(/otp has been sent/i)).toBeVisible();
});
