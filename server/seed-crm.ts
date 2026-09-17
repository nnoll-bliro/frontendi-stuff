import type { DatabaseSync } from "node:sqlite";

const ORG = "org_vektor";

/** Curated fixtures only. None of this is runtime matching or automatic creation. */
const COMPANIES = [
  [
    "co_halden",
    "Halden Logistics",
    "halden-logistics.com",
    "400-vehicle fleet across Norway and Germany. Anke sponsors the rollout; Ruben owns depot integration. The first depot pilot is the immediate priority.",
  ],
  [
    "co_kestrel",
    "Kestrel Pharma",
    "kestrelpharma.com",
    "Security review completed; written EU processing confirmation is needed before the pilot.",
  ],
  [
    "co_orbit",
    "Orbit Energy",
    "orbit-energy.eu",
    "Commercial terms under discussion; legal review is the remaining blocker.",
  ],
  [
    "co_muehlbach",
    "Mühlbach Maschinenbau",
    "muehlbach-mb.de",
    "Exploring a dedicated EU tenant subject to works council approval.",
  ],
  [
    "co_nordlicht",
    "Nordlicht Services",
    "nordlicht.example",
    "Newly encountered at a fleet event. A manually seeded example, not an automatically created record. Needs an introductory follow-up.",
  ],
];

const PEOPLE = [
  [
    "per_anke",
    "co_halden",
    "Anke Sørensen",
    "a.sorensen@halden-logistics.com",
    "Operations Director",
    "Executive sponsor. Wants evidence of driver adoption above 50% before a fleet-wide commitment.",
  ],
  [
    "per_ruben",
    "co_halden",
    "Ruben Holt",
    "r.holt@halden-logistics.com",
    "Integration Lead",
    "Owns mixed-fleet integration. Prefers a small depot pilot before broader migration.",
  ],
  [
    "per_jonas",
    "co_kestrel",
    "Jonas Feld",
    "j.feld@kestrelpharma.com",
    "Innovation Lead",
    "Controls the pilot budget and wants Basel included.",
  ],
  [
    "per_miriam",
    "co_kestrel",
    "Dr. Miriam Haas",
    "m.haas@kestrelpharma.com",
    "InfoSec Lead",
    "Needs current security documentation in writing.",
  ],
  [
    "per_wiebke",
    "co_orbit",
    "Wiebke Ahrens",
    "w.ahrens@orbit-energy.eu",
    "Procurement Lead",
    "Budget approval is tied to this quarter.",
  ],
  [
    "per_peter",
    "co_orbit",
    "Peter Lindqvist",
    "p.lindqvist@orbit-energy.eu",
    "Legal Counsel",
    "Reviewing liability terms.",
  ],
  [
    "per_stefan",
    "co_muehlbach",
    "Stefan Mühlbach",
    "s.muehlbach@muehlbach-mb.de",
    "Managing Director",
    "Needs company-controlled infrastructure.",
  ],
  [
    "per_carola",
    "co_muehlbach",
    "Carola Denk",
    "c.denk@muehlbach-mb.de",
    "IT Lead",
    "Liaison with the works council.",
  ],
  [
    "per_ali",
    "co_muehlbach",
    "Ali Kaya",
    "a.kaya@muehlbach-mb.de",
    "Procurement",
    "Joining the commercial proposal discussion.",
  ],
  [
    "per_mira",
    "co_nordlicht",
    "Mira Beck",
    "mira@nordlicht.example",
    "Fleet Manager",
    "Newly encountered contact from a fleet event. Manually seeded; no enrichment or identity matching runs.",
  ],
  [
    "per_avery",
    null,
    "Avery Morgan",
    "avery@example.com",
    "Independent fleet adviser",
    "Independent contact without a company. Discussed how to evaluate pilot adoption.",
  ],
] as const;

