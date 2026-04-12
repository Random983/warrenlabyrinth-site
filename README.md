# Warren Labyrinth Blog Workflow

This website is a simple static blog. That is good news because it keeps publishing easy:

1. Edit or add files
2. Push to GitHub
3. Vercel deploys automatically

## Folder Map

- `index.html` -> homepage
- `styles.css` -> site design
- `script.js` -> small animations
- `posts/` -> blog post pages
- `logo.svg` -> site logo
- `og-cover.svg` -> social sharing image
- `robots.txt` -> search engine crawling rules
- `sitemap.xml` -> search engine page list

## Simple Publishing Workflow

### To publish a new post

1. Copy `posts/post-template.html`
2. Rename it to something like `best-budgeting-habits.html`
3. Edit the title, description, date, category, heading, and article text
4. Add a new card on the homepage in `index.html`
5. Add the new page URL to `sitemap.xml`
6. Push to GitHub
7. Wait for Vercel to deploy

### To edit the homepage

1. Open `index.html`
2. Change the hero text, featured story, or article cards
3. Push to GitHub

### To edit the design

1. Open `styles.css`
2. Change colors, spacing, or layout
3. Push to GitHub

## New Post Checklist

Before publishing a new article, make sure:

- The page has a unique `<title>`
- The page has a unique meta description
- The page has a canonical URL
- The article date is correct
- The article is linked from `index.html`
- The article is added to `sitemap.xml`
- The article has related links to other posts

## GitHub Browser Workflow

If you want to update the site without touching code tools:

1. Open the GitHub repo
2. Open a file
3. Click the pencil icon
4. Make your changes
5. Click `Commit changes`
6. Vercel redeploys automatically

## Recommended Post Naming

Use lowercase file names with hyphens:

- `best-budgeting-habits.html`
- `how-to-start-investing.html`
- `retirement-planning-basics.html`

## SEO Notes

- Keep titles clear and specific
- Put the main keyword near the beginning of the title
- Write meta descriptions like a short ad for the article
- Link new posts to older related posts
- Update the homepage regularly so search engines see fresh content
