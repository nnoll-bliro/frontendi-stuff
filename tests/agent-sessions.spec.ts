import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

import type { AgentSession, AgentSessionSummary } from "../server/types";

/**
 * Ticket 6: an agent session is the user's own conversation with the assistant. These
 * tests assert that Call/Chat stays readable, that a session's content never passes for
 * a customer transcript, that meeting linkage is optional in both directions, and that
 * the seeded story walks Company → Person → Meeting → Agent Session → Company.
 */

async function getApi<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path);
  expect(response.ok(), `${path} should return a fixture`).toBeTruthy();
  return response.json() as Promise<T>;
}

const region = (page: Page, name: string): Locator =>
  page.getByRole("main").getByRole("region", { name, exact: true });

/** The card a session link sits in, so a row's own context can be asserted. */
const sessionCard = (scope: Locator, title: string): Locator =>
  scope.getByRole("link", { name: title, exact: true }).locator("../..");

let pageErrors: Error[] = [];
test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));
});

test.afterEach(async () => {
  expect(
    pageErrors.map((error) => error.message),
    "the page should not emit uncaught errors",
  ).toEqual([]);
});

test("the session directory labels Call/Chat and links its context", async ({ page, request }) => {
  const sessions = await getApi<AgentSessionSummary[]>(request, "/api/agent-sessions");
  await page.goto("/agent-sessions");
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "Agent Sessions", level: 1 })).toBeVisible();
  await expect(main).toContainText("never itself a customer touchpoint");

  for (const session of sessions) {
    const card = sessionCard(main, session.title);
    await expect(main.getByRole("link", { name: session.title, exact: true })).toHaveAttribute(
      "href",
      `/agent-sessions/${session.id}`,
    );
    await expect(card).toContainText(session.channel === "call" ? "Call" : "Chat");
    if (session.company) {
      await expect(
        card.getByRole("link", { name: session.company.name, exact: true }),
      ).toHaveAttribute("href", `/companies/${session.company.id}`);
    }
    for (const person of session.people) {
      await expect(card.getByRole("link", { name: person.name, exact: true })).toHaveAttribute(
        "href",
        `/people/${person.id}`,
      );
    }
    if (session.meeting) {
      await expect(
        card.getByRole("link", { name: session.meeting.title, exact: true }),
      ).toHaveAttribute("href", `/meetings/${session.meeting.id}`);
    } else {
      await expect(card).toContainText("No related meeting — this session stands on its own.");
    }
  }

  // The Call/Chat split is stated up front, and the list returns from a detail page.
  const calls = sessions.filter((session) => session.channel === "call").length;
  await expect(main).toContainText(`${calls} ${calls === 1 ? "call" : "calls"}`);
  await main.getByRole("link", { name: "Document Ruben's depot call", exact: true }).click();
  await expect(page).toHaveURL("/agent-sessions/as_halden_debrief");
  await main.getByRole("link", { name: "Back to Agent Sessions", exact: true }).click();
  await expect(page).toHaveURL("/agent-sessions");
});

test("an assistant call reads as its own conversation, not a customer recording", async ({
  page,
  request,
}) => {
  const session = await getApi<AgentSession>(request, "/api/agent-sessions/as_halden_debrief");
  await page.goto("/agent-sessions/as_halden_debrief");
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: session.title, level: 1 })).toBeVisible();
  await expect(main).toContainText("Call");
  await expect(region(page, "Overview")).toContainText("not a recording of a customer");

  const conversation = region(page, "Conversation");
  await expect(conversation).toContainText("never a customer meeting transcript");
  await expect(conversation).toContainText("You");
  await expect(conversation).toContainText("Assistant");
  for (const message of session.messages) {
    await expect(conversation).toContainText(message.text);
  }
});

test("documentation produced points back at the meeting that owns it", async ({ page }) => {
  await page.goto("/agent-sessions/as_halden_debrief");
  const documentation = region(page, "Documentation produced");

  await expect(documentation).toContainText("Source: Phone Assistant");
  await expect(documentation).toContainText("belongs to the touchpoint it describes");
  await expect(
    documentation.getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true }),
  ).toHaveAttribute("href", "/meetings/mtg_halden_depot");

  // The account-level chat documented nothing, stated plainly.
  await page.goto("/agent-sessions/as_halden_plan");
  await expect(region(page, "Documentation produced")).toContainText(
    "This conversation did not document a touchpoint.",
  );
});

test("meeting linkage is optional and reciprocal", async ({ page }) => {
  // Linked: the session names the touchpoint and keeps the transcript separate.
  await page.goto("/agent-sessions/as_halden_debrief");
  const meeting = region(page, "Related meeting");
  await expect(meeting).toContainText("separate artifact from the conversation above");
  await meeting.getByRole("link", { name: "Halden Logistics — Depot follow-up" }).click();
  await expect(page).toHaveURL("/meetings/mtg_halden_depot");

  // And the touchpoint lists the same session back, without claiming it as a transcript.
  const sessions = region(page, "Agent Sessions");
  await expect(sessions).toContainText("not a recording of this meeting");
  await sessions.getByRole("link", { name: "Document Ruben's depot call", exact: true }).click();
  await expect(page).toHaveURL("/agent-sessions/as_halden_debrief");

  // Unlinked: a standalone account chat is a valid, complete session.
  await page.goto("/agent-sessions/as_halden_plan");
  await expect(region(page, "Related meeting")).toContainText(
    "No related meeting — this session stands on its own",
  );
  await expect(region(page, "Conversation")).toContainText("Sample account context");
  await expect(
    region(page, "Company and people").getByRole("link", { name: "Halden Logistics", exact: true }),
  ).toHaveAttribute("href", "/companies/co_halden");
});

test("an unknown session id is a 404, and the directory stays reachable", async ({ page }) => {
  await page.goto("/agent-sessions/does-not-exist");
  const main = page.getByRole("main");
  await expect(main).toContainText("Not found");

  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", {
      name: "Agent Sessions",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL("/agent-sessions");
});

test("the seeded story walks Company → Person → Meeting → Agent Session → Company", async ({
  page,
}) => {
  const main = page.getByRole("main");
  await page.goto("/companies/co_halden");

  await region(page, "People").getByRole("link", { name: "Ruben Holt", exact: true }).click();
  await expect(page).toHaveURL("/people/per_ruben");

  await region(page, "Meetings")
    .getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true })
    .click();
  await expect(page).toHaveURL("/meetings/mtg_halden_depot");

  await region(page, "Agent Sessions")
    .getByRole("link", { name: "Document Ruben's depot call", exact: true })
    .click();
  await expect(page).toHaveURL("/agent-sessions/as_halden_debrief");

  await region(page, "Company and people")
    .getByRole("link", { name: "Halden Logistics", exact: true })
    .click();
  await expect(page).toHaveURL("/companies/co_halden");
  await expect(main.getByRole("heading", { name: "Halden Logistics", level: 1 })).toBeVisible();

  // Every step is real navigation, so the whole walk unwinds.
  await page.goBack();
  await expect(
    main.getByRole("heading", { name: "Document Ruben's depot call", level: 1 }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    main.getByRole("heading", { name: "Halden Logistics — Depot follow-up", level: 1 }),
  ).toBeVisible();
  await page.goBack();
  await expect(main.getByRole("heading", { name: "Ruben Holt", level: 1 })).toBeVisible();
});
