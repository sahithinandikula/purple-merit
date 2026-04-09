const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
).trim().replace(/\/$/, "");

export const scrapeTokens = async (url, options = {}) => {
  const response = await fetch(`${apiBaseUrl}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      refine: Boolean(options.refine),
      currentTokens: options.currentTokens ?? null,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to analyze website.");
  }

  return data;
};

export const saveTokens = async ({ url, tokens, locked }) => {
  const response = await fetch(`${apiBaseUrl}/tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, tokens, locked }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save tokens.");
  }

  return data;
};
