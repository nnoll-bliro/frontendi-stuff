import type { DatabaseSync } from "node:sqlite";

/**
 * Mock data for one fictional Bliro customer. Everything is dated relative to the
 * moment of seeding, so the calendar always has a believable "today" no matter
 * when the playground was last reset.
 */

const NOW = new Date();

/**
 * ISO timestamp for `days` from today at `hour:minute` local time, nudged off
 * weekends — which day of the week "today" is depends on when the playground was
 * last reset, and a Saturday pipeline review reads as fake immediately. Past
 * dates move back to the Friday, future dates forward to the Monday.
 */
function at(days: number, hour: number, minute = 0): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);

  const day = d.getDay();
  if (day === 0 || day === 6) {
    const backwards = days < 0;
    // Saturday is 1 day from Friday and 2 from Monday; Sunday is the mirror.
    const shift = day === 6 ? (backwards ? -1 : 2) : backwards ? -2 : 1;
    d.setDate(d.getDate() + shift);
  }
  return d.toISOString();
}

/** ISO timestamp `minutes` from right now — for the in-progress meeting. */
function fromNow(minutes: number): string {
  return new Date(NOW.getTime() + minutes * 60_000).toISOString();
}

const ORG = {
  id: "org_vektor",
  name: "Vektor Mobility",
  domain: "vektor-mobility.de",
  plan: "pro",
  created_at: at(-420, 9),
};

const USERS = [
  {
    id: "usr_niko",
    name: "Niko Noll",
    email: "niko@vektor-mobility.de",
    job_title: "Head of Sales",
    role: "owner",
    provider: "google",
    created_at: at(-420, 9),
  },
  {
    id: "usr_lena",
    name: "Lena Brandt",
    email: "lena@vektor-mobility.de",
    job_title: "Account Executive",
    role: "admin",
    provider: "google",
    created_at: at(-310, 10),
  },
  {
    id: "usr_tobias",
    name: "Tobias Weiß",
    email: "tobias@vektor-mobility.de",
    job_title: "Account Executive",
    role: "member",
    provider: "microsoft",
    created_at: at(-260, 11),
  },
  {
    id: "usr_priya",
    name: "Priya Raman",
    email: "priya@vektor-mobility.de",
    job_title: "Customer Success Manager",
    role: "member",
    provider: "google",
    created_at: at(-180, 9),
  },
  {
    id: "usr_marc",
    name: "Marc Dubois",
    email: "marc@vektor-mobility.de",
    job_title: "Solutions Engineer",
    role: "member",
    provider: "microsoft",
    created_at: at(-140, 14),
  },
  {
    // Deliberately has no calendar connected — drives the "connect your calendar"
    // empty state without needing a second fixture set.
    id: "usr_sofia",
    name: "Sofia Ricci",
    email: "sofia@vektor-mobility.de",
    job_title: "Sales Development Rep",
    role: "member",
    provider: null,
    created_at: at(-35, 9),
  },
];

interface SeedParticipant {
  /** Set for colleagues, null for external guests. */
  user_id: string | null;
  name: string;
  email: string;
  company: string;
  response: string;
  is_organizer: number;
}

/** Shorthand for an internal attendee: colleagues are always linked to a user row. */
function colleague(userId: string, response = "accepted", isOrganizer = false): SeedParticipant {
  const user = USERS.find((u) => u.id === userId);
  if (!user) throw new Error(`seed: unknown user ${userId}`);
  return {
    user_id: user.id,
    name: user.name,
    email: user.email,
    company: ORG.name,
    response,
    is_organizer: isOrganizer ? 1 : 0,
  };
}

function guest(
  name: string,
  email: string,
  company: string,
  response = "accepted",
  isOrganizer = false,
): SeedParticipant {
  return { user_id: null, name, email, company, response, is_organizer: isOrganizer ? 1 : 0 };
}

interface SeedEntry {
  id: string;
  organizer_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  duration_minutes: number;
  provider: string;
  is_external: number;
  participants: SeedParticipant[];
}

