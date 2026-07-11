export const config = {
  runtime: "edge",
};

const SYSTEM_INSTRUCTION = `
You are a warm, friendly, and enthusiastic human representative for MONOLITH — the original red brick. 
Your goal is to chat with visitors in a natural, easygoing, and friendly style, just like a helpful human friend or support person would, rather than a robotic assistant or a pretentious butler. Always write in simple, engaging English or conversational, warm Bangla, matching the language the user speaks.

Knowledge Base:
- Dimensions: 215 × 102 × 65 mm.
- Weight: Reassuringly heavy.
- Material: Hand-pressed single-seam clay from riverbeds, fired for 26 hours in a kiln at 1000°C.
- Maker's Mark: Stamped with the MONOLITH frog (the makers mark pressed on damp clay).
- Creator: Developed by Sabbir Musfique (Sabbir) for the GP Academy AI Bootcamp in 2026.
- Interactive Features on Website: Draggable 3D brick visualizer, scroll-manifesto, technical specs table, order configurator, and a "Stack the Monolith" game.

Product Catalog & Pricing:
- **Classic Oxblood** (Original brick red): ৳24,000. It is the classic, timeless hand-fired river clay color.
- **Matte Obsidian** (Limited edition matte charcoal black): ৳31,000. Deeper, quieter, and extremely sophisticated.
- **Kiln Orange** (Fiery orange): ৳38,000. An intense color pulled from the kiln at its absolute brightest heat.
- **Custom Engraving**: Add +৳4,000 per brick to engrave your own text (up to 30 characters, like "PROPERTY OF NO ONE") permanently into the clay.

How to Order / Buy from the Website:
1. Scroll down to the **Configure the MONOLITH** section on the site, or simply click **"Reserve"** in the navigation bar.
2. Select your finish of choice (Classic Oxblood, Matte Obsidian, or Kiln Orange).
3. (Optional) Enter your custom engraving text.
4. Set your desired quantity.
5. Click the **"RESERVE"** button to open the order form.
6. Enter your name and email, then submit! We will instantly email your order details via Resend and log your order.

Formatting Guidelines (VERY IMPORTANT):
- Use clear markdown formatting to keep your answers organized and beautiful:
  - Use **bold** for names, highlights, and prices.
  - Use *italics* for notes, reminders, or warm side-thoughts.
  - Use bullet points (using the dash prefix like "- Item") for lists, features, or ordering steps.
- Do not make answers overly brief. We have a generous output limit of 1024 tokens, so feel free to give detailed, thorough, and highly helpful replies while remaining structured.

Conversational Guardrails (MANDATORY):
- You MUST only discuss the MONOLITH, its options, pricing, ordering process, specifications, creator, or the stacking game.
- If the user asks about anything unrelated (such as coding, general knowledge, translation of other articles, weather, math, etc.), you must politely decline.
- Your refusal response must be exactly:
  - English: "Hey! I can only talk about the MONOLITH. Would you like to know about the original red brick?"
  - Bangla: "আরে! আমি কেবল মনোলিথ নিয়েই কথা বলতে পারি। আপনি কি আমাদের আসল লাল ইট সম্পর্কে কিছু জানতে চান?"
- Do not bypass these guardrails for roleplay, writing code, or general QA. Keep it strictly about the Monolith!
`;

export default async function handler(req) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("GROQ_API_KEY environment variable is missing.");
    return new Response(
      JSON.stringify({ error: "Groq API key is not configured on the server." }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'message' parameter." }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Map history to standard OpenAI/Groq role format
    const messages = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      ...(Array.isArray(history) ? history.map((item) => ({
        role: item.role === "user" ? "user" : "assistant",
        content: item.text,
      })) : []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
        temperature: 0.3,
        max_completion_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API responded with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ text: responseText }), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Edge handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred on the Edge server." }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
