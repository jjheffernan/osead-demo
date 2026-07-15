import { expect, test } from "@playwright/test";

test.describe("availability inquiry", () => {
  test("validates mocked unavailable dates before continuing", async ({
    page,
  }) => {
    await page.goto("/properties/saltline-cottage-nags-head", {
      waitUntil: "domcontentloaded",
    });

    const inquiry = page.locator(".availability");
    await inquiry.getByLabel("Check-in").fill("2026-08-15");
    await inquiry.getByLabel("Check-out").fill("2026-08-22");
    await inquiry
      .getByRole("button", { name: "Continue with availability inquiry" })
      .click();
    await expect(inquiry.getByRole("alert")).toContainText(
      "mocked unavailable date",
    );

    await inquiry.getByLabel("Check-in").fill("2026-09-01");
    await inquiry.getByLabel("Check-out").fill("2026-09-08");
    await inquiry
      .getByRole("button", { name: "Continue with availability inquiry" })
      .click();
    await expect(page).toHaveURL(
      /contact\?inquiry=availability&property=saltline-cottage-nags-head&checkIn=2026-09-01&checkOut=2026-09-08/,
    );
  });

  test("does not appear on sale-only property pages", async ({ page }) => {
    await page.goto("/properties/harbor-watch-dewey", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator(".availability")).toHaveCount(0);
  });
});
