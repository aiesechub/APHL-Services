const { google } = require("googleapis");

const RESPONSES_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "NAMS Responses";
const QUESTIONS_SHEET_NAME = process.env.GOOGLE_QUESTIONS_SHEET_NAME || "Survey Questions";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createAuthClient() {
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
}

async function getSheetsApi() {
  const auth = createAuthClient();
  await auth.authorize();

  return google.sheets({
    version: "v4",
    auth
  });
}

async function ensureSheetTab(sheets, spreadsheetId, sheetName = RESPONSES_SHEET_NAME) {
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${sheetName}'!1:1`
    });
  } catch (error) {
    const isMissingSheet = error?.code === 400 || error?.status === 400;

    if (!isMissingSheet) {
      throw error;
    }

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }
        ]
      }
    });
  }
}

function getHeaderRow(additionalQuestionFields = []) {
  return [
    "submitted_at",
    "started_at",
    "reference_code",
    "telegram_user_id",
    "telegram_username",
    "telegram_first_name",
    "telegram_last_name",
    ...additionalQuestionFields
  ];
}

async function ensureHeaderRow(sheets, spreadsheetId, headers) {
  await ensureSheetTab(sheets, spreadsheetId, RESPONSES_SHEET_NAME);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${RESPONSES_SHEET_NAME}'!1:1`
  });

  const existingHeaders = response.data.values?.[0] || [];

  if (existingHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${RESPONSES_SHEET_NAME}'!1:1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headers]
      }
    });

    return headers;
  }

  return existingHeaders;
}

function buildRow(headers, payload) {
  return headers.map((header) => {
    const value = payload[header];

    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  });
}

async function appendSurveyResponse(payload, questionFields = []) {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = await getSheetsApi();
  const headers = getHeaderRow(questionFields);
  const activeHeaders = await ensureHeaderRow(sheets, spreadsheetId, headers);
  const row = buildRow(activeHeaders, payload);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${RESPONSES_SHEET_NAME}'!A:A`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [row]
    }
  });
}

async function fetchQuestionsFromSheet() {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEET_ID");
  const sheets = await getSheetsApi();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${QUESTIONS_SHEET_NAME}'!A:I`
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) {
    return [];
  }

  const rawHeaders = rows[0].map((h) => String(h || "").trim().toLowerCase());
  const categoryIndex = rawHeaders.indexOf("category");
  const orderIndex = rawHeaders.indexOf("order");
  const fieldIndex = rawHeaders.indexOf("field");
  const typeIndex = rawHeaders.indexOf("type");
  const promptIndex = rawHeaders.indexOf("prompt");
  const optionsIndex = rawHeaders.indexOf("options");
  const allowOtherIndex = rawHeaders.indexOf("allow_other");
  const otherPromptIndex = rawHeaders.indexOf("other_prompt");
  const activeIndex = rawHeaders.indexOf("active");

  const parsedQuestions = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const category = String(row[categoryIndex !== -1 ? categoryIndex : 0] || "").trim();
    const orderRaw = row[orderIndex !== -1 ? orderIndex : 1];
    const order = Number.isNaN(Number(orderRaw)) ? 999 : Number(orderRaw);
    const field = String(row[fieldIndex !== -1 ? fieldIndex : 2] || "").trim();
    const type = String(row[typeIndex !== -1 ? typeIndex : 3] || "text").trim();
    const prompt = String(row[promptIndex !== -1 ? promptIndex : 4] || "")
      .replace(/\\n/g, "\n")
      .trim();
    const optionsRaw = String(row[optionsIndex !== -1 ? optionsIndex : 5] || "").trim();
    const allowOtherRaw = String(row[allowOtherIndex !== -1 ? allowOtherIndex : 6] || "").trim().toUpperCase();
    const otherPrompt = String(row[otherPromptIndex !== -1 ? otherPromptIndex : 7] || "")
      .replace(/\\n/g, "\n")
      .trim();
    const activeRaw = String(row[activeIndex !== -1 ? activeIndex : 8] || "TRUE").trim().toUpperCase();

    const active = activeRaw !== "FALSE" && activeRaw !== "0";
    if (!active || !category || !prompt) {
      continue;
    }

    const question = {
      category,
      order,
      field,
      type,
      prompt,
      allowOther: allowOtherRaw === "TRUE" || allowOtherRaw === "1"
    };

    if (optionsRaw) {
      question.options = optionsRaw
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
    }

    if (question.type === "choice" && question.allowOther) {
      question.detailField = `${field}_other`;
      question.selectionField = `${field}_selection`;
      question.otherPrompt = otherPrompt || "What should I record instead? 😊";
    }

    if (question.type === "multi_choice") {
      question.doneLabel = "Done";
      if (question.options) {
        question.noneExclusiveOption =
          question.options.find((opt) => opt.toLowerCase().includes("none")) || "None of the above";
      }
    }

    parsedQuestions.push(question);
  }

  return parsedQuestions;
}

module.exports = {
  appendSurveyResponse,
  fetchQuestionsFromSheet
};

