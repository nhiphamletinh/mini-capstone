import React, { useState, useEffect, useRef } from "react";

// ── QUESTION TREE ─────────────────────────────────────────────────────────────
// Deep, branching, profession-specific intake
// Each question has: id, text, sub (hint), type, key (profile field), options[]
// Each option has: label, value, next (next question id or null to end)
// Special types: text, textarea, select, scale, number

// Redesigned question tree with three separate tracks
const Q = {
  // Starting question
  start: {
    id: "start",
    phase: "Start",
    text: "Right now, you are...",
    type: "select",
    key: "starting_track",
    options: [
      { label: "A secondary school student (Grade 6–9)", value: "secondary", next: "secondary_q1" },
      { label: "A high school student (Grade 10–12)", value: "highschool", next: "hs_q1" },
      { label: "A university student (Year 1–4)", value: "university", next: "uni_q1" },
    ],
  },

  // TRACK 1: Secondary School → High School Abroad (Grade 6–9)
  secondary_q1: { id: "secondary_q1", phase: "Secondary", text: "What grade are you currently in?", type: "select", key: "grade", options: [
    { label: "Grade 6", value: "6", next: "secondary_q2" },
    { label: "Grade 7", value: "7", next: "secondary_q2" },
    { label: "Grade 8", value: "8", next: "secondary_q2" },
    { label: "Grade 9", value: "9", next: "secondary_q2" },
  ]},
  secondary_q2: { id: "secondary_q2", phase: "Secondary", text: "Which country are you in right now?", type: "text", key: "current_country", next: "secondary_q3" },
  secondary_q3: { id: "secondary_q3", phase: "Secondary", text: "What type of high school abroad are you targeting?", type: "select", key: "school_type", options: [
    { label: "A boarding school (live on campus, full immersion)", value: "boarding", next: "secondary_q4" },
    { label: "A day school (live with a host family or guardian)", value: "day", next: "secondary_q4" },
    { label: "I'm not sure yet — show me what makes sense", value: "unsure", next: "secondary_q4" },
  ]},
  secondary_q4: { id: "secondary_q4", phase: "Secondary", text: "Which region are you most interested in?", type: "select", key: "region", options: [
    { label: "United Kingdom (Eton, Harrow, Cheltenham, etc.)", value: "uk", next: "secondary_q5" },
    { label: "United States (Exeter, Andover, Choate, etc.)", value: "usa", next: "secondary_q5" },
    { label: "Canada", value: "canada", next: "secondary_q5" },
    { label: "Australia / New Zealand", value: "anz", next: "secondary_q5" },
    { label: "Singapore / Hong Kong", value: "singapore_hk", next: "secondary_q5" },
    { label: "Europe (Switzerland, Germany, Netherlands)", value: "europe", next: "secondary_q5" },
    { label: "I'm open — recommend based on my profile", value: "open", next: "secondary_q5" },
  ]},
  secondary_q5: { id: "secondary_q5", phase: "Secondary", text: "Why do you want to go to high school abroad?", type: "select", key: "why_abroad", options: [
    { label: "I want to access top university admissions (Oxbridge, Ivy League, etc.)", value: "ivy_pipeline", next: "secondary_q6" },
    { label: "The education quality is much better than what's available locally", value: "education_quality", next: "secondary_q6" },
    { label: "I want to become fluent in English / another language", value: "language", next: "secondary_q6" },
    { label: "My family is moving / relocating abroad", value: "relocation", next: "secondary_q6" },
    { label: "I want independence and personal growth early", value: "independence", next: "secondary_q6" },
    { label: "A specific school has a program or sport I'm passionate about", value: "program_sport", next: "secondary_q6" },
  ]},
  secondary_q6: { id: "secondary_q6", phase: "Secondary", text: "What are you genuinely good at or passionate about?", type: "text", key: "strengths", next: "secondary_q7" },
  secondary_q7: { id: "secondary_q7", phase: "Secondary", text: "What is your academic standing at your current school?", type: "select", key: "academic_standing", options: [
    { label: "Top of my class / consistently in the top 5%", value: "top5", next: "secondary_q8" },
    { label: "Strong — usually in the top 20–30%", value: "top30", next: "secondary_q8" },
    { label: "Average — middle of the class", value: "average", next: "secondary_q8" },
    { label: "I struggle academically but have other strong qualities", value: "struggle", next: "secondary_q8" },
  ]},
  secondary_q8: { id: "secondary_q8", phase: "Secondary", text: "What is your English level right now?", type: "select", key: "english_level", options: [
    { label: "Very strong — I study or speak in English daily", value: "very_strong", next: "secondary_q9" },
    { label: "Good — I can hold conversations but writing needs work", value: "good", next: "secondary_q9" },
    { label: "Intermediate — I can communicate but struggle in academic English", value: "intermediate", next: "secondary_q9" },
    { label: "Beginner / weak — this is something I need to develop", value: "beginner", next: "secondary_q9" },
  ]},
  secondary_q9: { id: "secondary_q9", phase: "Secondary", text: "Have you taken any English tests? (IELTS, TOEFL, Duolingo, etc.)", type: "select", key: "english_test", options: [
    { label: "Yes — I have a test score", value: "yes", next: "secondary_q9a" },
    { label: "No, not yet", value: "no", next: "secondary_q10" },
    { label: "I'm preparing for one now", value: "preparing", next: "secondary_q10" },
  ]},
  secondary_q9a: { id: "secondary_q9a", phase: "Secondary", text: "Which test and score?", type: "text", key: "english_test_score", next: "secondary_q10" },
  secondary_q10: { id: "secondary_q10", phase: "Secondary", text: "Do you have any specific schools in mind already?", type: "select", key: "specific_schools_known", options: [
    { label: "Yes — I have names and reasons", value: "yes", next: "secondary_q10a" },
    { label: "I've heard of a few but haven't researched deeply", value: "heard", next: "secondary_q11" },
    { label: "No, I'm starting from scratch", value: "no", next: "secondary_q11" },
  ]},
  secondary_q10a: { id: "secondary_q10a", phase: "Secondary", text: "List the schools and why", type: "text", key: "schools_list", next: "secondary_q11" },
  secondary_q11: { id: "secondary_q11", phase: "Secondary", text: "What is your family's estimated annual budget for school fees + living costs?", type: "select", key: "annual_budget", options: [
    { label: "Under $20,000/year", value: "under_20k", next: "secondary_q12" },
    { label: "$20,000 – $40,000/year", value: "20_40k", next: "secondary_q12" },
    { label: "$40,000 – $60,000/year", value: "40_60k", next: "secondary_q12" },
    { label: "$60,000 – $80,000/year", value: "60_80k", next: "secondary_q12" },
    { label: "Above $80,000/year", value: "above_80k", next: "secondary_q12" },
    { label: "We need significant financial aid / scholarship to make this possible", value: "need_aid", next: "secondary_q12" },
  ]},
  secondary_q12: { id: "secondary_q12", phase: "Secondary", text: "Is financial aid or scholarship essential for this to happen?", type: "select", key: "financial_aid_essential", options: [
    { label: "Yes — we cannot go without substantial aid", value: "yes", next: "secondary_q13" },
    { label: "It would help a lot but we could manage without", value: "helpful", next: "secondary_q13" },
    { label: "No — budget is not the main constraint", value: "no", next: "secondary_q13" },
  ]},
  secondary_q13: { id: "secondary_q13", phase: "Secondary", text: "Are your parents fully supportive of you going abroad for high school?", type: "select", key: "parent_support", options: [
    { label: "Yes, fully — this is a family plan", value: "yes", next: "secondary_q14" },
    { label: "Mostly yes, but there are concerns", value: "mostly", next: "secondary_q14" },
    { label: "It's complicated — there's some resistance", value: "complicated", next: "secondary_q14" },
    { label: "I'm the one pushing for this more than my parents", value: "student_driven", next: "secondary_q14" },
  ]},
  secondary_q14: { id: "secondary_q14", phase: "Secondary", text: "What worries you most about going to high school abroad?", type: "select", key: "biggest_worry", options: [
    { label: "Being away from family and friends at a young age", value: "away_family", next: "secondary_q15" },
    { label: "Not being academically competitive enough to get in", value: "academics", next: "secondary_q15" },
    { label: "The cost — we might not be able to afford it", value: "cost", next: "secondary_q15" },
    { label: "Language and cultural adjustment", value: "language_culture", next: "secondary_q15" },
    { label: "Not knowing which school is right for me", value: "direction", next: "secondary_q15" },
    { label: "I'm not worried — I'm very ready for this", value: "not_worried", next: "secondary_q15" },
  ]},
  secondary_q15: { id: "secondary_q15", phase: "Secondary", text: "Is there anything else we should know?", type: "textarea", key: "other_notes", next: null },

  // TRACK 2: High School Student → University Abroad (Grade 10–12)
  hs_q1: { id: "hs_q1", phase: "HighSchool", text: "What grade are you currently in?", type: "select", key: "grade", options: [
    { label: "Grade 10", value: "10", next: "hs_q2" },
    { label: "Grade 11", value: "11", next: "hs_q2" },
    { label: "Grade 12 (applying this cycle)", value: "12", next: "hs_q2" },
  ]},
  hs_q2: { id: "hs_q2", phase: "HighSchool", text: "Which country and school system are you in?", type: "text", key: "country_system", next: "hs_q3" },
  hs_q3: { id: "hs_q3", phase: "HighSchool", text: "Are you currently doing any internationally recognized curriculum?", type: "select", key: "curriculum", options: [
    { label: "IB (International Baccalaureate)", value: "ib", next: "hs_q4" },
    { label: "A-Levels", value: "alevels", next: "hs_q4" },
    { label: "AP (Advanced Placement)", value: "ap", next: "hs_q4" },
    { label: "SAT/ACT preparation", value: "sat_act", next: "hs_q4" },
    { label: "National curriculum only (no international exams yet)", value: "national", next: "hs_q4" },
    { label: "Other", value: "other", next: "hs_q4" },
  ]},
  hs_q4: { id: "hs_q4", phase: "HighSchool", text: "What is your academic performance like?", type: "select", key: "academic_performance", options: [
    { label: "Excellent — consistently top of class, strong GPA / predicted grades", value: "excellent", next: "hs_q5" },
    { label: "Good — above average, solid results", value: "good", next: "hs_q5" },
    { label: "Average — middle of the pack", value: "average", next: "hs_q5" },
    { label: "Variable — strong in some subjects, weaker in others", value: "variable", next: "hs_q5" },
  ]},
  hs_q5: { id: "hs_q5", phase: "HighSchool", text: "What subjects are you strongest in?", type: "text", key: "strong_subjects", next: "hs_q6" },
  hs_q6: { id: "hs_q6", phase: "HighSchool", text: "What do you want to study at university?", type: "text", key: "target_subject", next: "hs_q7" },
  hs_q7: { id: "hs_q7", phase: "HighSchool", text: "Why that subject — what's driving this choice?", type: "text", key: "why_subject", next: "hs_q8" },
  hs_q8: { id: "hs_q8", phase: "HighSchool", text: "Where do you see yourself working after university?", type: "select", key: "post_uni_work", options: [
    { label: "In the country I study in — I want to build my life there", value: "study_country", next: "hs_q9" },
    { label: "Back home — the degree is for credibility and knowledge", value: "back_home", next: "hs_q9" },
    { label: "Anywhere — I want to stay flexible", value: "anywhere", next: "hs_q9" },
    { label: "I genuinely don't know yet", value: "dont_know", next: "hs_q9" },
  ]},
  hs_q9: { id: "hs_q9", phase: "HighSchool", text: "Which destination are you most drawn to?", type: "select", key: "destination", options: [
    { label: "United Kingdom", value: "uk", next: "hs_q10" },
    { label: "United States", value: "usa", next: "hs_q10" },
    { label: "Canada", value: "canada", next: "hs_q10" },
    { label: "Australia / New Zealand", value: "anz", next: "hs_q10" },
    { label: "Netherlands", value: "netherlands", next: "hs_q10" },
    { label: "Germany", value: "germany", next: "hs_q10" },
    { label: "Other European country", value: "other_eu", next: "hs_q10" },
    { label: "I'm open — recommend what fits", value: "open", next: "hs_q10" },
  ]},
  hs_q10: { id: "hs_q10", phase: "HighSchool", text: "What is your English proficiency right now?", type: "select", key: "english_level", options: [
    { label: "Native / fully fluent", value: "native", next: "hs_q11" },
    { label: "Strong — IELTS 7.0+ equivalent", value: "strong", next: "hs_q11" },
    { label: "Intermediate — around IELTS 6.0–6.5", value: "intermediate", next: "hs_q11" },
    { label: "Developing — below IELTS 6.0", value: "developing", next: "hs_q11" },
    { label: "Haven't tested yet", value: "untested", next: "hs_q11" },
  ]},
  hs_q11: { id: "hs_q11", phase: "HighSchool", text: "Do you have any extracurricular activities, awards, or standout achievements?", type: "text", key: "extracurriculars", next: "hs_q12" },
  hs_q12: { id: "hs_q12", phase: "HighSchool", text: "What is your family's total budget for the full degree (tuition + living, all years combined)?", type: "select", key: "total_budget", options: [
    { label: "Under $50,000 total", value: "under_50k", next: "hs_q13" },
    { label: "$50,000 – $100,000", value: "50_100k", next: "hs_q13" },
    { label: "$100,000 – $150,000", value: "100_150k", next: "hs_q13" },
    { label: "$150,000 – $200,000", value: "150_200k", next: "hs_q13" },
    { label: "Above $200,000", value: "above_200k", next: "hs_q13" },
    { label: "We need scholarships — budget alone won't cover it", value: "need_scholarships", next: "hs_q13" },
  ]},
  hs_q13: { id: "hs_q13", phase: "HighSchool", text: "How important is university ranking/prestige to you and your family?", type: "select", key: "ranking_importance", options: [
    { label: "Critical — we're aiming for top 50 globally", value: "critical", next: "hs_q14" },
    { label: "Important — we want a well-respected name", value: "important", next: "hs_q14" },
    { label: "Moderate — a good program matters more than ranking", value: "moderate", next: "hs_q14" },
    { label: "Not important — outcomes and cost matter more", value: "not_important", next: "hs_q14" },
  ]},
  hs_q14: { id: "hs_q14", phase: "HighSchool", text: "What's your single biggest concern about going to university abroad?", type: "select", key: "biggest_concern", options: [
    { label: "Getting into a competitive enough program", value: "getting_in", next: "hs_q15" },
    { label: "Affording it / scholarship availability", value: "affording", next: "hs_q15" },
    { label: "Choosing the wrong subject and regretting it", value: "choosing_subject", next: "hs_q15" },
    { label: "Not being socially ready / cultural adjustment", value: "social", next: "hs_q15" },
    { label: "My English not being strong enough", value: "english", next: "hs_q15" },
    { label: "My parents not fully supporting it", value: "parents", next: "hs_q15" },
    { label: "I'm not sure university abroad is really right for me", value: "unsure", next: "hs_q15" },
  ]},
  hs_q15: { id: "hs_q15", phase: "HighSchool", text: "Is there a person, career, or life you're working toward?", type: "text", key: "role_model", next: "hs_q16" },
  hs_q16: { id: "hs_q16", phase: "HighSchool", text: "Anything else important we should know?", type: "textarea", key: "other_notes", next: null },

  // TRACK 3: University Student → Master's / Postgrad Abroad
  uni_q1: { id: "uni_q1", phase: "University", text: "What year are you in, and what are you studying?", type: "text", key: "current_study", next: "uni_q2" },
  uni_q2: { id: "uni_q2", phase: "University", text: "What is your current GPA or academic result?", type: "text", key: "gpa", next: "uni_q3" },
  uni_q3: { id: "uni_q3", phase: "University", text: "What do you want to specialize in at master's level?", type: "text", key: "specialization", next: "uni_q4" },
  uni_q4: { id: "uni_q4", phase: "University", text: "Why this specialization — is this a genuine interest or a strategic choice?", type: "select", key: "specialization_reason", options: [
    { label: "Genuine passion — I've been building toward this", value: "passion", next: "uni_q5" },
    { label: "Strategic — it has the best career outcomes", value: "strategic", next: "uni_q5" },
    { label: "A mix of both", value: "mix", next: "uni_q5" },
    { label: "Honestly, I'm not fully sure yet", value: "unsure", next: "uni_q5" },
  ]},
  uni_q5: { id: "uni_q5", phase: "University", text: "What specific type of master's are you looking for?", type: "select", key: "masters_type", options: [
    { label: "Taught MSc / MA (coursework-based, 1–2 years)", value: "taught", next: "uni_q6" },
    { label: "Research-based master's (thesis, smaller cohort)", value: "research", next: "uni_q6" },
    { label: "MBA (management, usually needs work experience)", value: "mba", next: "uni_q6" },
    { label: "Conversion master's (switching into a new field)", value: "conversion", next: "uni_q6" },
    { label: "I'm not sure — help me figure out what's right", value: "unsure", next: "uni_q6" },
  ]},
  uni_q6: { id: "uni_q6", phase: "University", text: "Do you have work experience?", type: "select", key: "work_experience", options: [
    { label: "None yet — going straight from undergrad", value: "none", next: "uni_q7" },
    { label: "Less than 1 year (internships)", value: "lt1", next: "uni_q7" },
    { label: "1–2 years", value: "1_2", next: "uni_q7" },
    { label: "3–5 years", value: "3_5", next: "uni_q7" },
    { label: "5+ years", value: "5plus", next: "uni_q7" },
  ]},
  uni_q7: { id: "uni_q7", phase: "University", text: "What is your English level?", type: "select", key: "english_level", options: [
    { label: "Native / bilingual", value: "native", next: "uni_q8" },
    { label: "IELTS 7.0+ / TOEFL 100+ already achieved", value: "7plus", next: "uni_q8" },
    { label: "IELTS 6.5 level, haven't taken the test yet", value: "6_5", next: "uni_q8" },
    { label: "Below 6.5 — needs significant improvement", value: "below_6_5", next: "uni_q8" },
    { label: "Haven't assessed yet", value: "untested", next: "uni_q8" },
  ]},
  uni_q8: { id: "uni_q8", phase: "University", text: "What do you want to do after your master's?", type: "select", key: "post_masters_goal", options: [
    { label: "Work in the country I study in", value: "work_study_country", next: "uni_q9" },
    { label: "Return home with an internationally recognized qualification", value: "return_home", next: "uni_q9" },
    { label: "Work in a third country", value: "third_country", next: "uni_q9" },
    { label: "Go into research / pursue a PhD eventually", value: "research", next: "uni_q9" },
    { label: "Start a business", value: "entrepreneur", next: "uni_q9" },
    { label: "I don't know yet", value: "dont_know", next: "uni_q9" },
  ]},
  uni_q9: { id: "uni_q9", phase: "University", text: "Which destination are you considering?", type: "select", key: "destination", options: [
    { label: "UK", value: "uk", next: "uni_q10" },
    { label: "USA", value: "usa", next: "uni_q10" },
    { label: "Canada", value: "canada", next: "uni_q10" },
    { label: "Australia", value: "australia", next: "uni_q10" },
    { label: "Germany", value: "germany", next: "uni_q10" },
    { label: "Netherlands", value: "netherlands", next: "uni_q10" },
    { label: "France", value: "france", next: "uni_q10" },
    { label: "Other European country", value: "other_eu", next: "uni_q10" },
    { label: "Open — show me what fits", value: "open", next: "uni_q10" },
  ]},
  uni_q10: { id: "uni_q10", phase: "University", text: "What is your total budget for the master's (tuition + living)?", type: "select", key: "total_budget", options: [
    { label: "Under $20,000", value: "under_20k", next: "uni_q11" },
    { label: "$20,000 – $40,000", value: "20_40k", next: "uni_q11" },
    { label: "$40,000 – $60,000", value: "40_60k", next: "uni_q11" },
    { label: "$60,000 – $80,000", value: "60_80k", next: "uni_q11" },
    { label: "Above $80,000", value: "above_80k", next: "uni_q11" },
    { label: "Scholarships are essential — I can't go without funding", value: "need_scholarships", next: "uni_q11" },
  ]},
  uni_q11: { id: "uni_q11", phase: "University", text: "Have you researched any specific programs already?", type: "select", key: "researched_programs", options: [
    { label: "Yes — list them and what attracted you", value: "yes", next: "uni_q11a" },
    { label: "I've explored broadly but nothing specific", value: "explored", next: "uni_q12" },
    { label: "No — starting from scratch", value: "no", next: "uni_q12" },
  ]},
  uni_q11a: { id: "uni_q11a", phase: "University", text: "Which programs and why?", type: "text", key: "programs_list", next: "uni_q12" },
  uni_q12: { id: "uni_q12", phase: "University", text: "What is your most important selection criterion?", type: "select", key: "selection_criterion", options: [
    { label: "Reputation and ranking of the program", value: "ranking", next: "uni_q13" },
    { label: "Career placement and alumni network", value: "placement", next: "uni_q13" },
    { label: "Cost / scholarship availability", value: "cost", next: "uni_q13" },
    { label: "Location and ability to stay post-study", value: "location", next: "uni_q13" },
    { label: "Research quality and faculty", value: "research_quality", next: "uni_q13" },
    { label: "Class diversity and international exposure", value: "diversity", next: "uni_q13" },
  ]},
  uni_q13: { id: "uni_q13", phase: "University", text: "What worries you most?", type: "select", key: "most_worry", options: [
    { label: "My undergrad GPA not being competitive", value: "gpa", next: "uni_q14" },
    { label: "Not having enough work experience", value: "work_experience", next: "uni_q14" },
    { label: "Language requirements", value: "language", next: "uni_q14" },
    { label: "Funding / cost", value: "funding", next: "uni_q14" },
    { label: "Choosing the wrong specialization", value: "specialization", next: "uni_q14" },
    { label: "Not knowing if a master's is even the right move", value: "unsure", next: "uni_q14" },
  ]},
  uni_q14: { id: "uni_q14", phase: "University", text: "Is there a specific company, role, or person that represents where you want to end up?", type: "text", key: "role_model", next: "uni_q15" },
  uni_q15: { id: "uni_q15", phase: "University", text: "Anything else we should know?", type: "textarea", key: "other_notes", next: null },
};