const ENTRIES: SeedEntry[] = [
  {
    id: "cal_halden_discovery",
    organizer_id: "usr_lena",
    title: "Vektor × Halden Logistics — Discovery",
    description: "Intro call. Fleet telematics rollout, ~400 vehicles.",
    location: "https://meet.google.com/kbd-mfrx-qpz",
    starts_at: at(-6, 10),
    duration_minutes: 60,
    provider: "google",
    is_external: 1,
    participants: [
      colleague("usr_lena", "accepted", true),
      colleague("usr_marc"),
      guest("Anke Sørensen", "a.sorensen@halden-logistics.com", "Halden Logistics"),
      guest("Ruben Holt", "r.holt@halden-logistics.com", "Halden Logistics", "tentative"),
    ],
  },
  {
    id: "cal_weekly_sync",
    organizer_id: "usr_niko",
    title: "Weekly Sales Sync",
    description: "Pipeline review, forecast, blockers.",
    location: "https://meet.google.com/xyc-pqrs-tuv",
    starts_at: at(-5, 14, 30),
    duration_minutes: 30,
    provider: "google",
    is_external: 0,
    participants: [
      colleague("usr_niko", "accepted", true),
      colleague("usr_lena"),
      colleague("usr_tobias"),
      colleague("usr_sofia"),
      colleague("usr_priya", "declined"),
    ],
  },
  {
    id: "cal_kestrel_security",
    organizer_id: "usr_tobias",
    title: "Kestrel Pharma — Security Review",
    description: "InfoSec questionnaire walkthrough ahead of the pilot.",
    location: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_kestrel",
    starts_at: at(-4, 9),
    duration_minutes: 45,
    provider: "microsoft",
    is_external: 1,
    participants: [
      colleague("usr_tobias", "accepted", true),
      colleague("usr_marc"),
      guest("Jonas Feld", "j.feld@kestrelpharma.com", "Kestrel Pharma"),
      guest("Dr. Miriam Haas", "m.haas@kestrelpharma.com", "Kestrel Pharma"),
    ],
  },
  {
    id: "cal_orbit_pricing",
    organizer_id: "usr_lena",
    title: "Orbit Energy — Pricing & Next Steps",
    description: null,
    location: "https://meet.google.com/oer-gzta-nkd",
    starts_at: at(-3, 16),
    duration_minutes: 30,
    provider: "google",
    is_external: 1,
    participants: [
      colleague("usr_lena", "accepted", true),
      colleague("usr_niko"),
      guest("Wiebke Ahrens", "w.ahrens@orbit-energy.eu", "Orbit Energy"),
    ],
  },
  {
    id: "cal_muehlbach_deepdive",
    organizer_id: "usr_marc",
    title: "Mühlbach Maschinenbau — Technical Deep Dive",
    description: "API, on-prem constraints, data residency.",
    location: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_muehlbach",
    starts_at: at(-2, 11),
    duration_minutes: 60,
    provider: "microsoft",
    is_external: 1,
    participants: [
      colleague("usr_marc", "accepted", true),
      colleague("usr_tobias"),
      guest("Stefan Mühlbach", "s.muehlbach@muehlbach-mb.de", "Mühlbach Maschinenbau"),
      guest("Carola Denk", "c.denk@muehlbach-mb.de", "Mühlbach Maschinenbau"),
      guest("Ali Kaya", "a.kaya@muehlbach-mb.de", "Mühlbach Maschinenbau", "needs_action"),
    ],
  },
  {
    id: "cal_halden_kickoff",
    organizer_id: "usr_priya",
    title: "Halden Logistics — Onboarding Kickoff",
    description: "Hand-over from sales, rollout plan for weeks 1–4.",
    location: "https://meet.google.com/hld-kick-off",
    starts_at: at(-1, 13),
    duration_minutes: 30,
    provider: "google",
    is_external: 1,
    participants: [
      colleague("usr_priya", "accepted", true),
      colleague("usr_lena"),
      guest("Anke Sørensen", "a.sorensen@halden-logistics.com", "Halden Logistics"),
    ],
  },
  {
    // Starts 25 minutes ago — the meeting attached to it is still recording.
    id: "cal_orbit_contract",
    organizer_id: "usr_lena",
    title: "Orbit Energy — Contract Walkthrough",
    description: "Redlines from their legal team.",
    location: "https://meet.google.com/orb-cntr-wlk",
    starts_at: fromNow(-25),
    duration_minutes: 45,
    provider: "google",
    is_external: 1,
    participants: [
      colleague("usr_lena", "accepted", true),
      colleague("usr_niko"),
      guest("Wiebke Ahrens", "w.ahrens@orbit-energy.eu", "Orbit Energy"),
      guest("Peter Lindqvist", "p.lindqvist@orbit-energy.eu", "Orbit Energy"),
    ],
  },
  {
    id: "cal_kestrel_pilot",
    organizer_id: "usr_tobias",
    title: "Vektor × Kestrel Pharma — Pilot Review",
    description: "Four weeks in: adoption numbers and the go/no-go.",
    location: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_pilot",
    starts_at: at(1, 10),
    duration_minutes: 60,
    provider: "microsoft",
    is_external: 1,
    participants: [
      colleague("usr_tobias", "accepted", true),
      colleague("usr_priya"),
      guest("Jonas Feld", "j.feld@kestrelpharma.com", "Kestrel Pharma"),
      guest("Dr. Miriam Haas", "m.haas@kestrelpharma.com", "Kestrel Pharma", "tentative"),
    ],
  },
  {
    id: "cal_1on1_sofia",
    organizer_id: "usr_niko",
    title: "1:1 Niko / Sofia",
    description: null,
    location: "https://meet.google.com/one-on-one",
    starts_at: at(1, 15, 30),
    duration_minutes: 30,
    provider: "google",
    is_external: 0,
    participants: [colleague("usr_niko", "accepted", true), colleague("usr_sofia")],
  },
  {
    id: "cal_roundtable",
    organizer_id: "usr_niko",
    title: "Product & Sales Roundtable",
    description: "What we keep losing deals on. Bring one example each.",
    location: "Berlin HQ — Room Kreuzberg",
    starts_at: at(2, 9, 30),
    duration_minutes: 60,
    provider: "google",
    is_external: 0,
    participants: [
      colleague("usr_niko", "accepted", true),
      colleague("usr_lena"),
      colleague("usr_tobias"),
      colleague("usr_marc"),
      colleague("usr_priya"),
      colleague("usr_sofia", "tentative"),
    ],
  },
  {
    id: "cal_muehlbach_proposal",
    organizer_id: null,
    title: "Mühlbach Maschinenbau — Commercial Proposal",
    description: "Invited by Mühlbach. Procurement will join.",
    location: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_proposal",
    starts_at: at(3, 11),
    duration_minutes: 45,
    provider: "microsoft",
    is_external: 1,
    participants: [
      guest(
        "Stefan Mühlbach",
        "s.muehlbach@muehlbach-mb.de",
        "Mühlbach Maschinenbau",
        "accepted",
        true,
      ),
      colleague("usr_tobias"),
      colleague("usr_niko", "needs_action"),
      guest("Ali Kaya", "a.kaya@muehlbach-mb.de", "Mühlbach Maschinenbau"),
    ],
  },
  {
    id: "cal_halden_checkin",
    organizer_id: "usr_priya",
    title: "Halden Logistics — Weekly Check-in",
    description: null,
    location: "https://meet.google.com/hld-weekly",
    starts_at: at(4, 14),
    duration_minutes: 30,
    provider: "google",
    is_external: 1,
    participants: [
      colleague("usr_priya", "accepted", true),
      guest("Ruben Holt", "r.holt@halden-logistics.com", "Halden Logistics"),
    ],
  },
];

