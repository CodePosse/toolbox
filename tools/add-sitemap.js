const fs = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");

const ROOT_DIR = "./sample";
const BASE_URL = "https://domain.com";

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

async function run() {
    const files = await fg(`${ROOT_DIR}/**/*.html`);

    const urls = await Promise.all(
        files.map(async file => {
            const stat = await fs.stat(file);

            return `    <url>
        <loc>${pageUrl(file)}</loc>
        <lastmod>${stat.mtime.toISOString().split("T")[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${file.endsWith("index.html") ? "0.8" : "0.6"}</priority>
    </url>`;
        })
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

    await fs.writeFile("sitemap.xml", sitemap, "utf8");

    const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

    await fs.writeFile("robots.txt", robots, "utf8");

    console.log(`Created sitemap.xml with ${files.length} pages`);
    console.log("Created robots.txt");
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});