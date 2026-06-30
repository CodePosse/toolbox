const fs = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "sample";
const BASE_URL = "https://domain.com";
const SITE_NAME = "LA Courts";
const DEFAULT_DESCRIPTION = "Official Los Angeles County Superior Court information and services.";
const THEME_COLOR = "#003f72";

function titleCase(value) {
    return value.replace(/[-_]/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function ensureMetaName($, name, content) {
    if ($(`meta[name="${name}"]`).length) return;
    $("head").append(`\n<meta name="${name}" content="${content}">`);
}

function ensureCharset($) {
    if ($("meta[charset]").length) return;
    $("head").prepend(`\n<meta charset="utf-8">`);
}

function ensureViewport($) {
    if ($('meta[name="viewport"]').length) return;
    $("meta[charset]").after(`\n<meta name="viewport" content="width=device-width, initial-scale=1">`);
}

function ensureTitle($, file) {
    if ($("title").length) return;

    let title = $("h1").first().text().trim();

    if (!title) {
        title = titleCase(path.basename(file, ".html"));
        if (title.toLowerCase() === "index") title = "Home";
    }

    $("meta[name='viewport']").after(`\n<title>${title} | ${SITE_NAME}</title>`);
}

function ensureCanonical($, url) {
    if ($('link[rel="canonical"]').length) return;
    $("head").append(`\n<link rel="canonical" href="${url}">`);
}

function ensureDoctype(html) {
    return html.trimStart().toLowerCase().startsWith("<!doctype html>")
        ? html
        : `<!DOCTYPE html>\n${html}`;
}

async function processFile(file) {
    let html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    if (!$("html").attr("lang")) {
        $("html").attr("lang", "en-US");
    }

    const url = pageUrl(file);

    ensureCharset($);
    ensureViewport($);
    ensureTitle($, file);

    const title = $("title").first().text().trim() || SITE_NAME;
    const description = $('meta[name="description"]').attr("content") || DEFAULT_DESCRIPTION;

    ensureMetaName($, "description", description);
    ensureMetaName($, "robots", "index, follow");
    ensureMetaName($, "theme-color", THEME_COLOR);
    ensureMetaName($, "author", SITE_NAME);

    ensureCanonical($, url);

    const formatted = await prettier.format(ensureDoctype($.html()), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");
    console.log(`SEO/meta checked: ${file}`);
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