// Build ordered list for progress tracking (derived from question tree)
const QUESTION_ORDER = Object.keys(Q);
const TOTAL_ESTIMATED = 18; // estimated typical path length (used for progress bar)

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
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
    return `TRACK 1 — Secondary School Adviser
${common}

SPECIFIC GUIDANCE FOR SECONDARY-TO-HIGH-SCHOOL PATHS:
- Focus on early profile-building: extracurricular depth, teacher relationships, and English readiness.
- Prioritize fit: boarding vs day school has major wellbeing implications; recommend schools that match the student's academic standing and budget.
- When naming schools, include concrete entry routes (scholarships, foundation years, interview/portfolio expectations).

CRITICAL: Always tie every school or pathway recommendation to the student's grade, academic standing, English level, parental support, and budget as given in the profile.
`;
  }

  if (track === "highschool") {
    return `TRACK 2 — High-School-to-University Adviser
${common}

SPECIFIC GUIDANCE FOR HIGH-SCHOOL-TO-UNIVERSITY PATHS:
- Prioritize test strategy (IB predicted grades / A-levels / SAT / AP / IELTS) and extracurricular narratives that support their course choice.
- Recommend a short list of target / reach / safety universities and specific programs, with clear rationales and requirement gaps.
- Include scholarship pathways and likely deadlines; estimate realistic timelines for test prep and application components (essays, recommendations, portfolios).

CRITICAL: Every recommendation must reference the student's curriculum, grades, extracurriculars, budget, and stated career goal.
`;
  }

  if (track === "university") {
    return `TRACK 3 — University-to-Masters Adviser
${common}

SPECIFIC GUIDANCE FOR UNIVERSITY-TO-MASTERS PATHS:
- Assess academic fit: match specialization to their GPA, research experience, and work experience.
- Recommend program types (taught, research, conversion, MBA) with concrete examples of institutions and scholarship schemes appropriate to their profile.
- Provide candid advice on timing: when to apply, whether to gain work experience first, and how to strengthen weak areas (language tests, research, internships).

CRITICAL: Always quantify gaps (e.g., "Your GPA 3.1 vs typical requirement 3.5") and recommend precise remediation steps.
`;
  }

  // Generic fallback
  return `PathwayAI — General Adviser\n${common}`;
}

