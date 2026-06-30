const fs = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");
const cheerio = require("cheerio");

const ROOT_DIR = "./";

function isExternal(href) {
    return /^https?:\/\//i.test(href);
}

function isSpecial(href) {
    return (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
    );
}

async function fileExists(file) {
    try {
        await fs.access(file);
        return true;
    } catch {
        return false;
    }
}

async function processFile(file, report) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    const ids = new Set();

    $("[id]").each((index, el) => {
        const id = $(el).attr("id");

        if (ids.has(id)) {
            report.duplicateIds.push({
                file,
                id
            });
        }

        ids.add(id);
    });

    $("a[href]").each(async (index, link) => {});

    const links = $("a[href]").toArray();

    for (const link of links) {
        const href = $(link).attr("href");

        if (!href) {
            report.emptyLinks.push({
                file,
                href
            });
            continue;
        }

        if (href === "#") {
            report.placeholderLinks.push({
                file,
                href
            });
            continue;
        }

        if (href.startsWith("#")) {
            const id = href.slice(1);

            if (!ids.has(id)) {
                report.missingAnchors.push({
                    file,
                    href
                });
            }

            continue;
        }

        if (isExternal(href) || isSpecial(href)) {
            continue;
        }

        const cleanHref = href.split("#")[0].split("?")[0];

        let target = path.resolve(path.dirname(file), cleanHref);

        if (href.endsWith("/")) {
            target = path.resolve(path.dirname(file), cleanHref, "index.html");
        }

        if (!(await fileExists(target))) {
            report.brokenInternalLinks.push({
                file,
                href,
                resolved: target
            });
        }
    }
}

async function run() {
    const report = {
        brokenInternalLinks: [],
        missingAnchors: [],
        duplicateIds: [],
        placeholderLinks: [],
        emptyLinks: []
    };

    const files = await fg(`${ROOT_DIR}/**/*.html`);

    for (const file of files) {
        await processFile(file, report);
    }

    await fs.mkdir("reports", {
        recursive: true
    });

    await fs.writeFile("reports/links-report.json", JSON.stringify(report, null, 2), "utf8");

    console.log("Link check complete.");
    console.log(`Broken internal links: ${report.brokenInternalLinks.length}`);
    console.log(`Missing anchors: ${report.missingAnchors.length}`);
    console.log(`Duplicate IDs: ${report.duplicateIds.length}`);
    console.log(`Placeholder links: ${report.placeholderLinks.length}`);
    console.log("Report saved to reports/links-report.json");
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});