const { getLcQuestions: getFallbackLcQuestions, getAllLcQuestionFields: getAllFallbackLcFields } = require("./lcQuestions");
const { fetchQuestionsFromSheet } = require("./sheets");

const LC_OPTIONS = ["ADMU", "CSB", "DLSU", "MC", "UPC", "UPD", "UPLB", "UPM", "UST", "Other"];
const ROLE_OPTIONS = ["Member", "TL", "EB", "LCP"];
const PROGRAM_OPTIONS = [
  "Business / Management",
  "Engineering",
  "Computer Science / IT",
  "Communication / Media",
  "Social Sciences",
  "Humanities / Arts",
  "Natural Sciences",
  "Health Sciences",
  "Education",
  "Law / Public Policy",
  "Other"
];
const JOIN_YEAR_OPTIONS = ["Before 2021", "2021", "2022", "2023", "2024", "2025", "2026"];
const DISCOVERY_OPTIONS = [
  "Friends / Family",
  "University Booth or Stall",
  "University Board",
  "Social Media",
  "Other"
];
const MOTIVATION_OPTIONS = ["Impact", "Community", "Personal Growth and Development", "Other"];
const EXCHANGE_PROGRAM_OPTIONS = ["GV", "GTa", "GTe"];

function fallbackBaseQuestions() {
  return [
    {
      category: "base",
      order: 1,
      field: "full_name",
      type: "text",
      prompt: "Let's start with the basics first ✨ What full name (Last Name, First Name) should we record for your response?"
    },
    {
      category: "base",
      order: 2,
      field: "lc",
      type: "choice",
      options: LC_OPTIONS,
      prompt: "Before we dive in, which LC should I tag your response under? 💙",
      allowOther: true,
      detailField: "lc_other",
      selectionField: "lc_selection",
      otherPrompt: "Got you! Which LC should I record for you? 😊"
    },
    {
      category: "base",
      order: 3,
      field: "role",
      type: "choice",
      options: ROLE_OPTIONS,
      prompt: "Which role best fits you right now? 🌟",
      allowOther: false
    },
    {
      category: "base",
      order: 4,
      field: "program_area_of_study",
      type: "choice",
      options: PROGRAM_OPTIONS,
      prompt: "What university program or area of study are you in? 🎓",
      allowOther: true,
      detailField: "program_area_of_study_other",
      selectionField: "program_area_of_study_selection",
      otherPrompt: "What program or area of study should I write down for you? ✍️"
    },
    {
      category: "base",
      order: 5,
      field: "graduation_year",
      type: "year",
      prompt: "What year are you graduating? 🎉"
    },
    {
      category: "base",
      order: 6,
      field: "joined_aiesec",
      type: "choice",
      options: JOIN_YEAR_OPTIONS,
      prompt: "When did you join AIESEC? 👀"
    },
    {
      category: "base",
      order: 7,
      field: "found_out_about_aiesec",
      type: "choice",
      options: DISCOVERY_OPTIONS,
      prompt: "How did you first hear about AIESEC? 👂",
      allowOther: true,
      detailField: "found_out_about_aiesec_other",
      selectionField: "found_out_about_aiesec_selection",
      otherPrompt: "Tell me how you first heard about AIESEC 😊"
    },
    {
      category: "base",
      order: 8,
      field: "why_joined_aiesec",
      type: "choice",
      options: MOTIVATION_OPTIONS,
      prompt: "What mainly made you join AIESEC in the first place? 💭",
      allowOther: true,
      detailField: "why_joined_aiesec_other",
      selectionField: "why_joined_aiesec_selection",
      otherPrompt: "What made you decide to join AIESEC? 💙"
    },
    {
      category: "base",
      order: 9,
      field: "why_stayed_in_aiesec",
      type: "choice",
      options: MOTIVATION_OPTIONS,
      prompt: "And what has made you stay in AIESEC so far? 🌱",
      allowOther: true,
      detailField: "why_stayed_in_aiesec_other",
      selectionField: "why_stayed_in_aiesec_selection",
      otherPrompt: "What has made you stay in AIESEC so far? 😊"
    },
    {
      category: "base",
      order: 10,
      field: "local_community_relevance",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how relevant do you think AIESEC is to your local community? 🌍"
    },
    {
      category: "base",
      order: 11,
      field: "recommend_aiesec_score",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how likely are you to recommend AIESEC as a leadership development organisation? 💬"
    },
    {
      category: "base",
      order: 12,
      field: "recommend_aiesec_reason",
      type: "text",
      prompt: "Could you share a bit more about why you gave that score? ✨"
    },
    {
      category: "base",
      order: 13,
      field: "connected_to_exchange_mission_score",
      type: "scale_1_10",
      prompt: "On a scale of 1 to 10, how connected do you feel to AIESEC's exchange mission, and how likely do you feel you are to go on exchange? ✈️"
    },
    {
      category: "base",
      order: 14,
      field: "preferred_exchange_program",
      type: "choice",
      options: EXCHANGE_PROGRAM_OPTIONS,
      prompt: "If you were to go on exchange, which program feels most appealing to you? 🌏"
    }
  ];
}

