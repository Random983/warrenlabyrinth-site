const FEED_URLS = [
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://feeds.bbci.co.uk/news/business/rss.xml"
];
const MAX_ITEMS = 5;
const PRIORITY_KEYWORDS = [
  "stock",
  "stocks",
  "share",
  "shares",
  "market",
  "markets",
  "wall street",
  "dow",
  "s&p",
  "nasdaq",
  "earnings",
  "inflation",
  "interest rate",
  "rates",
  "fed",
  "central bank",
  "economy",
  "economic",
  "tariff",
  "trade",
  "oil",
  "energy",
  "recession",
  "war",
  "conflict",
  "china",
  "europe",
  "russia",
  "middle east"
];

function decodeHtml(value = "") {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : "";
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function scoreHeadline(item) {
  const haystack = `${item.title} ${item.category}`.toLowerCase();

  return PRIORITY_KEYWORDS.reduce((score, keyword) => {
    return haystack.includes(keyword) ? score + 1 : score;
  }, 0);
}

function parseFeed(xmlText, sourceLabel) {
  return [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .map((match) => {
      const item = match[1];

      return {
        title: extractTag(item, "title"),
        link: extractTag(item, "link"),
        category: extractTag(item, "category") || sourceLabel,
        published: formatDate(extractTag(item, "pubDate"))
      };
    })
    .filter((item) => item.title && item.link);
}

function dedupeItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

export default async function handler(_req, res) {
  try {
    const responses = await Promise.all(
      FEED_URLS.map(async (url) => {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "WarrenLabyrinthNewsBot/1.0"
          }
        });

        if (!response.ok) {
          throw new Error(`Feed request failed with ${response.status}`);
        }

        return {
          url,
          xml: await response.text()
        };
      })
    );

    const items = dedupeItems(
      responses.flatMap(({ url, xml }) => {
        const sourceLabel = url.includes("/business/") ? "Business" : "World";
        return parseFeed(xml, sourceLabel);
      })
    )
      .sort((a, b) => scoreHeadline(b) - scoreHeadline(a))
      .slice(0, MAX_ITEMS);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=900");
    res.status(200).json({
      source: "BBC News",
      updatedAt: new Date().toISOString(),
      items
    });
  } catch (_error) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(500).json({
      error: "Unable to load world news right now."
    });
  }
}
