import { sheets } from "../src/lib/googleSheets.js";

function getFormattedTimestamp(date = new Date()) {
  const parts = {};
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka",
  }).formatToParts(date).forEach(({ type, value }) => {
    parts[type] = value;
  });

  return `${parts.year}-${parts.month}-${parts.day}, ${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const {
      userId,
      sessionId,
      sender,
      message,
      pageUrl,
      screenSize,
      language
    } = body;

    // Capture location details provided by Vercel Edge Network
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "Unknown";
    const country = req.headers["x-vercel-ip-country"] || "Unknown";
    const region = req.headers["x-vercel-ip-country-region"] || "Unknown";
    const city = req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : "Unknown";

    const rawUserAgent = req.headers["user-agent"] || "Unknown";

    // Parse OS
    let os = "Unknown";
    if (rawUserAgent.includes("Windows NT")) os = "Windows";
    else if (rawUserAgent.includes("Macintosh") || rawUserAgent.includes("Mac OS X")) os = "macOS";
    else if (rawUserAgent.includes("Android")) os = "Android";
    else if (rawUserAgent.includes("iPhone") || rawUserAgent.includes("iPad") || rawUserAgent.includes("iPod")) os = "iOS";
    else if (rawUserAgent.includes("Linux")) os = "Linux";

    // Parse Browser
    let browser = "Unknown";
    if (rawUserAgent.includes("Edg/")) browser = "Edge";
    else if (rawUserAgent.includes("Chrome/") && rawUserAgent.includes("Safari/")) browser = "Chrome";
    else if (rawUserAgent.includes("Safari/") && !rawUserAgent.includes("Chrome/")) browser = "Safari";
    else if (rawUserAgent.includes("Firefox/")) browser = "Firefox";
    else if (rawUserAgent.includes("MSIE") || rawUserAgent.includes("Trident/")) browser = "IE";

    // Parse Device Type
    let deviceType = "Desktop";
    if (/Mobi|Android|iPhone|iPod/i.test(rawUserAgent)) {
      deviceType = "Mobile";
    } else if (/Tablet|iPad|PlayBook|Silk/i.test(rawUserAgent)) {
      deviceType = "Tablet";
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const tabName = "User Chatting";

    // Programmatically check if the tab exists, and create it + headers if missing
    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
      const sheetsList = spreadsheet.data.sheets || [];
      const hasTab = sheetsList.some(s => s.properties.title === tabName);

      if (!hasTab) {
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: tabName,
                    },
                  },
                },
              ],
            },
          });

          // Initialize header row
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${tabName}!A1:L1`,
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[
                "Timestamp",
                "Session ID",
                "User ID",
                "Sender",
                "Message",
                "Client IP",
                "Country",
                "Region",
                "City",
                "Browser",
                "OS",
                "Device Type"
              ]],
            },
          });
        } catch (createErr) {
          // If another concurrent request created the sheet in the meantime, ignore the error
          if (!createErr.message?.includes("already exists")) {
            throw createErr;
          }
        }
      }
    } catch (metaErr) {
      console.error("[chat-tracker] Google Sheets metadata check or sheet tab auto-creation failed:", metaErr);
    }

    // Append event entry to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A:L`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          getFormattedTimestamp(),
          sessionId,
          userId,
          sender,
          message,
          ip,
          country,
          region,
          city,
          browser,
          os,
          deviceType
        ]],
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[chat-tracker] Handler encountered error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
