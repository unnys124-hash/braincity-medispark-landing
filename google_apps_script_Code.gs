var SHEET_NAME = "braincity_leads";
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
var DEFAULT_DEVELOPER = "노윤숙";
var DEFAULT_LANDING_NAME = "브레인시티 메디스파크 로제비앙 모아엘가";

function doGet() {
  return jsonOutput_({
    ok: true,
    message: "braincity lead api is running"
  });
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var sheet = getSheet_();
    sheet.appendRow(buildRowData_(payload));

    return jsonOutput_({
      ok: true,
      message: "saved",
      row: sheet.getLastRow()
    });
  } catch (error) {
    return jsonOutput_({
      ok: false,
      message: error.message || "unknown error"
    });
  }
}

function parsePayload_(e) {
  if (!e) {
    throw new Error("request is empty");
  }

  var payload = {};

  if (e.postData && e.postData.contents) {
    var contentType = String(e.postData.type || "");
    if (contentType.indexOf("application/json") > -1) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }
  } else if (e.parameter) {
    payload = e.parameter;
  } else {
    throw new Error("request body is empty");
  }

  payload.name = safeTrim_(payload.name);
  payload.phone = digitsOnly_(payload.phone);
  payload.developer = safeTrim_(payload.developer) || DEFAULT_DEVELOPER;
  payload.landing_name = safeTrim_(payload.landing_name) || DEFAULT_LANDING_NAME;
  payload.cta_position = safeTrim_(payload.cta_position);
  payload.interest_type = safeTrim_(payload.interest_type);
  payload.purpose = safeTrim_(payload.purpose);
  payload.page_url = safeTrim_(payload.page_url);
  payload.referrer = safeTrim_(payload.referrer);
  payload.device = safeTrim_(payload.device);
  payload.utm_source = safeTrim_(payload.utm_source);
  payload.utm_medium = safeTrim_(payload.utm_medium);
  payload.utm_campaign = safeTrim_(payload.utm_campaign);
  payload.utm_content = safeTrim_(payload.utm_content);
  payload.created_at = safeTrim_(payload.created_at);
  payload.call_requested = safeTrim_(payload.call_requested) || "Y";

  if (!payload.name || !payload.phone) {
    throw new Error("name and phone are required");
  }

  if (payload.phone.length < 10) {
    throw new Error("phone is invalid");
  }

  return payload;
}

function buildRowData_(payload) {
  var receivedAt = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

  return [
    receivedAt,
    payload.name,
    payload.phone,
    payload.developer,
    payload.landing_name,
    payload.cta_position,
    payload.interest_type,
    payload.purpose,
    payload.page_url,
    payload.referrer,
    payload.device,
    payload.utm_source,
    payload.utm_medium,
    payload.utm_campaign,
    payload.utm_content,
    payload.call_requested
  ];
}

function getSheet_() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    setHeader_(sheet);
  }

  if (sheet.getLastRow() === 0) {
    setHeader_(sheet);
  }

  return sheet;
}

function setHeader_(sheet) {
  sheet.getRange(1, 1, 1, 16).setValues([[
    "접수일시",
    "이름",
    "연락처",
    "개발자정보",
    "랜딩페이지명",
    "상담버튼위치",
    "관심타입",
    "상담목적",
    "유입URL",
    "Referrer",
    "Device",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "UTM Content",
    "전화연결여부"
  ]]);
}

function safeTrim_(value) {
  return String(value == null ? "" : value).trim();
}

function digitsOnly_(value) {
  return String(value == null ? "" : value).replace(/\D/g, "");
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
