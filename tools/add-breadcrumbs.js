// I tried to make the function names make some sense.
const fs = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "./sample";
const BASE_URL = "https://domain.com";

function titleCase(text) {
    return text
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function breadcrumbParts(file) {
    const clean = file.replace(/\\/g, "/").replace(/\/index\.html$/, "");
    const parts = clean.split("/").filter(Boolean);

    return parts.map((part, index) => {
        const href = `${BASE_URL}/${parts.slice(0, index + 1).join("/")}/`;

        return {
            name: titleCase(part),
            url: href
        };
    });
}

async function processFile(file) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    if ($(".breadcrumb, nav[aria-label='Breadcrumb']").length) {
        console.log(`Skipped existing breadcrumbs: ${file}`);
        return;
    }

    const crumbs = [
        {
            name: "Home",
            url: BASE_URL
        },
        ...breadcrumbParts(file)
    ];

    const breadcrumbHtml = `
<nav aria-label="Breadcrumb" class="breadcrumb-wrapper">
    <ol class="breadcrumb">
        ${crumbs
            .map((crumb, index) => {
                const isLast = index === crumbs.length - 1;

                return `<li class="breadcrumb-item"${
                    isLast ? ' aria-current="page"' : ""
                }>${isLast ? crumb.name : `<a href="${crumb.url}">${crumb.name}</a>`}</li>`;
            })
            .join("\n        ")}
    </ol>
</nav>`;

    const target = $("main").first();

    if (target.length) {
        target.prepend(breadcrumbHtml);
    } else {
        $("body").prepend(breadcrumbHtml);
    }

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");

    console.log(`Added breadcrumbs: ${file}`);
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