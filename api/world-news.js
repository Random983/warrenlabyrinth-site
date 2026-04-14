const FEED_URL = "https://feeds.bbci.co.uk/news/world/rss.xml";
const MAX_ITEMS = 5;

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

function parseFeed(xmlText) {
  return [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, MAX_ITEMS)
    .map((match) => {
      const item = match[1];

      return {
        title: extractTag(item, "title"),
        link: extractTag(item, "link"),
        category: extractTag(item, "category"),
        published: formatDate(extractTag(item, "pubDate"))
      };
    })
    .filter((item) => item.title && item.link);
}

export default async function handler(_req, res) {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        "User-Agent": "WarrenLabyrinthNewsBot/1.0"
      }
    });

    if (!response.ok) {
      throw new Error(`Feed request failed with ${response.status}`);
    }

    const xml = await response.text();
    const items = parseFeed(xml);

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
