import { expect, test, type APIRequestContext, type Locator, type Page } from "@playwright/test";

import type { Company, CompanySummary, Person, PersonSummary } from "../server/types";

async function getApi<T>(request: APIRequestContext, path: string): Promise<T> {
  const response = await request.get(path);
  expect(response.ok(), `${path} should return a fixture`).toBeTruthy();
  return response.json() as Promise<T>;
}

async function expectCanonicalLink(scope: Locator, name: string, href: string): Promise<void> {
  await expect(scope.getByRole("link", { name, exact: true }).first()).toHaveAttribute(
    "href",
    href,
  );
}

async function expectSidebarActive(page: Page, activeLabel: "Companies" | "People"): Promise<void> {
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const active = nav.getByRole("link", { name: activeLabel, exact: true });
  const inactive = nav.getByRole("link", {
    name: activeLabel === "Companies" ? "People" : "Companies",
    exact: true,
  });

  await page.mouse.move(1435, 995);
  const [activeBackground, inactiveBackground] = await Promise.all([
    active.evaluate((link) => getComputedStyle(link.parentElement!).backgroundColor),
    inactive.evaluate((link) => getComputedStyle(link.parentElement!).backgroundColor),
  ]);
  expect(activeBackground, `${activeLabel} should have the active background`).not.toBe(
    inactiveBackground,
  );
}

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

test("company and people directories use canonical record links", async ({ page, request }) => {
  const [companies, people] = await Promise.all([
    getApi<CompanySummary[]>(request, "/api/companies"),
    getApi<PersonSummary[]>(request, "/api/people"),
  ]);

  await page.goto("/companies");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Companies" })).toBeVisible();
  for (const company of companies) {
    await expectCanonicalLink(main, company.name, `/companies/${company.id}`);
  }
  await expectSidebarActive(page, "Companies");

  const halden = companies.find((company) => company.id === "co_halden")!;
  await main.getByRole("link", { name: halden.name, exact: true }).click();
  await expect(page).toHaveURL(`/companies/${halden.id}`);
  await page.goBack();
  await expect(main.getByRole("heading", { name: "Companies" })).toBeVisible();

  await page.goto("/people");
  await expect(main.getByRole("heading", { name: "People" })).toBeVisible();
  for (const person of people) {
    await expectCanonicalLink(main, person.name, `/people/${person.id}`);
    const personCard = main.getByRole("link", { name: person.name, exact: true }).locator("..");
    if (person.company) {
      await expectCanonicalLink(personCard, person.company.name, `/companies/${person.company.id}`);
    } else {
      await expect(personCard.getByText("No company linked", { exact: true })).toBeVisible();
    }
  }
  await expectCanonicalLink(main, "Looking for colleagues? Go to Team", "/team");
  await expectSidebarActive(page, "People");

  const anke = people.find((person) => person.id === "per_anke")!;
  await main.getByRole("link", { name: anke.name, exact: true }).click();
  await expect(page).toHaveURL(`/people/${anke.id}`);
  await main.getByRole("link", { name: "Back to People", exact: true }).click();
  await expect(page).toHaveURL("/people");
});

test("Halden company hub exposes scoped relationships and distinct knowledge", async ({
  page,
  request,
}) => {
  const company = await getApi<Company>(request, "/api/companies/co_halden");

  await page.goto(`/companies/${company.id}`);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: company.name, exact: true })).toBeVisible();
  await expectCanonicalLink(main, "Back to Companies", "/companies");
  for (const section of [
    "Overview",
    "People",
    "Meetings",
    "Agent Sessions",
    "Knowledge",
    "Analysis",
    "Sharing",
  ]) {
    await expect(main.getByRole("region", { name: section, exact: true })).toBeVisible();
  }

  const peopleRegion = main.getByRole("region", { name: "People", exact: true });
  for (const person of company.people) {
    await expectCanonicalLink(peopleRegion, person.name, `/people/${person.id}`);
  }

  const meetingsRegion = main.getByRole("region", { name: "Meetings", exact: true });
  for (const meeting of company.meetings) {
    await expectCanonicalLink(meetingsRegion, meeting.title, `/meetings/${meeting.id}`);
  }

  const sessionsRegion = main.getByRole("region", {
    name: "Agent Sessions",
    exact: true,
  });
  for (const session of company.agentSessions) {
    const link = sessionsRegion.getByRole("link", {
      name: session.title,
      exact: true,
    });
    await expect(link).toHaveAttribute("href", `/agent-sessions/${session.id}`);
    await expect(
      link.locator("..").getByText(session.channel === "call" ? "Call" : "Chat", {
        exact: true,
      }),
    ).toBeVisible();
  }

  const phoneCall = company.agentSessions.find((session) => session.channel === "call")!;
  const chat = company.agentSessions.find((session) => session.channel === "chat")!;
  const phoneCallCard = sessionsRegion
    .getByRole("link", { name: phoneCall.title, exact: true })
    .locator("../..");
  await expect(phoneCallCard).toContainText("Phone Assistant");
  await expectCanonicalLink(
    phoneCallCard,
    phoneCall.meeting!.title,
    `/meetings/${phoneCall.meeting!.id}`,
  );
  await expect(
    sessionsRegion.getByRole("link", { name: chat.title, exact: true }).locator("../.."),
  ).toContainText("No related meeting — this session stands on its own.");

  const knowledgeRegion = main.getByRole("region", { name: "Knowledge", exact: true });
  for (const item of company.knowledge) {
    const itemContent = knowledgeRegion
      .getByRole("heading", { name: item.title, exact: true })
      .locator("..");
    await expect(itemContent).toContainText(
      item.kind === "revenue_context" ? "Revenue context · Illustrative only" : "Internal note",
    );
  }

  await page.reload();
  await expect(main.getByRole("heading", { name: company.name, exact: true })).toBeVisible();
  await expectSidebarActive(page, "Companies");

  await sessionsRegion.getByRole("link", { name: phoneCall.title, exact: true }).click();
  await expect(page).toHaveURL(`/agent-sessions/${phoneCall.id}`);
  await expect(main.getByRole("heading", { name: phoneCall.title, exact: true })).toBeVisible();
  await page.goBack();
  await expect(main.getByRole("heading", { name: company.name, exact: true })).toBeVisible();
});

