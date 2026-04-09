import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import { extractTokensFromUrl } from "./scrape.js";
import { fallbackTokens, sanitizeTokens } from "./tokens.js";
import { hasSupabase, supabase } from "./supabase.js";

const app = express();
const port = process.env.PORT || 4000;
const inMemoryTokens = new Map();
const allowedOrigins =
  process.env.FRONTEND_URL?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || process.env.VERCEL === "1") {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());
app.options("*", cors());

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

app.get("/", (_, res) => {
  res.json({
    name: "StyleSync Backend",
    ok: true,
    endpoints: ["/health", "/scrape", "/tokens/:id"],
  });
});

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.post("/scrape", async (req, res) => {
  const { url, refine = false, currentTokens = null } = req.body ?? {};

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Enter a valid website URL." });
  }

  try {
    const tokens = await extractTokensFromUrl(url, { refine, currentTokens });
    return res.json(tokens);
  } catch (error) {
    return res.status(200).json(fallbackTokens);
  }
});

app.post("/tokens", async (req, res) => {
  const { url, tokens, locked } = req.body ?? {};

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "A valid URL is required." });
  }

  const payload = {
    url,
    tokens: sanitizeTokens(tokens),
    locked: locked ?? {},
  };

  if (!hasSupabase) {
    const record = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      storage: "memory",
    };

    inMemoryTokens.set(record.id, record);
    return res.status(201).json(record);
  }

  const { data, error } = await supabase
    .from("design_tokens")
    .insert(payload)
    .select("id, url, tokens, locked, created_at")
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to save tokens." });
  }

  return res.status(201).json(data);
});

app.get("/tokens/:id", async (req, res) => {
  if (!hasSupabase) {
    const record = inMemoryTokens.get(req.params.id);

    if (!record) {
      return res.status(404).json({ error: "Saved token set not found." });
    }

    return res.json(record);
  }

  const { data, error } = await supabase
    .from("design_tokens")
    .select("id, url, tokens, locked, created_at")
    .eq("id", req.params.id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Saved token set not found." });
  }

  return res.json(data);
});

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`StyleSync backend running on port ${port}`);
  });
}

export default app;
