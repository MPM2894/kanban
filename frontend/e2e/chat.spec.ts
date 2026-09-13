import { expect, test } from "@playwright/test";

test("chat can move a card without a manual reload", async ({ page }) => {
  await page.goto("/");

  await page
    .getByLabel("Chat message")
    .fill("Move the card titled 'Check keyboard flows' from Review to Done.");
  await page.getByRole("button", { name: /send/i }).click();

  await expect(
    page.getByTestId("column-col-done").getByTestId("card-card-a11y"),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByTestId("column-col-review").getByTestId("card-card-a11y"),
  ).toHaveCount(0);
});
