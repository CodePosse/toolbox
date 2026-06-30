const fs = require("fs/promises");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "sample";
const BASE_URL = "https://domain.com";
const SITE_NAME = "LA Courts";

const WIDE_IMAGE = "https://codeposse.github.io/LA-Courts/jury/img/lacourt_logo_transparent.png";
const SQUARE_IMAGE = "https://codeposse.github.io/LA-Courts/img/court-seal.gif";

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function ensureMeta($, attr, name, content) {
    if ($(`meta[${attr}="${name}"]`).length) return;
    $("head").append(`\n<meta ${attr}="${name}" content="${content}">`);
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

    ensureMeta($, "property", "og:locale", "en_US");
    ensureMeta($, "property", "og:type", "website");
    ensureMeta($, "property", "og:site_name", SITE_NAME);
    ensureMeta($, "property", "og:title", title);
    ensureMeta($, "property", "og:description", description);
    ensureMeta($, "property", "og:url", url);
    ensureMeta($, "property", "og:image", WIDE_IMAGE);
    ensureMeta($, "property", "og:image:secure_url", WIDE_IMAGE);
    ensureMeta($, "property", "og:image:type", "image/png");
    ensureMeta($, "property", "og:image:width", "1200");
    ensureMeta($, "property", "og:image:height", "630");
    ensureMeta($, "property", "og:image:alt", `${SITE_NAME} logo`);
    ensureMeta($, "property", "og:logo", SQUARE_IMAGE);

    ensureMeta($, "name", "twitter:card", "summary_large_image");
    ensureMeta($, "name", "twitter:title", title);
    ensureMeta($, "name", "twitter:description", description);
    ensureMeta($, "name", "twitter:url", url);
    ensureMeta($, "name", "twitter:image", WIDE_IMAGE);
    ensureMeta($, "name", "twitter:image:alt", `${SITE_NAME} logo`);

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");
    console.log(`Social cards checked: ${file}`);
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