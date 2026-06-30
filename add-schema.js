const fs = require("fs/promises");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "2026";
const BASE_URL = "https://domain.com";
const SITE_NAME = "LA Courts";

const LOGO = "https://codeposse.github.io/LA-Courts/img/court-seal.gif";

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");

    if (clean.endsWith("/index.html")) {
        clean = clean.replace("/index.html", "/");
    }

    return `${BASE_URL}/${clean}`;
}

function titleCase(text) {
    return text
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
}

function breadcrumbSchema(file) {
    const clean = file.replace(/\\/g, "/").replace(/\/index\.html$/, "");
    const parts = clean.split("/").filter(Boolean);

    const items = [
        {
            name: "Home",
            item: BASE_URL
        },
        ...parts.map((part, index) => ({
            name: titleCase(part),
            item: `${BASE_URL}/${parts.slice(0, index + 1).join("/")}/`
        }))
    ];

    return {
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.item
        }))
    };
}

async function processFile(file) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    if ($('script[type="application/ld+json"]').length) {
        console.log(`Skipped existing schema: ${file}`);
        return;
    }

    const title = $("title").first().text().trim() || SITE_NAME;
    const description =
        $('meta[name="description"]').attr("content") ||
        "Official Los Angeles County Superior Court information and services.";
    const url = pageUrl(file);

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "GovernmentOrganization",
                "@id": `${BASE_URL}/#organization`,
                name: SITE_NAME,
                url: BASE_URL,
                logo: LOGO
            },
            {
                "@type": "WebSite",
                "@id": `${BASE_URL}/#website`,
                name: SITE_NAME,
                url: BASE_URL,
                publisher: {
                    "@id": `${BASE_URL}/#organization`
                }
            },
            {
                "@type": "WebPage",
                "@id": `${url}#webpage`,
                url,
                name: title,
                description,
                isPartOf: {
                    "@id": `${BASE_URL}/#website`
                },
                publisher: {
                    "@id": `${BASE_URL}/#organization`
                }
            },
            breadcrumbSchema(file)
        ]
    };

    $("head").append(
        `\n<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
    );

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");

    console.log(`Added schema: ${file}`);
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