function buildUserPrompt(profile) {
  const lines = Object.entries(profile)
    .filter(([, v]) => v && v.toString().trim())
    .map(([k, v]) => `${k}: ${v}`);
  return `Here is the student's full profile:\n\n${lines.join("\n")}\n\nGenerate their personalized study-abroad plan now.`;
}

// ── MARKDOWN RENDERER (simple) ────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{fontFamily:"'Playfair Display',serif",fontSize:"1.35rem",fontWeight:700,color:"#0f2027",marginTop:"2rem",marginBottom:"0.5rem",borderBottom:"2px solid #c8a96e",paddingBottom:"0.4rem"}}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:700,color:"#1a3a4a",marginTop:"1.5rem",marginBottom:"0.3rem"}}>{line.slice(4)}</h3>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} style={{fontWeight:700,color:"#1a3a4a",margin:"0.3rem 0"}}>{line.slice(2,-2)}</p>);
    } else if (/^\*\*[^*]+:\*\*/.test(line)) {
      const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)/);
      if (match) elements.push(<p key={i} style={{margin:"0.25rem 0"}}><strong style={{color:"#1a3a4a"}}>{match[1]}:</strong> {match[2]}</p>);
      else elements.push(<p key={i} style={{margin:"0.25rem 0"}}>{renderInline(line)}</p>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(<li key={i} style={{marginBottom:"0.3rem",lineHeight:1.6}}>{renderInline(line.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(<li key={i} style={{marginBottom:"0.4rem",lineHeight:1.6,listStyleType:"decimal"}}>{renderInline(line.replace(/^\d+\.\s/,""))}</li>);
    } else if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(<p key={i} style={{margin:"0.25rem 0",lineHeight:1.7}}>{renderInline(line)}</p>);
    }
    i++;
  }
  return elements;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{color:"#1a3a4a"}}>{part.slice(2,-2)}</strong>;
    }
    return part;
  });
}

