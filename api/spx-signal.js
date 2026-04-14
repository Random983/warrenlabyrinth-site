const SPX_QUOTE_URL = "https://stooq.com/q/l/?s=%5Espx&i=1";

function parseQuote(text) {
  const lines = text.trim().split(/\r?\n/);
  const lastLine = lines[lines.length - 1] || "";
  const parts = lastLine.split(",");

  if (parts.length < 7) {
    throw new Error("Unexpected quote format");
  }

  const open = Number(parts[3]);
  const close = Number(parts[6]);

  if (!Number.isFinite(open) || !Number.isFinite(close)) {
    throw new Error("Missing open/close values");
  }

  return { open, close };
}

function getDirection(open, close) {
  if (close > open) return "up";
  if (close < open) return "down";
  return "flat";
}

export default async function handler(_req, res) {
  try {
    const response = await fetch(SPX_QUOTE_URL, {
      headers: {
        "User-Agent": "WarrenLabyrinthTicker/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Quote request failed with ${response.status}`);
    }

    const text = await response.text();
    const { open, close } = parseQuote(text);
    const direction = getDirection(open, close);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=900");
    res.status(200).json({
      symbol: "SPX",
      open,
      close,
      direction,
      label: `SPX ${direction}`
    });
  } catch (_error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(200).json({
      symbol: "SPX",
      direction: "flat",
      label: "SPX"
    });
  }
}