test("Anke hub contains only Anke history and person knowledge", async ({ page, request }) => {
  const person = await getApi<Person>(request, "/api/people/per_anke");

  await page.goto(`/people/${person.id}`);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: person.name, exact: true })).toBeVisible();
  await expectCanonicalLink(main, "Back to People", "/people");
  await expectCanonicalLink(main, person.company!.name, `/companies/${person.company!.id}`);

  const meetings = main.getByRole("region", { name: "Meetings", exact: true });
  for (const meeting of person.meetings) {
    await expectCanonicalLink(meetings, meeting.title, `/meetings/${meeting.id}`);
  }
  await expect(
    meetings.getByRole("link", { name: "Halden Logistics — Depot follow-up" }),
  ).toHaveCount(0);

  const sessions = main.getByRole("region", { name: "Agent Sessions", exact: true });
  for (const session of person.agentSessions) {
    await expectCanonicalLink(sessions, session.title, `/agent-sessions/${session.id}`);
  }
  await expect(sessions.getByRole("link", { name: "Document Ruben's depot call" })).toHaveCount(0);

  const knowledge = main.getByRole("region", { name: "Knowledge", exact: true });
  for (const item of person.knowledge) {
    await expect(knowledge.getByRole("heading", { name: item.title })).toBeVisible();
  }
  await expect(knowledge.getByText("Illustrative revenue context")).toHaveCount(0);
  await expectSidebarActive(page, "People");
});

test("Ruben and company-less Avery retain their own relationship history", async ({
  page,
  request,
}) => {
  const [ruben, avery] = await Promise.all([
    getApi<Person>(request, "/api/people/per_ruben"),
    getApi<Person>(request, "/api/people/per_avery"),
  ]);
  const depot = ruben.meetings.find((meeting) => meeting.id === "mtg_halden_depot")!;

  await page.goto(`/people/${ruben.id}`);
  let main = page.getByRole("main");
  await expectCanonicalLink(
    main.getByRole("region", { name: "Meetings", exact: true }),
    depot.title,
    `/meetings/${depot.id}`,
  );

  await page.goto(`/people/${avery.id}`);
  main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: avery.name, exact: true })).toBeVisible();
  await expect(
    main.getByText("No company linked. This contact has an independent history."),
  ).toBeVisible();
  for (const meeting of avery.meetings) {
    await expectCanonicalLink(
      main.getByRole("region", { name: "Meetings", exact: true }),
      meeting.title,
      `/meetings/${meeting.id}`,
    );
  }
  for (const item of avery.knowledge) {
    await expect(main.getByRole("heading", { name: item.title, exact: true })).toBeVisible();
  }
});

test("existing people render empty session and knowledge states", async ({ page, request }) => {
  const ali = await getApi<Person>(request, "/api/people/per_ali");
  expect(ali.agentSessions).toEqual([]);
  expect(ali.knowledge).toEqual([]);

  await page.goto(`/people/${ali.id}`);
  const main = page.getByRole("main");
  await expect(
    main
      .getByRole("region", { name: "Agent Sessions", exact: true })
      .getByText("No agent sessions linked", { exact: true }),
  ).toBeVisible();
  await expect(
    main
      .getByRole("region", { name: "Knowledge", exact: true })
      .getByText("No knowledge added", { exact: true }),
  ).toBeVisible();
});

