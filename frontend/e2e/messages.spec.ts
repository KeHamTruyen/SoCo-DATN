import { expect, test } from "@playwright/test";
import { mockBuyerApi } from "./helpers/apiMocks";

test.use({ viewport: { width: 1920, height: 1080 } });

test("messages page loads and can send a message", async ({ page }) => {
    await mockBuyerApi(page, { seedConversations: true });

    await page.goto("/messages");

    // The floating chat dock can overlap the messenger send button.
    const collapseDock = page.getByRole("button", { name: /collapse chat dock|thu gọn khung chat/i });
    if (await collapseDock.isVisible().catch(() => false)) {
        await collapseDock.click();
    }

    const conversationButton = page.getByRole("button", { name: /seller one/i }).first();
    await expect(conversationButton).toBeVisible();

    const composer = page.getByPlaceholder(/type a message|nhập|tin nhắn/i);
    await composer.fill("Hi seller!");
    await page.getByRole("button", { name: /send|gửi/i }).click();

    await expect(page.getByText("Hi seller!", { exact: true })).toBeVisible();
});