interface SeedMeeting {
  id: string;
  owner_id: string;
  calendar_entry_id: string | null;
  title: string;
  started_at: string;
  duration_minutes: number;
  source: string;
  status: string;
  language: string;
  summary: string | null;
  transcript: [speaker: string, startMs: number, text: string][];
}

const MEETINGS: SeedMeeting[] = [
  {
    id: "mtg_halden_discovery",
    owner_id: "usr_lena",
    calendar_entry_id: "cal_halden_discovery",
    title: "Vektor × Halden Logistics — Discovery",
    started_at: at(-6, 10, 2),
    duration_minutes: 54,
    source: "calendar",
    status: "completed",
    language: "en",
    summary: [
      "**Context**",
      "Halden runs ~400 vehicles across Norway and northern Germany. Their current telematics contract ends in Q1 and they are actively looking to replace it.",
      "",
      "**Pain points**",
      "- Drivers ignore the current app; adoption sits around 30%.",
      "- No usable API, so fuel data is re-keyed into SAP by hand every month.",
      "- Support response times from the incumbent are measured in days.",
      "",
      "**Next steps**",
      "- Lena to send the integration one-pager and two logistics references by Friday.",
      "- Marc to confirm whether the SAP connector covers their ECC 6.0 version.",
      "- Follow-up technical session with Ruben's team in two weeks.",
    ].join("\n"),
    transcript: [
      ["Lena Brandt", 4000, "Thanks for making the time. Before I show anything — what made you start looking?"],
      ["Anke Sørensen", 15000, "Our contract with the current provider runs out in Q1. Honestly, we would not renew even if the price were the same."],
      ["Lena Brandt", 27000, "What's driving that?"],
      ["Anke Sørensen", 31000, "Two things. The drivers don't use the app, so half our data is guesswork. And there's no real API — my team exports CSVs and types fuel figures into SAP every month."],
      ["Marc Dubois", 52000, "How many vehicles are we talking about, and are they all on the same hardware?"],
      ["Anke Sørensen", 60000, "About 400. Mixed — roughly 250 on the older units, the rest we replaced last year."],
      ["Ruben Holt", 78000, "The mixed fleet is the part I'd want to test early. Last migration took us seven months because of it."],
      ["Lena Brandt", 90000, "That's fair. We'd normally run a two-week pilot on one depot before committing to anything fleet-wide."],
      ["Anke Sørensen", 104000, "That would help internally. If you can show adoption above fifty percent in the pilot, I can make the case to our CFO."],
      ["Marc Dubois", 121000, "Which SAP version are you on? ECC or S/4?"],
      ["Anke Sørensen", 127000, "ECC 6.0. There's an S/4 project but it keeps getting pushed."],
      ["Lena Brandt", 136000, "Good to know — I'll confirm the connector covers it and send that over with two references from logistics customers."],
    ],
  },
  {
    id: "mtg_weekly_sync",
    owner_id: "usr_niko",
    calendar_entry_id: "cal_weekly_sync",
    title: "Weekly Sales Sync",
    started_at: at(-5, 14, 31),
    duration_minutes: 28,
    source: "calendar",
    status: "completed",
    language: "de",
    summary: [
      "**Forecast**",
      "Q4 steht bei 61% Zielerreichung. Orbit Energy und Halden Logistics sind die beiden Deals, die den Quartalsabschluss entscheiden.",
      "",
      "**Blocker**",
      "- Kestrel Pharma wartet weiterhin auf die ausgefüllte InfoSec-Checkliste.",
      "- Mühlbach will On-Prem — Marc prüft, ob das überhaupt darstellbar ist.",
      "",
      "**Beschlüsse**",
      "- Sofia übernimmt ab nächster Woche die Erstqualifizierung für alle Inbound-Leads.",
      "- Niko spricht mit Legal wegen der Standard-AVV.",
    ].join("\n"),
    transcript: [
      ["Niko Noll", 3000, "Kurz die Zahlen: wir stehen bei 61 Prozent. Das ist machbar, aber nur wenn Orbit und Halden reinkommen."],
      ["Lena Brandt", 14000, "Orbit ist bei den Redlines. Deren Legal hat drei Punkte, zwei davon sind Standard."],
      ["Niko Noll", 24000, "Und der dritte?"],
      ["Lena Brandt", 27000, "Haftungsbegrenzung. Da brauche ich dich oder Legal."],
      ["Niko Noll", 33000, "Ich nehme das mit. Tobias, Kestrel?"],
      ["Tobias Weiß", 38000, "Hängt an der InfoSec-Checkliste. Die liegt seit zwei Wochen bei uns, nicht bei denen."],
      ["Niko Noll", 47000, "Das ist unser Blocker, nicht deren. Bis Freitag raus."],
      ["Tobias Weiß", 53000, "Verstanden. Mühlbach will außerdem On-Prem, das ist die größere Frage."],
      ["Niko Noll", 62000, "Marc schaut sich das an. Sofia — du übernimmst ab Montag die Erstqualifizierung für Inbound."],
      ["Sofia Ricci", 74000, "Mache ich. Ich bräuchte dafür Zugriff auf das Calendar-Routing."],
    ],
  },
  {
    id: "mtg_kestrel_security",
    owner_id: "usr_tobias",
    calendar_entry_id: "cal_kestrel_security",
    title: "Kestrel Pharma — Security Review",
    started_at: at(-4, 9, 1),
    duration_minutes: 41,
    source: "calendar",
    status: "completed",
    language: "en",
    summary: [
      "**Outcome**",
      "No blocking findings. Kestrel's InfoSec team accepted the architecture subject to two written confirmations.",
      "",
      "**Open items**",
      "- Written confirmation that all processing stays inside the EU, including sub-processors.",
      "- SOC 2 Type II report — Miriam needs the current one, not the 2023 edition.",
      "- Data retention: they want 90 days, default is 12 months. Configurable, Marc confirmed.",
      "",
      "**Next steps**",
      "- Tobias to send both documents by Wednesday; pilot can start once they land.",
    ].join("\n"),
    transcript: [
      ["Jonas Feld", 5000, "We have about forty minutes. Miriam runs InfoSec, so she'll drive most of the questions."],
      ["Dr. Miriam Haas", 12000, "Let's start with where data is processed. All of it, including any sub-processors."],
      ["Marc Dubois", 20000, "Everything runs in eu-central-1. Transcription is in-house, no third-party model providers outside the EU."],
      ["Dr. Miriam Haas", 33000, "I'll need that in writing, with the sub-processor list attached."],
      ["Tobias Weiß", 39000, "You'll have it Wednesday."],
      ["Dr. Miriam Haas", 43000, "Retention. Your documentation says twelve months. We're required to hold at ninety days."],
      ["Marc Dubois", 52000, "That's configurable per workspace, and it applies retroactively to existing recordings."],
      ["Dr. Miriam Haas", 61000, "Good. And your SOC 2 — the copy in the data room is from 2023."],
      ["Tobias Weiß", 69000, "The current Type II is done, I'll include it with the EU confirmation."],
      ["Jonas Feld", 76000, "If those two land this week, I see no reason we can't start the pilot on the first."],
    ],
  },
  {
    id: "mtg_orbit_pricing",
    owner_id: "usr_lena",
    calendar_entry_id: "cal_orbit_pricing",
    title: "Orbit Energy — Pricing & Next Steps",
    started_at: at(-3, 16, 1),
    duration_minutes: 26,
    source: "calendar",
    status: "completed",
    language: "en",
    summary: [
      "**Commercials**",
      "Agreed at 120 seats on the annual plan with a 15% multi-year discount, contingent on a three-year term.",
      "",
      "**Risk**",
      "Wiebke's budget approval expires at the end of the quarter. If paperwork slips past that, the deal restarts in their next planning cycle.",
      "",
      "**Next steps**",
      "- Lena to send the redlined MSA today.",
      "- Niko to resolve the liability cap with Legal before the contract walkthrough.",
    ].join("\n"),
    transcript: [
      ["Wiebke Ahrens", 3000, "I got the budget signed off, but it's tied to this quarter. That's the constraint I can't move."],
      ["Lena Brandt", 13000, "Understood. If we're signing this quarter, I can hold the multi-year discount at fifteen percent."],
      ["Wiebke Ahrens", 22000, "On how many seats?"],
      ["Lena Brandt", 25000, "A hundred and twenty, annual plan, three-year term."],
      ["Wiebke Ahrens", 31000, "Three years is long for us. Two with an option?"],
      ["Niko Noll", 37000, "Two-year with a renewal option, and I can hold twelve percent rather than fifteen."],
      ["Wiebke Ahrens", 47000, "Let me take that back. The bigger question is legal — our team flagged the liability cap."],
      ["Lena Brandt", 58000, "I'll send the redlined MSA today and we'll walk through it with your counsel."],
    ],
  },
  {
    id: "mtg_muehlbach_deepdive",
    owner_id: "usr_marc",
    calendar_entry_id: "cal_muehlbach_deepdive",
    title: "Mühlbach Maschinenbau — Technical Deep Dive",
    started_at: at(-2, 11, 3),
    duration_minutes: 58,
    source: "calendar",
    status: "completed",
    language: "en",
    summary: [
      "**The real requirement**",
      "Stefan opened with \"on-prem or nothing\", but the actual constraint is their works council agreement: no employee voice data leaving company-controlled infrastructure. A dedicated EU tenant with customer-managed keys may satisfy it — Carola is checking with the council.",
      "",
      "**Technical**",
      "- They need SSO via their existing Keycloak, not our hosted IdP.",
      "- Machine-hall recordings have heavy background noise; they want a sample tested before committing.",
      "",
      "**Next steps**",
      "- Marc to run their sample audio through transcription and report word error rate.",
      "- Carola to get a written read from the works council within two weeks.",
    ].join("\n"),
    transcript: [
      ["Stefan Mühlbach", 6000, "I'll be direct — we've been told this has to be on-premise. Otherwise we don't get past our works council."],
      ["Marc Dubois", 17000, "Let me ask a different question. Is the requirement on-premise specifically, or that voice data stays under your control?"],
      ["Carola Denk", 28000, "The agreement says company-controlled infrastructure. It doesn't actually say the words 'on premise'."],
      ["Marc Dubois", 39000, "Then a dedicated tenant with customer-managed encryption keys might qualify. You hold the keys; we can't read the data."],
      ["Stefan Mühlbach", 51000, "That's a different conversation than the one I expected. Carola, can the council rule on that?"],
      ["Carola Denk", 60000, "I can ask. Two weeks, realistically."],
      ["Stefan Mühlbach", 67000, "The other thing is noise. Our people are in the machine hall — it's loud."],
      ["Marc Dubois", 76000, "Send me a raw sample and I'll run it through and give you an honest word error rate. If it's bad, I'd rather tell you now."],
      ["Carola Denk", 88000, "One more: we use Keycloak for SSO. We're not moving off it."],
      ["Marc Dubois", 95000, "Standard OIDC, that's fine."],
    ],
  },
  {
    id: "mtg_halden_kickoff",
    owner_id: "usr_priya",
    calendar_entry_id: "cal_halden_kickoff",
    title: "Halden Logistics — Onboarding Kickoff",
    started_at: at(-1, 13, 1),
    duration_minutes: 32,
    source: "calendar",
    status: "processing",
    language: "en",
    // Still processing — the summary hasn't been generated yet. This is the state
    // the UI needs to render without a summary.
    summary: null,
    transcript: [],
  },
  {
    id: "mtg_kestrel_adhoc",
    owner_id: "usr_tobias",
    calendar_entry_id: null,
    title: "Call with Jonas Feld (Kestrel Pharma)",
    started_at: at(-4, 17, 20),
    duration_minutes: 18,
    source: "ad_hoc",
    status: "completed",
    language: "en",
    summary: [
      "Unscheduled follow-up right after the security review.",
      "",
      "Jonas confirmed the pilot budget is already approved and does not need a separate procurement round — it sits under an existing innovation line. He asked that the pilot include their Basel site, not just Frankfurt, which adds roughly 30 users at no extra cost for the trial period.",
      "",
      "**Next step:** Tobias to reflect Basel in the pilot scope document.",
    ].join("\n"),
    transcript: [
      ["Jonas Feld", 2000, "Quick one before you disappear — you don't need to worry about procurement for the pilot."],
      ["Tobias Weiß", 9000, "That's not what I expected to hear."],
      ["Jonas Feld", 13000, "It comes out of an innovation budget I control. Procurement only gets involved at the production contract."],
      ["Tobias Weiß", 22000, "Good. Does that change the scope you want?"],
      ["Jonas Feld", 27000, "Yes — I'd like Basel included, not just Frankfurt. About thirty more people."],
      ["Tobias Weiß", 35000, "For a pilot that's fine, no extra cost. I'll update the scope doc."],
    ],
  },
  {
    id: "mtg_renewal_risk",
    owner_id: "usr_priya",
    calendar_entry_id: null,
    title: "Quick sync — renewal risk",
    started_at: at(-2, 8, 40),
    duration_minutes: 11,
    source: "phone",
    status: "completed",
    language: "en",
    summary: [
      "Priya flagged that the champion at one of the accounts up for renewal has left the company. Usage has dropped roughly 40% in three weeks and nobody at the account has replaced them as an internal owner.",
      "",
      "**Agreed:** Priya to get a meeting with the new operations lead this week; Niko to join if it becomes a commercial conversation.",
    ].join("\n"),
    transcript: [
      ["Priya Raman", 1000, "Heads up, our champion there left. Found out from LinkedIn, not from them."],
      ["Niko Noll", 8000, "How bad is usage?"],
      ["Priya Raman", 11000, "Down about forty percent in three weeks. No one picked up his seat."],
      ["Niko Noll", 19000, "Then it's a renewal risk, not a usage dip. Get in front of whoever owns operations now."],
      ["Priya Raman", 27000, "Trying this week. If it turns commercial I'll pull you in."],
    ],
  },
  {
    id: "mtg_orbit_contract",
    owner_id: "usr_lena",
    calendar_entry_id: "cal_orbit_contract",
    title: "Orbit Energy — Contract Walkthrough",
    started_at: fromNow(-24),
    duration_minutes: 24,
    source: "calendar",
    status: "recording",
    language: "en",
    summary: null,
    transcript: [
      ["Wiebke Ahrens", 5000, "Peter is our counsel — he'll take us through the redlines."],
      ["Peter Lindqvist", 14000, "Three clauses. The liability cap is the one that matters, the other two are drafting."],
      ["Niko Noll", 26000, "Let's start there then."],
      ["Peter Lindqvist", 31000, "You've capped at twelve months of fees. Our standard is the greater of that or two million euro."],
    ],
  },
];