export function seedCrm(db: DatabaseSync): void {
  // Do not inject this fictional story into a database for a different organization.
  if (!db.prepare("SELECT id FROM orgs WHERE id = ?").get(ORG)) return;
  const company = db.prepare(
    "INSERT INTO companies (id, org_id, name, domain, overview) VALUES (?, ?, ?, ?, ?)",
  );
  for (const [id, name, domain, overview] of COMPANIES)
    company.run(id, ORG, name, domain, overview);
  const person =
    db.prepare(`INSERT INTO people (id, org_id, company_id, name, email, job_title, overview)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  for (const [id, companyId, name, email, title, overview] of PEOPLE) {
    person.run(id, ORG, companyId, name, email, title, overview);
  }

  // Explicit fixture links: calendar entries retain their own invite metadata.
  for (const [meetingId, companyId, overview] of [
    [
      "mtg_halden_discovery",
      "co_halden",
      "Anke and Ruben described low driver adoption, SAP re-keying, and the risks of migrating a mixed fleet.",
    ],
    [
      "mtg_halden_kickoff",
      "co_halden",
      "Anke agreed the first four weeks of rollout with Priya and Lena. Transcript processing is separate from this completed meeting.",
    ],
    [
      "mtg_kestrel_security",
      "co_kestrel",
      "Reviewed EU processing, retention and security reports with Jonas and Miriam.",
    ],
    [
      "mtg_kestrel_adhoc",
      "co_kestrel",
      "Jonas confirmed the pilot budget and requested Basel in the scope.",
    ],
    [
      "mtg_orbit_pricing",
      "co_orbit",
      "Discussed seat count, discount and quarter-end budget timing with Wiebke.",
    ],
    [
      "mtg_orbit_contract",
      "co_orbit",
      "Wiebke and Peter are reviewing the liability cap with Niko and Lena. Static in-progress example; no live recording.",
    ],
    [
      "mtg_muehlbach_deepdive",
      "co_muehlbach",
      "Discussed infrastructure constraints and works council requirements with Stefan and Carola.",
    ],
  ]) {
    db.prepare(
      "UPDATE meetings SET company_id = ?, overview = ? WHERE id = ?",
    ).run(companyId, overview, meetingId);
  }
  for (const [id, , , email] of PEOPLE) {
    db.prepare(
      `UPDATE meeting_participants SET person_id = ? WHERE email = ? AND user_id IS NULL
      AND meeting_id IN ('mtg_halden_discovery', 'mtg_halden_kickoff', 'mtg_kestrel_security',
      'mtg_orbit_pricing', 'mtg_orbit_contract', 'mtg_muehlbach_deepdive')`,
    ).run(id, email);
  }
  if (
    db.prepare("SELECT id FROM meetings WHERE id = 'mtg_kestrel_adhoc'").get()
  ) {
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, person_id, name, email)
      SELECT 'mtg_kestrel_adhoc_jonas', 'mtg_kestrel_adhoc', id, name, email FROM people WHERE id = 'per_jonas'`,
    ).run();
  }
  if (
    db.prepare("SELECT id FROM meetings WHERE id = 'mtg_renewal_risk'").get()
  ) {
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, user_id, name, email)
      SELECT 'mtg_renewal_risk_niko', 'mtg_renewal_risk', id, name, email FROM users WHERE id = 'usr_niko'`,
    ).run();
  }

  // Base the new story on the persisted discovery date so upgrades do not shift history.
  const anchor = db
    .prepare(
      "SELECT started_at FROM meetings WHERE id = 'mtg_halden_discovery'",
    )
    .get() as { started_at: string } | undefined;
  const date = (days: number, hours = 0) =>
    new Date(
      new Date(anchor?.started_at ?? Date.now()).getTime() +
        (days * 24 + hours) * 3_600_000,
    ).toISOString();
  const touchpoint = db.prepare(`INSERT INTO meetings
    (id, org_id, owner_id, calendar_entry_id, company_id, kind, overview, title, started_at, duration_minutes, source, status)
    VALUES (?, ?, 'usr_lena', NULL, ?, ?, ?, ?, ?, ?, ?, 'held')`);
  touchpoint.run(
    "mtg_halden_depot",
    ORG,
    "co_halden",
    "call",
    "Ruben confirmed the pilot depot and asked for an ECC connector checklist. This customer call was not transcribed.",
    "Halden Logistics — Depot follow-up",
    date(3),
    15,
    "phone",
  );
  touchpoint.run(
    "mtg_nordlicht_intro",
    ORG,
    "co_nordlicht",
    "meeting",
    "Met Mira at a fleet event. Captured a voice memo afterwards; no customer transcript exists.",
    "Nordlicht Services — First conversation",
    date(4),
    12,
    "ad_hoc",
  );
  touchpoint.run(
    "mtg_avery_advice",
    ORG,
    null,
    "call",
    "Avery shared independent advice on measuring pilot adoption. No company link or transcript.",
    "Pilot advice with Avery Morgan",
    date(4, 2),
    20,
    "phone",
  );
  for (const [meetingId, personId] of [
    ["mtg_halden_depot", "per_ruben"],
    ["mtg_nordlicht_intro", "per_mira"],
    ["mtg_avery_advice", "per_avery"],
  ]) {
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, person_id, name, email)
      SELECT ? || '_contact', ?, id, name, email FROM people WHERE id = ?`,
    ).run(meetingId, meetingId, personId);
    db.prepare(
      `INSERT INTO meeting_participants (id, meeting_id, user_id, name, email)
      SELECT ? || '_owner', ?, id, name, email FROM users WHERE id = 'usr_lena'`,
    ).run(meetingId, meetingId);
  }

  const session = db.prepare(`INSERT INTO agent_sessions
    (id, org_id, company_id, meeting_id, title, channel, started_at, overview) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  session.run(
    "as_halden_debrief",
    ORG,
    "co_halden",
    "mtg_halden_depot",
    "Document Ruben's depot call",
    "call",
    date(3, 1),
    "Lena called Phone Assistant after speaking with Ruben. This is Lena's assistant conversation, not a recording of Ruben.",
  );
  session.run(
    "as_halden_plan",
    ORG,
    "co_halden",
    null,
    "Plan Halden account follow-up",
    "chat",
    date(4, 1),
    "An account-level assistant chat about Anke's adoption goals and Ruben's integration concerns; no single meeting link.",
  );
  session.run(
    "as_nordlicht_memo",
    ORG,
    "co_nordlicht",
    "mtg_nordlicht_intro",
    "Organize the fleet-event voice memo",
    "chat",
    date(4, 1),
    "Lena supplied her own voice-memo notes about meeting Mira. Seeded context only; nothing was recorded or created automatically.",
  );
  for (const [sessionId, personId] of [
    ["as_halden_debrief", "per_ruben"],
    ["as_halden_plan", "per_anke"],
    ["as_halden_plan", "per_ruben"],
    ["as_nordlicht_memo", "per_mira"],
  ])
    db.prepare("INSERT INTO agent_session_people VALUES (?, ?)").run(
      sessionId,
      personId,
    );
  const message = db.prepare(
    "INSERT INTO agent_messages (id, session_id, position, role, text) VALUES (?, ?, ?, ?, ?)",
  );
  for (const [sessionId, userText, assistantText] of [
    [
      "as_halden_debrief",
      "I just spoke to Ruben. The Trondheim depot will pilot first. He needs the ECC checklist.",
      "Draft documentation: Ruben confirmed Trondheim as the pilot depot. Lena will send the ECC connector checklist. This documents your recap, not the customer call audio.",
    ],
    [
      "as_halden_plan",
      "Help me organize follow-up across Anke and Ruben, beyond any single meeting.",
      "Sample account context: Anke needs adoption evidence; Ruben needs integration certainty. Keep the adoption review and connector checklist as separate follow-ups.",
    ],
    [
      "as_nordlicht_memo",
      "My voice memo says I met Mira Beck from Nordlicht at the event. She asked for an introductory follow-up.",
      "Sample documentation organized under the first conversation. Mira and Nordlicht are manually seeded examples; no records are being created here.",
    ],
  ]) {
    message.run(`${sessionId}_0`, sessionId, 0, "user", userText);
    message.run(`${sessionId}_1`, sessionId, 1, "assistant", assistantText);
  }
  const doc = db.prepare(`INSERT INTO meeting_documentation
    (id, meeting_id, agent_session_id, source, status, title, content) VALUES (?, ?, ?, ?, 'ready', ?, ?)`);
  doc.run(
    "doc_halden_phone",
    "mtg_halden_depot",
    "as_halden_debrief",
    "phone_assistant",
    "Phone Assistant recap",
    "Lena's recap after the customer call: Ruben selected Trondheim as the pilot depot and requested the ECC connector checklist. Not a customer transcript.",
  );
  doc.run(
    "doc_nordlicht_memo",
    "mtg_nordlicht_intro",
    "as_nordlicht_memo",
    "voice_memo",
    "Fleet-event voice memo",
    "Lena's voice-memo notes: Mira manages Nordlicht's fleet and wants an introductory follow-up. Company and person are newly encountered seeded examples, not auto-created records.",
  );
  const knowledge = db.prepare(`INSERT INTO knowledge_items
    (id, company_id, person_id, kind, title, content) VALUES (?, ?, ?, ?, ?, ?)`);
  knowledge.run(
    "kn_halden_revenue",
    "co_halden",
    null,
    "revenue_context",
    "Illustrative revenue context",
    "Sample planning estimate: €48,000 annual opportunity for the initial rollout. Not booked revenue or a computed forecast.",
  );
  knowledge.run(
    "kn_halden_internal",
    "co_halden",
    null,
    "internal_note",
    "Relationship context",
    "Prefer a phased rollout. Coordinate commercial promises with implementation capacity; this is account context, not meeting documentation.",
  );
  knowledge.run(
    "kn_anke",
    null,
    "per_anke",
    "internal_note",
    "Decision context",
    "Anke sponsors the change but needs adoption evidence for the CFO.",
  );
  knowledge.run(
    "kn_ruben",
    null,
    "per_ruben",
    "internal_note",
    "Working preferences",
    "Ruben wants written connector checklists before scheduling engineers.",
  );
  knowledge.run(
    "kn_avery",
    null,
    "per_avery",
    "internal_note",
    "Independent adviser",
    "No employer company is attached to this contact. Keep advice separate from customer commitments.",
  );
}
