import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test("notifications page loads and shows empty state", async ({ page }) => {
    await mockBuyerApi(page, { seedNotifications: false });

    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /notifications/i })).toBeVisible();
    await expect(page.getByText(/no notifications\./i)).toBeVisible();
});