export function seed(db: DatabaseSync): void {
  const insertOrg = db.prepare(
    "INSERT INTO orgs (id, name, domain, plan, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  const insertUser = db.prepare(
    `INSERT INTO users (id, org_id, name, email, job_title, role, provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertEntry = db.prepare(
    `INSERT INTO calendar_entries
       (id, org_id, organizer_id, title, description, location, starts_at, duration_minutes, provider, is_external)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertParticipant = db.prepare(
    `INSERT INTO calendar_participants
       (id, calendar_entry_id, user_id, name, email, company, response, is_organizer)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertMeeting = db.prepare(
    `INSERT INTO meetings
       (id, org_id, owner_id, calendar_entry_id, title, started_at, duration_minutes, source, status, language, summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertSegment = db.prepare(
    `INSERT INTO transcript_segments (id, meeting_id, position, speaker, start_ms, text)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  insertOrg.run(ORG.id, ORG.name, ORG.domain, ORG.plan, ORG.created_at);

  for (const u of USERS) {
    insertUser.run(u.id, ORG.id, u.name, u.email, u.job_title, u.role, u.provider, u.created_at);
  }

  for (const entry of ENTRIES) {
    insertEntry.run(
      entry.id,
      ORG.id,
      entry.organizer_id,
      entry.title,
      entry.description,
      entry.location,
      entry.starts_at,
      entry.duration_minutes,
      entry.provider,
      entry.is_external,
    );
    entry.participants.forEach((p, i) => {
      insertParticipant.run(
        `${entry.id}_p${i}`,
        entry.id,
        p.user_id,
        p.name,
        p.email,
        p.company,
        p.response,
        p.is_organizer,
      );
    });
  }

  for (const meeting of MEETINGS) {
    insertMeeting.run(
      meeting.id,
      ORG.id,
      meeting.owner_id,
      meeting.calendar_entry_id,
      meeting.title,
      meeting.started_at,
      meeting.duration_minutes,
      meeting.source,
      meeting.status,
      meeting.language,
      meeting.summary,
    );
    meeting.transcript.forEach(([speaker, startMs, text], i) => {
      insertSegment.run(`${meeting.id}_s${i}`, meeting.id, i, speaker, startMs, text);
    });
  }
}
