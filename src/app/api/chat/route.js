import { NextResponse } from "next/server";

// IMPORTANT: In a real Next.js deployment, the API key must be secured
// using environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define the system instruction for the AI assistant's persona and rules
const SYSTEM_PROMPT = `
You are a helpful and positive AI diet and nutrition assistant.
Your responses must be friendly, encouraging, and concise. Use emojis generously!

Follow these specific instructions:
1. If the user asks for a meal plan, create a healthy plan with breakfast, lunch, dinner, and 2 snack ideas.
2. If they ask for recipes, list 3 healthy recipe ideas with key ingredients only.
3. If they ask about nutrients, provide simple, easy-to-digest nutrition information.
`;

/**
 * Handles incoming POST requests to chat with the Gemini API.
 * This function acts as a proxy to protect the API key.
 */
export async function POST(req) {
  // Check for the API Key first
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, message: "GEMINI_API_KEY not configured." },
      { status: 500 }
    );
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, message: "No input provided." },
        { status: 400 }
      );
    }

    // Use the recommended model for text generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;

    // Construct the payload, separating the System Instruction from the User Query
    const payload = {
      contents: [{ parts: [{ text: message }] }], // The user's specific query
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }], // The AI's persistent role and rules
      },
    };

    // --- API Call with Exponential Backoff ---
    const maxRetries = 5;
    let response;

    for (let i = 0; i < maxRetries; i++) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        break; // Success!
      }

      // If not the last retry, wait with exponential backoff
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s, 16s...
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
         // If it's the last retry and still failing, throw an error
         throw new Error(`Failed to fetch from Gemini API after ${maxRetries} attempts.`);
      }
    }
    // --- End API Call Logic ---

    const data = await response.json();

    // Check if the API response contains a valid text candidate
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Apologies! 😔 I had trouble generating a comprehensive response right now. Try a simpler question!";

    return NextResponse.json({ success: true, message: reply });

  } catch (err) {
    console.error("Gemini API Error in route handler:", err.message || err);

    let status = 500;
    let message = "An internal server error occurred while processing the request.";

    if (err.message && err.message.includes("Failed to fetch")) {
        message = "Network error: Could not connect to the Gemini API.";
        status = 503; // Service Unavailable
    } else if (err.message && err.message.includes("Failed to fetch from Gemini API")) {
        message = err.message;
    }

    return NextResponse.json(
      { success: false, message: message },
      { status: status }
    );
  }
}
