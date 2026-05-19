import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test("groups page lists groups", async ({ page }) => {
    await mockBuyerApi(page);

    page.on("pageerror", (err) => {
        // Surface runtime crashes as test output if they happen.
        // eslint-disable-next-line no-console
        console.error("PAGEERROR:", err);
    });
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            // eslint-disable-next-line no-console
            console.error("CONSOLE:", msg.text());
        }
    });

    await page.goto("/groups");
    await expect(page.getByRole("heading", { name: /something went wrong/i })).toHaveCount(0);
    await expect(page.getByText("SoCo Community")).toBeVisible();
});
