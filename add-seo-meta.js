const fs = require("fs/promises");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "/";
const BASE_URL = "https://domain.com";

const SITE_NAME = "LA Courts";
const THEME_COLOR = "#003f72";

const DEFAULT_DESCRIPTION =
    "Official Los Angeles County Superior Court information and services.";

const WIDE_IMAGE = "https://codeposse.github.io/LA-Courts/jury/img/lacourt_logo_transparent.png";
const SQUARE_IMAGE = "https://codeposse.github.io/LA-Courts/img/court-seal.gif";

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function addMeta($, name, value) {
    if ($(`meta[name="${name}"]`).length) return;

    $("head").append(`\n<meta name="${name}" content="${value}">`);
}

function addCanonical($, url) {
    if ($('link[rel="canonical"]').length) return;

    $("head").append(`\n<link rel="canonical" href="${url}">`);
}

function addJsonLd($, data) {
    if ($('script[type="application/ld+json"]').length) return;

    $("head").append(
        `\n<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
    );
}

async function processFile(file) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    const title = $("title").first().text().trim() || SITE_NAME;
    const url = pageUrl(file);

    const description =
        $('meta[name="description"]').attr("content") || DEFAULT_DESCRIPTION;

    addMeta($, "description", description);
    addMeta($, "robots", "index, follow");
    addMeta($, "theme-color", THEME_COLOR);

    addCanonical($, url);

    addJsonLd($, {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "GovernmentOrganization",
                "@id": `${BASE_URL}/#organization`,
                name: SITE_NAME,
                url: BASE_URL,
                logo: SQUARE_IMAGE
            },
            {
                "@type": "WebPage",
                "@id": `${url}#webpage`,
                url,
                name: title,
                description,
                isPartOf: {
                    "@id": `${BASE_URL}/#organization`
                },
                image: WIDE_IMAGE
            }
        ]
    });

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");

    console.log(`SEO metadata added: ${file}`);
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