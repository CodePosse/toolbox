const fs = require("fs/promises");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "/";
const BASE_URL = "https://domain.com";

const SITE_NAME = "yoursitename";

const WIDE_IMAGE = "https://domain.com/img/wide-image.png";
const SQUARE_IMAGE = "https://domain.com/square-image";

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function addMeta($, attr, key, value) {
    if ($(`meta[${attr}="${key}"]`).length) return;

    $("head").append(`\n<meta ${attr}="${key}" content="${value}">`);
}

async function processFile(file) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    const title = $("title").first().text().trim() || SITE_NAME;
    const description =
        $('meta[name="description"]').attr("content") ||
        "Official Los Angeles County Superior Court information and services.";

    const url = pageUrl(file);

    // Open Graph
    addMeta($, "property", "og:locale", "en_US");
    addMeta($, "property", "og:type", "website");
    addMeta($, "property", "og:site_name", SITE_NAME);
    addMeta($, "property", "og:title", title);
    addMeta($, "property", "og:description", description);
    addMeta($, "property", "og:url", url);

    addMeta($, "property", "og:image", WIDE_IMAGE);
    addMeta($, "property", "og:image:secure_url", WIDE_IMAGE);
    addMeta($, "property", "og:image:type", "image/png");
    addMeta($, "property", "og:image:width", "1200");
    addMeta($, "property", "og:image:height", "630");
    addMeta($, "property", "og:image:alt", `${SITE_NAME} logo`);

    addMeta($, "property", "og:logo", SQUARE_IMAGE);

    // Twitter / X Cards
    addMeta($, "name", "twitter:card", "summary_large_image");
    addMeta($, "name", "twitter:title", title);
    addMeta($, "name", "twitter:description", description);
    addMeta($, "name", "twitter:url", url);
    addMeta($, "name", "twitter:image", WIDE_IMAGE);
    addMeta($, "name", "twitter:image:alt", `${SITE_NAME} logo`);

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");

    console.log(`Social cards added: ${file}`);
}

async function run() {
    const files = await fg(`${ROOT_DIR}/**/*.html`);

    for (const file of files) {
        await processFile(file);
    }
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});