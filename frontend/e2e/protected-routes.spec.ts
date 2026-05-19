import { expect, test } from "@playwright/test";

const PROTECTED_PATHS = ["/cart", "/checkout", "/orders", "/messages", "/notifications"]; 

test.describe("protected route redirects", () => {
    for (const path of PROTECTED_PATHS) {
        test(`guest visiting ${path} is redirected to login`, async ({ page }) => {
            await page.goto(path);
            await expect(page).toHaveURL(/\/login/);
            await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
        });
    }
});
