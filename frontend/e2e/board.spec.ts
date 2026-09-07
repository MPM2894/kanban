import { expect, test } from "@playwright/test";

test("loads dummy columns and cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /kanban/i })).toBeVisible();
  await expect(page.getByTestId("column-title-col-backlog")).toHaveText("📥 Backlog");
  await expect(page.getByTestId("column-title-col-done")).toHaveText("✅ Done");
  await expect(page.getByText("Ship drag and drop")).toBeVisible();
});

test("renames a column", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("column-title-col-todo").click();
  const input = page.getByTestId("column-title-input-col-todo");
  await input.fill("Ready");
  await input.press("Enter");
  await expect(page.getByTestId("column-title-col-todo")).toHaveText("Ready");
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("add-card-col-review").click();
  await page.getByTestId("add-card-title-col-review").fill("Sign off");
  await page.getByTestId("add-card-details-col-review").fill("Final pass before done.");
  await page.getByTestId("add-card-submit-col-review").click();
  await expect(page.getByText("Sign off")).toBeVisible();
  await expect(page.getByText("Final pass before done.")).toBeVisible();

  await page.getByTestId("delete-card-card-a11y").click();
  await expect(page.getByText("Check keyboard flows")).toHaveCount(0);
});

test("drags a card to another column", async ({ page }) => {
  await page.goto("/");
  const card = page.getByTestId("card-card-dnd");
  const target = page.getByTestId("card-card-palette");
  await expect(card).toBeVisible();
  await expect(target).toBeVisible();

  const from = await card.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) {
    throw new Error("Missing drag coordinates");
  }

  await page.mouse.move(from.x + from.width / 2, from.y + 8);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, {
    steps: 40,
  });
  await page.mouse.up();

  await expect(
    page.getByTestId("column-col-done").getByTestId("card-card-dnd"),
  ).toBeVisible();
  await expect(
    page.getByTestId("column-col-progress").getByTestId("card-card-dnd"),
  ).toHaveCount(0);
});