test("directories and company collections have intercepted empty states", async ({
  page,
  request,
}) => {
  const company = await getApi<Company>(request, "/api/companies/co_halden");

  await page.route("**/api/companies", async (route) => {
    if (new URL(route.request().url()).pathname === "/api/companies") {
      await route.fulfill({ json: [] });
    } else {
      await route.continue();
    }
  });
  await page.goto("/companies");
  await expect(page.getByRole("main").getByText("No companies", { exact: true })).toBeVisible();
  await page.unroute("**/api/companies");

  await page.route("**/api/people", (route) => route.fulfill({ json: [] }));
  await page.goto("/people");
  await expect(page.getByRole("main").getByText("No people linked", { exact: true })).toBeVisible();
  await page.unroute("**/api/people");

  await page.route(`**/api/companies/${company.id}`, (route) =>
    route.fulfill({
      json: {
        ...company,
        people: [],
        meetings: [],
        agentSessions: [],
        knowledge: [],
      },
    }),
  );
  await page.goto(`/companies/${company.id}`);
  const main = page.getByRole("main");
  for (const [region, emptyTitle] of [
    ["People", "No people linked"],
    ["Meetings", "No meetings linked"],
    ["Agent Sessions", "No agent sessions linked"],
    ["Knowledge", "No knowledge added"],
  ] as const) {
    await expect(
      main
        .getByRole("region", { name: region, exact: true })
        .getByText(emptyTitle, { exact: true }),
    ).toBeVisible();
  }
});

test("analysis and sharing stay scoped placeholders and reset main scroll", async ({ page }) => {
  await page.goto("/companies/co_halden");
  const main = page.getByRole("main");
  const analysis = main.getByRole("region", { name: "Analysis", exact: true });
  await expect(
    analysis.getByRole("button", { name: "Analyze this company · Not available" }),
  ).toBeDisabled();
  await expect(analysis).toContainText("Company-scoped analysis for Halden Logistics");

  const sharing = main.getByRole("region", { name: "Sharing", exact: true });
  await expect(sharing).toContainText("No access is granted, changed, or enforced here.");
  const policyLink = sharing.getByRole("link", {
    name: "Organization sharing policies · Future",
  });
  await expect(policyLink).toHaveAttribute("href", "/settings/sharing");

  await main.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  expect(await main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await policyLink.click();
  await expect(page).toHaveURL("/settings/sharing");
  await expect(main.getByRole("heading", { name: "Sharing", exact: true })).toBeVisible();
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeLessThan(5);
  await expect(main).toContainText("there are no policy controls in this prototype");

  await page.goto("/people/per_anke");
  const personAnalysis = main.getByRole("region", { name: "Analysis", exact: true });
  await expect(
    personAnalysis.getByRole("button", { name: "Analyze this person · Not available" }),
  ).toBeDisabled();
  await expect(personAnalysis).toContainText("Person-scoped analysis for Anke Sørensen");
  const personSharing = main.getByRole("region", { name: "Sharing", exact: true });
  await expect(personSharing).toContainText("No access is granted, changed, or enforced here.");
  await expectCanonicalLink(
    personSharing,
    "Organization sharing policies · Future",
    "/settings/sharing",
  );
});

test("Company → Person → Company and canonical meeting navigation work end to end", async ({
  page,
}) => {
  const main = page.getByRole("main");
  await page.goto("/companies/co_halden");
  await main
    .getByRole("region", { name: "People", exact: true })
    .getByRole("link", { name: "Ruben Holt", exact: true })
    .click();
  await expect(page).toHaveURL("/people/per_ruben");
  await expect(main.getByRole("heading", { name: "Ruben Holt", level: 1 })).toBeVisible();
  await expectSidebarActive(page, "People");
  await main
    .getByRole("region", { name: "Meetings", exact: true })
    .getByRole("link", { name: "Halden Logistics — Depot follow-up", exact: true })
    .click();
  await expect(page).toHaveURL("/meetings/mtg_halden_depot");
  await expect(
    main.getByRole("heading", { name: "Halden Logistics — Depot follow-up", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(main.getByRole("heading", { name: "Ruben Holt", level: 1 })).toBeVisible();
  await main
    .getByRole("region", { name: "Overview", exact: true })
    .getByRole("link", { name: "Halden Logistics", exact: true })
    .click();
  await expect(page).toHaveURL("/companies/co_halden");
  await expect(main.getByRole("heading", { name: "Halden Logistics", level: 1 })).toBeVisible();
  await expectSidebarActive(page, "Companies");
  await main.getByRole("link", { name: "Back to Companies", exact: true }).click();
  await expect(page).toHaveURL("/companies");
});

test("missing company and person detail URLs render 404s", async ({ page }) => {
  const main = page.getByRole("main");

  await page.goto("/companies/missing-company");
  await expect(main.getByRole("heading", { name: "Not found", exact: true })).toBeVisible();
  await expect(page).toHaveURL("/companies/missing-company");
  await expectSidebarActive(page, "Companies");

  await page.goto("/people/missing-person");
  await expect(main.getByRole("heading", { name: "Not found", exact: true })).toBeVisible();
  await expect(page).toHaveURL("/people/missing-person");
  await expectSidebarActive(page, "People");
});
