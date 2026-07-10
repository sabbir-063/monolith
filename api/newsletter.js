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
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed",
        });
    }

    try {
        const { email } = req.body;

        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                String(email).trim()
            )
        ) {
            return res.status(400).json({
                error: "Invalid email",
            });
        }

        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress ||
            "Unknown";

        const country =
            req.headers["x-vercel-ip-country"] ||
            "Unknown";

        const rawUserAgent =
            req.headers["user-agent"] ||
            "Unknown";

        // Parse user agent to extract browser and OS
        let os = "Unknown";
        if (rawUserAgent.includes("Windows NT")) {
            os = "Windows";
        } else if (rawUserAgent.includes("Macintosh") || rawUserAgent.includes("Mac OS X")) {
            os = "macOS";
        } else if (rawUserAgent.includes("Android")) {
            os = "Android";
        } else if (rawUserAgent.includes("iPhone") || rawUserAgent.includes("iPad") || rawUserAgent.includes("iPod")) {
            os = "iOS";
        } else if (rawUserAgent.includes("Linux")) {
            os = "Linux";
        }

        let browser = "Unknown";
        if (rawUserAgent.includes("Edg/")) {
            browser = "Edge";
        } else if (rawUserAgent.includes("Chrome/") && rawUserAgent.includes("Safari/")) {
            browser = "Chrome";
        } else if (rawUserAgent.includes("Safari/") && !rawUserAgent.includes("Chrome/")) {
            browser = "Safari";
        } else if (rawUserAgent.includes("Firefox/")) {
            browser = "Firefox";
        } else if (rawUserAgent.includes("MSIE") || rawUserAgent.includes("Trident/")) {
            browser = "IE";
        }

        const formattedUserAgent = (browser === "Unknown" && os === "Unknown")
            ? rawUserAgent
            : `${browser} (${os})`;

        await sheets.spreadsheets.values.append({
            spreadsheetId:
                process.env.GOOGLE_SHEET_ID,

            range: "Contact List!A:H",

            valueInputOption: "USER_ENTERED",

            requestBody: {
                values: [[
                    getFormattedTimestamp(),  // Timestamp
                    email,                    // Email
                    ip,                       // IP
                    country,                  // Country
                    formattedUserAgent,       // User Agent
                    "Footer",                 // Source
                    "Subscribed",             // Status
                    "",                       // Notes
                ]],
            },
        });

        return res.status(200).json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error",
        });
    }
}