const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && reveals.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

const worldNewsList = document.querySelector("[data-news-list]");
const worldNewsStatus = document.querySelector("[data-news-status]");

function renderWorldNews(items) {
  if (!worldNewsList || !worldNewsStatus) return;

  if (!items.length) {
    worldNewsStatus.textContent = "No world headlines are available right now.";
    worldNewsList.innerHTML = "";
    return;
  }

  worldNewsStatus.textContent = "Source: BBC World";
  worldNewsList.innerHTML = items
    .slice(0, 3)
    .map((item) => {
      const meta = [item.category, item.published].filter(Boolean).join(" | ");

      return `
        <li class="world-news-item">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer">
            <span class="world-news-item-title">${item.title}</span>
            ${meta ? `<span class="world-news-item-meta">${meta}</span>` : ""}
          </a>
        </li>
      `;
    })
    .join("");
}

async function loadWorldNews() {
  if (!worldNewsList || !worldNewsStatus) return;

  try {
    const response = await fetch("/api/world-news", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const payload = await response.json();
    renderWorldNews(payload.items || []);
  } catch (_error) {
    worldNewsStatus.textContent = "World headlines are temporarily unavailable.";
    worldNewsList.innerHTML = "";
  }
}

loadWorldNews();
window.setInterval(loadWorldNews, 15 * 60 * 1000);
