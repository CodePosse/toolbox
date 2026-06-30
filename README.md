# ReadMe

This doc is to explain the repo.

I created a series of tools for post-production and pre-compilation of front end assets like HTML, JS and CSS. It took me a LOOOOONNNNGGGGG time to make this and I finally got off my butt to make it happen.

## How to use!

Total n00b:
1) install NodeJS
2) download this repo to your computer
3) get a command prompt aka terminal in the root of this folder
4) type `npm i` and it will install all the stuff you will need in that folder
5) Inside the JS files we have defined `BASE_URL = "https://domain.com";` and you should change that. There is also a `const ROOT_DIR = "./sample";` that you can point to specific directories. The url there will be used for social media stuff that requires an absolute path to things like images. Don't forget the description either `DEFAULT_DESCRIPTION = "yoursitedescription";`

:date: Updated 29 June 2026

## Running tasks
- ADA is `npm run ada`
- SEO is `npm run seo`
- Social (OG/Twitter) is `npm run social`
- Minify is `npm run minify`
- Prettify is `npm run pretty`
- Add Schema is `npm run schema`
- Site Auditor for bad links is `npm run links`
- Breadcrumb maker is `npm run breadcrumbs`
- Sitemapper is `npm run sitemap`

### Description
seo        → doctype, lang, charset, viewport, title, description, robots, canonical, theme-color
social     → Open Graph + Twitter/X Cards only
schema     → JSON-LD only
ada        → accessibility attribute fixes
breadcrumbs→ visible breadcrumb navigation
sitemap    → sitemap.xml + robots.txt
links      → audit/report broken internal links, duplicate IDs, missing anchors
pretty     → format files
minify     → minify HTML + JS