// ── PHASE COLORS ───────────────────────────────────────────────────────────
const PHASE_META = {
  "About You": { color: "#4a7fa5", icon: "◎" },
  "Academic Profile": { color: "#5a8a6a", icon: "◈" },
  "What You Want": { color: "#8a5a9a", icon: "◇" },
  "Destination & Constraints": { color: "#9a6a3a", icon: "◆" },
  "Final Details": { color: "#7a3a4a", icon: "●" },
};

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | intake | generating | result
  const [currentQId, setCurrentQId] = useState("start");
  const [profile, setProfile] = useState({});
  const [answer, setAnswer] = useState("");
  const [answeredIds, setAnsweredIds] = useState([]);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");
  const resultRef = useRef(null);
  const inputRef = useRef(null);

  const currentQ = Q[currentQId];
  const phase = currentQ?.phase;
  const phaseMeta = PHASE_META[phase] || { color: "#4a7fa5", icon: "◎" };
  const progress = Math.min(100, Math.round((answeredIds.length / TOTAL_ESTIMATED) * 100));

  useEffect(() => {
    setAnswer("");
    if (inputRef.current) inputRef.current.focus();
  }, [currentQId]);

  useEffect(() => {
    if (screen === "result" && resultRef.current) {
      resultRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [screen]);

  function handleOption(opt) {
    const newProfile = { ...profile, [currentQ.key]: opt.value };
    setProfile(newProfile);
    setAnsweredIds(prev => [...prev, currentQId]);
    if (opt.next && Q[opt.next]) {
      setCurrentQId(opt.next);
    } else {
      startGeneration(newProfile);
    }
  }

  function handleTextNext() {
    if (!answer.trim()) return;
    const newProfile = { ...profile, [currentQ.key]: answer.trim() };
    setProfile(newProfile);
    setAnsweredIds(prev => [...prev, currentQId]);
    const next = currentQ.next;
    if (next && Q[next]) {
      setCurrentQId(next);
    } else {
      startGeneration(newProfile);
    }
  }

  async function startGeneration(finalProfile) {
    setScreen("generating");
    setStreamText("");
    setError("");
    try {
      const response = await fetch("http://localhost:3000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: finalProfile }),
      });

      // Read raw text body and handle both JSON and plain-text error responses
      const raw = await response.text();
      if (!response.ok) {
        let parsed;
        try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
        const msg = parsed?.error || parsed?.detail || raw || `API error: ${response.status}`;
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      let data;
      try { data = JSON.parse(raw); } catch (e) { data = { text: raw }; }
      const text = data.text || data.content?.[0]?.text || data.completion || "";
      setPlan(text);
      setScreen("result");
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
      setScreen("intake");
    }
  }

  // ── WELCOME ───────────────────────────────────────────────────────────────
  if (screen === "welcome") return (
    <div style={styles.root}>
      <div style={styles.welcomeWrap}>
        <div style={styles.logoMark}>P</div>
        <h1 style={styles.welcomeTitle}>PathwayAI</h1>
        <p style={styles.welcomeSub}>Your study-abroad plan. Built around you, not a template.</p>
        <div style={styles.welcomeCard}>
          <p style={styles.welcomeBody}>
            Answer <strong>15–20 questions</strong> about your academic background, career goals, and constraints.
            We'll produce a personalized, honest roadmap — specific programs, real cost estimates, and the trade-offs you need to make.
          </p>
          <p style={{...styles.welcomeBody, color:"#7a8a8a", fontSize:"0.85rem", marginTop:"1rem"}}>
            Two students with similar backgrounds will get different plans. That's the point.
          </p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setScreen("intake")}>
          Start my plan →
        </button>
      </div>
    </div>
  );

  // ── GENERATING ─────────────────────────────────────────────────────────────
  if (screen === "generating") return (
    <div style={styles.root}>
      <div style={styles.generatingWrap}>
        <div style={styles.spinnerOuter}>
          <div style={styles.spinnerInner} />
        </div>
        <h2 style={styles.generatingTitle}>Building your plan</h2>
        <p style={styles.generatingSub}>Analyzing your profile across {Object.keys(profile).length} dimensions...</p>
        <div style={styles.generatingSteps}>
          {["Profiling your academic background","Mapping career goal to programs","Calculating fit scores","Surfacing honest trade-offs","Writing your personalized plan"].map((s, i) => (
            <div key={i} style={{...styles.generatingStep, animationDelay: `${i * 0.7}s`}}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === "result") return (
    <div style={styles.root}>
      <div style={styles.resultWrap} ref={resultRef}>
        <div style={styles.resultHeader}>
          <div style={styles.logoMarkSmall}>P</div>
          <div>
            <h1 style={styles.resultTitle}>Your Study-Abroad Plan</h1>
            <p style={styles.resultSub}>Generated based on {Object.keys(profile).length} profile signals</p>
          </div>
          <button style={styles.restartBtn} onClick={() => { setScreen("welcome"); setProfile({}); setAnsweredIds([]); setCurrentQId("start"); setPlan(""); }}>
            Start over
          </button>
        </div>
        <div style={styles.planBody}>
          {renderMarkdown(plan)}
        </div>
        <div style={styles.disclaimer}>
          PathwayAI is an AI prototype. Verify all program details, deadlines, and requirements directly with institutions before applying.
        </div>
      </div>
    </div>
  );

  // ── INTAKE ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      <div style={styles.intakeWrap}>
        {/* Header */}
        <div style={styles.intakeHeader}>
          <span style={styles.logoMarkTiny}>P</span>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progress}%`}} />
          </div>
          <span style={styles.progressLabel}>{progress}%</span>
        </div>

        {/* Phase label */}
        <div style={{...styles.phaseTag, background: phaseMeta.color}}>
          {phaseMeta.icon} {phase}
        </div>

        {/* Question */}
        <div style={styles.questionCard}>
          <p style={styles.questionText}>{currentQ?.text}</p>
          {currentQ?.sub && <p style={styles.questionSub}>{currentQ.sub}</p>}

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* SELECT options */}
          {currentQ?.type === "select" && (
            <div style={styles.optionGrid}>
              {currentQ.options.map((opt, i) => (
                <button key={i} style={styles.optionBtn} onClick={() => handleOption(opt)}
                  onMouseEnter={e => { e.currentTarget.style.background = "#0f2027"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#0f2027"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = styles.optionBtn.background; e.currentTarget.style.color = styles.optionBtn.color; e.currentTarget.style.borderColor = "rgba(200,216,224,0.22)"; }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* TEXT input */}
          {currentQ?.type === "text" && (
            <div style={styles.textWrap}>
              <input ref={inputRef} style={styles.textInput} value={answer} placeholder="Type your answer..."
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleTextNext(); }} />
              <button style={{...styles.primaryBtn, marginTop:"1rem"}} onClick={handleTextNext} disabled={!answer.trim()}>
                Continue →
              </button>
            </div>
          )}

          {/* TEXTAREA */}
          {currentQ?.type === "textarea" && (
            <div style={styles.textWrap}>
              <textarea ref={inputRef} style={styles.textarea} value={answer}
                placeholder="Take your time — the more detail you give, the more specific your plan will be..."
                onChange={e => setAnswer(e.target.value)}
                rows={4} />
              <button style={{...styles.primaryBtn, marginTop:"1rem"}} onClick={handleTextNext} disabled={!answer.trim()}>
                Continue →
              </button>
            </div>
          )}
        </div>

        {/* Answered count */}
        <p style={styles.answerCount}>{answeredIds.length} questions answered so far</p>
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f1f2b 0%, #1a2f3f 50%, #0d1f2d 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'EB Garamond', 'Georgia', serif",
    padding: "1rem",
    boxSizing: "border-box",
  },

  // WELCOME
  welcomeWrap: {
    maxWidth: 520,
    width: "100%",
    textAlign: "center",
    animation: "fadeUp 0.6s ease both",
  },
  logoMark: {
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #c8a96e, #e8c98e)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", fontWeight: 700, color: "#0f2027",
    margin: "0 auto 1.5rem",
    fontFamily: "'Playfair Display', serif",
    boxShadow: "0 8px 32px rgba(200,169,110,0.3)",
  },
  welcomeTitle: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "3rem", fontWeight: 700, color: "#f0e8d8",
    margin: "0 0 0.5rem", letterSpacing: "-0.02em",
  },
  welcomeSub: {
    color: "#a0b4c0", fontSize: "1.05rem", margin: "0 0 2rem",
    fontStyle: "italic",
  },
  welcomeCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(200,169,110,0.2)",
    borderRadius: 12, padding: "1.5rem", marginBottom: "2rem",
    backdropFilter: "blur(10px)",
  },
  welcomeBody: {
    color: "#c8d8e0", lineHeight: 1.7, margin: "0 0 0.5rem",
    fontSize: "0.95rem",
  },

  // INTAKE
  intakeWrap: {
    maxWidth: 600, width: "100%",
    animation: "fadeUp 0.4s ease both",
  },
  intakeHeader: {
    display: "flex", alignItems: "center", gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  logoMarkTiny: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #c8a96e, #e8c98e)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1rem", fontWeight: 700, color: "#0f2027",
    fontFamily: "'Playfair Display', serif",
    flexShrink: 0,
  },
  progressBar: {
    flex: 1, height: 4, background: "rgba(255,255,255,0.1)",
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #c8a96e, #e8c98e)",
    borderRadius: 2,
    transition: "width 0.5s ease",
  },
  progressLabel: {
    color: "#a0b4c0", fontSize: "0.8rem", flexShrink: 0,
  },
  phaseTag: {
    display: "inline-block",
    color: "#fff", fontSize: "0.75rem", fontWeight: 600,
    padding: "0.25rem 0.75rem", borderRadius: 20,
    marginBottom: "1rem", letterSpacing: "0.05em",
    textTransform: "uppercase", fontFamily: "Georgia, serif",
  },
  questionCard: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16, padding: "2rem",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  questionText: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    fontSize: "1.4rem", fontWeight: 700, color: "#f0e8d8",
    margin: "0 0 0.75rem", lineHeight: 1.4,
  },
  questionSub: {
    color: "#8aa0b0", fontSize: "0.88rem", margin: "0 0 1.5rem",
    lineHeight: 1.6, fontStyle: "italic",
  },
  optionGrid: {
    display: "flex", flexDirection: "column", gap: "0.6rem",
  },
  optionBtn: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(200,216,224,0.22)",
    borderRadius: 8, padding: "0.85rem 1.2rem",
    color: "#ffffff", fontSize: "0.98rem",
    cursor: "pointer", textAlign: "left",
    fontFamily: "'EB Garamond', Georgia, serif",
    transition: "all 0.18s ease",
    lineHeight: 1.4,
  },
  textWrap: { display: "flex", flexDirection: "column" },
  textInput: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8, padding: "0.9rem 1rem",
    color: "#f0e8d8", fontSize: "1rem",
    fontFamily: "'EB Garamond', Georgia, serif",
    outline: "none",
  },
  textarea: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8, padding: "0.9rem 1rem",
    color: "#f0e8d8", fontSize: "1rem",
    fontFamily: "'EB Garamond', Georgia, serif",
    outline: "none", resize: "vertical", lineHeight: 1.6,
  },
  answerCount: {
    textAlign: "center", color: "#5a7a8a", fontSize: "0.78rem",
    marginTop: "1.25rem",
  },

  // SHARED BUTTON
  primaryBtn: {
    background: "linear-gradient(135deg, #c8a96e, #dbbf7e)",
    border: "none", borderRadius: 8,
    padding: "0.85rem 2rem",
    color: "#0f2027", fontSize: "1rem", fontWeight: 700,
    cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.02em",
    transition: "opacity 0.2s",
    alignSelf: "flex-start",
  },

  // GENERATING
  generatingWrap: {
    textAlign: "center", maxWidth: 420,
  },
  spinnerOuter: {
    width: 72, height: 72, borderRadius: "50%",
    border: "3px solid rgba(200,169,110,0.2)",
    borderTopColor: "#c8a96e",
    margin: "0 auto 2rem",
    animation: "spin 1.2s linear infinite",
  },
  spinnerInner: {
    width: 48, height: 48, borderRadius: "50%",
    border: "2px solid rgba(200,169,110,0.1)",
    borderBottomColor: "#c8a96e",
    margin: "9px auto",
    animation: "spinRev 0.8s linear infinite",
  },
  generatingTitle: {
    fontFamily: "'Playfair Display', serif",
    color: "#f0e8d8", fontSize: "1.8rem", margin: "0 0 0.5rem",
  },
  generatingSub: {
    color: "#7a9aaa", fontSize: "0.9rem", margin: "0 0 2rem",
  },
  generatingSteps: {
    display: "flex", flexDirection: "column", gap: "0.5rem",
  },
  generatingStep: {
    color: "#5a7a8a", fontSize: "0.83rem",
    animation: "fadeIn 0.5s ease both",
    fontStyle: "italic",
  },

  // RESULT
  resultWrap: {
    maxWidth: 720, width: "100%",
    maxHeight: "92vh", overflowY: "auto",
    background: "#f8f4ee",
    borderRadius: 16, padding: "0",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
  },
  resultHeader: {
    display: "flex", alignItems: "center", gap: "1rem",
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e0d8cc",
    background: "#fff",
    borderRadius: "16px 16px 0 0",
    position: "sticky", top: 0, zIndex: 10,
  },
  logoMarkSmall: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg, #c8a96e, #dbbf7e)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.1rem", fontWeight: 700, color: "#0f2027",
    fontFamily: "'Playfair Display', serif", flexShrink: 0,
  },
  resultTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.2rem", fontWeight: 700, color: "#0f2027",
    margin: 0, flex: 1,
  },
  resultSub: {
    color: "#7a8a8a", fontSize: "0.78rem", margin: "0.1rem 0 0",
  },
  restartBtn: {
    background: "transparent", border: "1px solid #c8d0d0",
    borderRadius: 6, padding: "0.4rem 0.9rem",
    color: "#5a7a8a", fontSize: "0.82rem", cursor: "pointer",
    fontFamily: "Georgia, serif",
  },
  planBody: {
    padding: "2rem 2.5rem",
    color: "#1a2a2a",
    lineHeight: 1.75,
    fontSize: "0.97rem",
  },
  disclaimer: {
    padding: "1rem 2.5rem 2rem",
    color: "#9aaa9a", fontSize: "0.75rem",
    borderTop: "1px solid #e8e0d4", fontStyle: "italic",
  },
  errorBox: {
    background: "#fee2e2", border: "1px solid #fca5a5",
    borderRadius: 8, padding: "0.75rem 1rem",
    color: "#991b1b", fontSize: "0.88rem", marginBottom: "1rem",
  },
};

// Inject keyframes
const styleTag = document.createElement("style");
styleTag.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:0.8; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes spinRev { to { transform: rotate(-360deg); } }
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.3); border-radius: 3px; }
  input::placeholder, textarea::placeholder { color: #4a6a7a; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
`;
document.head.appendChild(styleTag);