function fallbackLeaderQuestions(role) {
  if (role === "Member") {
    return [
      {
        category: "leader_Member",
        order: 1,
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your direct Team Leader, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_Member",
        order: 2,
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "TL") {
    return [
      {
        category: "leader_TL",
        order: 1,
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your LCVP, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_TL",
        order: 2,
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "EB") {
    return [
      {
        category: "leader_EB",
        order: 1,
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your LCP, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_EB",
        order: 2,
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your direct leader doing well, and what could they improve on? 💬"
      },
      {
        category: "leader_EB",
        order: 3,
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your commission head? 🌟\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_EB",
        order: 4,
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your MCVP doing well, and what could they improve on? 💬"
      }
    ];
  }

  if (role === "LCP") {
    return [
      {
        category: "leader_LCP",
        order: 1,
        field: "leader_satisfaction_primary",
        type: "satisfaction_1_5",
        prompt: "Thinking about your MC Coach, how satisfied are you overall? 😊\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_LCP",
        order: 2,
        field: "leader_feedback_primary",
        type: "text",
        prompt: "What is your coach doing well, and what could they improve on? 💬"
      },
      {
        category: "leader_LCP",
        order: 3,
        field: "leader_satisfaction_secondary",
        type: "satisfaction_1_5",
        prompt: "How satisfied are you with your commission head? 🌟\n\nScale: 1 = Not satisfied, 3 = Fair, 5 = Very satisfied"
      },
      {
        category: "leader_LCP",
        order: 4,
        field: "leader_feedback_secondary",
        type: "text",
        prompt: "What is your MCP doing well, and what could they improve on? 💬"
      }
    ];
  }

  return [];
}

function fallbackClosingQuestions() {
  return [
    {
      category: "closing",
      order: 1,
      field: "national_initiatives_incentives",
      type: "text",
      prompt: "What would make you more excited or willing to take part in national initiatives? ✨"
    },
    {
      category: "closing",
      order: 2,
      field: "icomm_campaign_feedback",
      type: "text",
      prompt: "What kinds of internal communications or campaigns would make you feel more seen, recognised, or included? 💌"
    },
    {
      category: "closing",
      order: 3,
      field: "experience_improvement_suggestions",
      type: "text",
      prompt: "Any suggestions or feedback you'd like to share to help improve the member experience? 🌱"
    },
    {
      category: "closing",
      order: 4,
      field: "final_message",
      type: "text",
      prompt: "Last one, promise 🤍 Is there anything else you'd like us to know before we wrap up?"
    }
  ];
}

// In-memory cache for questions loaded from Google Sheets
let cachedQuestionsByCategory = null;
let allCachedQuestions = [];

function organizeQuestionsByCategory(questionsList) {
  const byCategory = {};

  questionsList.forEach((q) => {
    const cat = q.category || "base";
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push({
      allowOther: false,
      prompt: "",
      ...q
    });
  });

  Object.keys(byCategory).forEach((cat) => {
    byCategory[cat].sort((a, b) => (a.order || 999) - (b.order || 999));
  });

  return byCategory;
}

async function loadQuestionsFromSheet() {
  try {
    const questionsFromSheet = await fetchQuestionsFromSheet();

    if (questionsFromSheet && questionsFromSheet.length > 0) {
      allCachedQuestions = questionsFromSheet;
      cachedQuestionsByCategory = organizeQuestionsByCategory(questionsFromSheet);
      console.log(`✅ Loaded ${questionsFromSheet.length} survey questions from Google Sheets.`);
      return { success: true, count: questionsFromSheet.length };
    }

    console.warn("⚠️ Google Sheets returned 0 questions. Using fallback definitions.");
  } catch (error) {
    console.error("⚠️ Failed to load questions from Google Sheets:", error?.message || error);
  }

  // Use fallback if cache is still empty
  if (!cachedQuestionsByCategory) {
    const allFallbacks = [
      ...fallbackBaseQuestions(),
      ...fallbackLeaderQuestions("Member"),
      ...fallbackLeaderQuestions("TL"),
      ...fallbackLeaderQuestions("EB"),
      ...fallbackLeaderQuestions("LCP"),
      ...fallbackClosingQuestions()
    ];
    allCachedQuestions = allFallbacks;
    cachedQuestionsByCategory = organizeQuestionsByCategory(allFallbacks);
  }

  return { success: false, count: allCachedQuestions.length };
}

function getCategoryQuestions(category) {
  if (!cachedQuestionsByCategory) {
    return [];
  }
  return cachedQuestionsByCategory[category] || [];
}

function buildSurveyFlow(context = {}) {
  // If questions are not yet cached from Google Sheets, use fallback
  if (!cachedQuestionsByCategory) {
    const lcQuestions = getFallbackLcQuestions(context.lc);
    const lcIntro =
      lcQuestions.length > 0
        ? [
            {
              type: "message",
              prompt:
                "Thank you so much for answering the national questions so far 💙\n\nNow, here are a few questions from your LC so we can understand your local experience better too 😊"
            }
          ]
        : [];

    return [
      ...fallbackBaseQuestions(),
      ...fallbackLeaderQuestions(context.role),
      ...lcIntro,
      ...lcQuestions,
      ...fallbackClosingQuestions()
    ].map((question) => ({
      allowOther: false,
      prompt: "",
      ...question
    }));
  }

  const base = getCategoryQuestions("base");
  const roleQuestions = context.role ? getCategoryQuestions(`leader_${context.role}`) : [];

  let lcQuestions = [];
  if (context.lc) {
    lcQuestions = getCategoryQuestions(`lc_${context.lc}`);
    if (lcQuestions.length === 0 && context.lc === "Other") {
      lcQuestions = getCategoryQuestions("lc_Other");
    }
  }

  const lcIntro =
    lcQuestions.length > 0 && lcQuestions[0].type !== "message"
      ? [
          {
            type: "message",
            prompt:
              "Thank you so much for answering the national questions so far 💙\n\nNow, here are a few questions from your LC so we can understand your local experience better too 😊"
          }
        ]
      : [];

  const closing = getCategoryQuestions("closing");

  return [...base, ...roleQuestions, ...lcIntro, ...lcQuestions, ...closing].map((question) => ({
    allowOther: false,
    prompt: "",
    ...question
  }));
}

function buildKeyboardRows(options, rowSize) {
  const rows = [];

  for (let index = 0; index < options.length; index += rowSize) {
    rows.push(options.slice(index, index + rowSize));
  }

  return rows;
}

function getChoiceKeyboard(options) {
  return buildKeyboardRows(options, 2);
}

function getScaleKeyboard() {
  return [["1", "2", "3", "4", "5"], ["6", "7", "8", "9", "10"]];
}

function getSatisfactionKeyboard() {
  return [["1", "2", "3", "4", "5"]];
}

function getAllQuestionFields() {
  const fields = new Set();

  if (allCachedQuestions && allCachedQuestions.length > 0) {
    allCachedQuestions.forEach((question) => {
      if (question.field) {
        fields.add(question.field);
      }
      if (question.selectionField) {
        fields.add(question.selectionField);
      }
      if (question.detailField) {
        fields.add(question.detailField);
      }
    });
  } else {
    const flows = [
      buildSurveyFlow(),
      buildSurveyFlow({ role: "EB" }),
      buildSurveyFlow({ role: "LCP" }),
      buildSurveyFlow({ role: "Member" }),
      buildSurveyFlow({ role: "TL" })
    ];

    flows.forEach((flow) => {
      flow.forEach((question) => {
        if (question.field) {
          fields.add(question.field);
        }
        if (question.selectionField) {
          fields.add(question.selectionField);
        }
        if (question.detailField) {
          fields.add(question.detailField);
        }
      });
    });

    getAllFallbackLcFields().forEach((field) => fields.add(field));
  }

  return Array.from(fields);
}

module.exports = {
  loadQuestionsFromSheet,
  buildSurveyFlow,
  getChoiceKeyboard,
  getScaleKeyboard,
  getSatisfactionKeyboard,
  getAllQuestionFields
};

