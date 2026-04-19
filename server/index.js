const express = require('express');
const cors = require('cors');
const fetch = global.fetch || require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

if (!CLAUDE_KEY) console.warn('Warning: CLAUDE_API_KEY not set. Set it in environment before starting the server.');

app.use(cors());
app.use(express.json());

function buildSystemPrompt(profile = {}) {
  const track = (profile && profile.starting_track) || "generic";
  const common = `You are PathwayAI, an expert study-abroad advisor. Your task is to take a student's profile and produce a HIGHLY PERSONALIZED, ACTIONABLE study-abroad plan.

CRITICAL RULES (apply to every track):
1. NEVER produce generic advice. Every recommendation must be traceable to something specific in this student's profile.
2. Explicitly acknowledge the student's career goal, field, and constraints — reference them by name.
3. Surface trade-offs honestly: if GPA is borderline, say so; if budget is tight, say so.
4. Prioritize depth over breadth. Prefer 3 well-justified recommendations to many vague ones.
5. Name specific programs, institutions, and scholarship schemes where relevant.
6. For each recommendation, explain WHY it fits THIS student specifically.
7. Be direct and actionable. If something is unrealistic, offer a realistic alternative.
8. Write in clear English with a warm, direct tone.

OUTPUT FORMAT — use exactly this structure:

## Your Profile Summary
[2–3 sentences capturing who they are and what they're trying to do.]

## What We See: Honest Assessment
[Bullet points assessing: academic strength, language readiness, financial reality, timeline feasibility, career clarity. Reference concrete values where available.]

## Recommended Programs
[3–5 programs. For each:]
### [Program Name] — [Institution], [Country]
**Why this fits you:** [Specific to this student]
**What you'd gain:** [Concrete outcomes]
**Requirements & your fit:** [Gap analysis vs their profile]
**Cost reality:** [Estimated tuition + living, scholarship options]
**Watch out for:** [1–2 risks specific to this student]

## Your 3 Most Critical Actions Right Now
[Numbered, time-bound, concrete actions tailored to their profile]

## The Honest Trade-off You Need to Make
[One paragraph naming the specific tension and a clear recommendation.]

## One Thing Most Advisors Won't Tell You
[A non-obvious insight tailored to their profile.]
`;

  if (track === "secondary") {
    return `TRACK 1 — Secondary School Adviser\n${common}\n\nSPECIFIC GUIDANCE FOR SECONDARY-TO-HIGH-SCHOOL PATHS:\n- Focus on early profile-building: extracurricular depth, teacher relationships, and English readiness.\n- Prioritize fit: boarding vs day school has major wellbeing implications; recommend schools that match the student's academic standing and budget.\n- When naming schools, include concrete entry routes (scholarships, foundation years, interview/portfolio expectations).\n\nCRITICAL: Always tie every school or pathway recommendation to the student's grade, academic standing, English level, parental support, and budget as given in the profile.\n`;
  }

  if (track === "highschool") {
    return `TRACK 2 — High-School-to-University Adviser\n${common}\n\nSPECIFIC GUIDANCE FOR HIGH-SCHOOL-TO-UNIVERSITY PATHS:\n- Prioritize test strategy (IB predicted grades / A-levels / SAT / AP / IELTS) and extracurricular narratives that support their course choice.\n- Recommend a short list of target / reach / safety universities and specific programs, with clear rationales and requirement gaps.\n- Include scholarship pathways and likely deadlines; estimate realistic timelines for test prep and application components (essays, recommendations, portfolios).\n\nCRITICAL: Every recommendation must reference the student's curriculum, grades, extracurriculars, budget, and stated career goal.\n`;
  }

  if (track === "university") {
    return `TRACK 3 — University-to-Masters Adviser\n${common}\n\nSPECIFIC GUIDANCE FOR UNIVERSITY-TO-MASTERS PATHS:\n- Assess academic fit: match specialization to their GPA, research experience, and work experience.\n- Recommend program types (taught, research, conversion, MBA) with concrete examples of institutions and scholarship schemes appropriate to their profile.\n- Provide candid advice on timing: when to apply, whether to gain work experience first, and how to strengthen weak areas (language tests, research, internships).\n\nCRITICAL: Always quantify gaps (e.g., "Your GPA 3.1 vs typical requirement 3.5") and recommend precise remediation steps.\n`;
  }

  return `PathwayAI — General Adviser\n${common}`;
}

function buildUserPrompt(profile) {
  const lines = Object.entries(profile || {})
    .filter(([, v]) => v && v.toString().trim())
    .map(([k, v]) => `${k}: ${v}`);
  return `Here is the student's full profile:\n\n${lines.join("\n")}\n\nGenerate their personalized study-abroad plan now.`;
}

app.post('/api/generate', async (req, res) => {
  try {
    const profile = req.body.profile || {};
    const system = buildSystemPrompt(profile);
    const user = buildUserPrompt(profile);

    if (!CLAUDE_KEY) return res.status(500).json({ error: 'Server missing CLAUDE_API_KEY environment variable.' });

    // Development helper: if MOCK_CLAUDE is set, return a canned response
    if (process.env.MOCK_CLAUDE === 'true') {
      const sample = `## Your Profile Summary\nA high-school student aiming for Computer Science abroad.\n\n## What We See: Honest Assessment\n- GPA: 3.6 — competitive for many good programs.\n- English: B2 — will likely need an IELTS/TOEFL push.\n- Budget: medium — several destinations possible with scholarships.\n\n## Recommended Programs\n### Computer Science — University of Example, Country X\n**Why this fits you:** Matches strong math background and realistic budget.\n**What you'd gain:** Robust CS fundamentals and internship pipeline.\n**Requirements & your fit:** GPA OK; strengthen English and a programming portfolio.\n**Cost reality:** Tuition ~ $20k/year; scholarships available.\n\n## Your 3 Most Critical Actions Right Now\n1. Prepare a programming portfolio (3 small projects) — 6 weeks.\n2. Take IELTS and target 7.0 — 3 months.\n3. Research 4 target programs and note deadlines — 2 weeks.\n\n## The Honest Trade-off You Need to Make\nChoose between a cheaper program with strong internship pathways or an expensive prestige program with less practical focus.\n\n## One Thing Most Advisors Won't Tell You\nA small, focused portfolio often outweighs marginal GPA differences for practical CS programs.`;
      return res.json({ text: sample, raw: { mocked: true } });
    }

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: system,
      messages: [{ role: 'user', content: user }],
    };

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        // Anthropic API requires a version header
        'anthropic-version': "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(502).json({ error: 'Upstream API error', detail: err });
    }

    const data = await r.json();
    // Try several shapes for returned text
    const text = data.content?.[0]?.text || data.output?.[0]?.content?.[0]?.text || data?.completion || JSON.stringify(data);
    return res.json({ text, raw: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
