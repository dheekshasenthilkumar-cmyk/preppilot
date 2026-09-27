export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "AI is not configured" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        instructions:
          "You are PrepPilot, a concise and encouraging college study assistant. Help with study planning, revision, quizzes, assignments, ECE subjects, and productivity. Do not invent course-specific facts when the student has not provided them. Keep answers practical and easy to follow.",
        input: prompt,
        max_output_tokens: 500,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI request failed",
      });
    }

    const reply = Array.isArray(data.output)
      ? data.output
          .flatMap((item) => Array.isArray(item.content) ? item.content : [])
          .map((item) => item.text || "")
          .filter(Boolean)
          .join("\n")
      : "";

    return res.status(200).json({
      reply: reply || "I couldn't generate a response. Please try again.",
    });
  } catch (error) {
    console.error("PrepPilot AI error:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
}
