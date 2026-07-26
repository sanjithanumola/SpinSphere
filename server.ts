import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // AI Smart Decision Insights endpoint
  app.post("/api/ai-insights", async (req, res) => {
    try {
      const { wheelTitle, options, spinHistory } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is missing. Please configure GEMINI_API_KEY in secrets.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Analyze this decision-making session for the wheel titled "${wheelTitle || 'SpinSphere Wheel'}".
Options available: ${JSON.stringify(options || [])}
Recent Spin History (${spinHistory?.length || 0} spins): ${JSON.stringify(
        (spinHistory || []).slice(-15)
      )}

Please generate a structured JSON object response with:
1. "trendSummary": a clever, witty 2-sentence summary of the decision trend.
2. "luckIndex": a number from 1 to 100 representing how balanced or chaotic the luck distribution is.
3. "favoredOption": the option that appears most or holds the strongest momentum.
4. "personalityType": a fun decision-maker persona (e.g. "The Fate Believer", "The Risk Optimizer", "The Impulsive Spinner", "The Strategic Deliberator").
5. "funFact": an entertaining statistical observation or fun trivia based on these options/outcomes.
6. "actionableAdvice": 1 concise recommendation on whether to stick with the result or spin again.
7. "insightsList": an array of 3 short, intriguing bullet point observations.

Return strictly valid JSON matching this schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const insights = JSON.parse(responseText);
      res.json(insights);
    } catch (err: any) {
      console.error("Error generating AI insights:", err);
      res.status(500).json({
        error: "Failed to generate AI insights: " + (err.message || String(err)),
      });
    }
  });

  // AI Generate Wheel Options endpoint
  app.post("/api/ai-suggest-options", async (req, res) => {
    try {
      const { topic, count = 6 } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is missing.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Generate a list of ${count} creative, balanced, and distinct option choices for a decision wheel topic: "${topic}".
Return a valid JSON array of objects, where each object has:
- "label": string (short option text, 1-4 words)
- "weight": number (default 1)
- "color": optional hex color suggestion (or leave null for default palette)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const options = JSON.parse(response.text || "[]");
      res.json({ options });
    } catch (err: any) {
      console.error("Error suggesting options:", err);
      res.status(500).json({
        error: "Failed to suggest options: " + (err.message || String(err)),
      });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SpinSphere Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
