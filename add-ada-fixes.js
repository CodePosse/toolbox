const fs = require("fs/promises");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");

const ROOT_DIR = "2026";

function ensureId($, el, prefix, index) {
    let id = $(el).attr("id");

    if (!id) {
        id = `${prefix}-${index + 1}`;
        $(el).attr("id", id);
    }

    return id;
}

function hasAccessibleName($, el) {
    return (
        $(el).attr("aria-label") ||
        $(el).attr("aria-labelledby") ||
        $(el).text().trim()
    );
}

async function processFile(file) {
    const html = await fs.readFile(file, "utf8");

    const $ = cheerio.load(html, {
        decodeEntities: false
    });

    // Ensure html lang
    if (!$("html").attr("lang")) {
        $("html").attr("lang", "en-US");
    }

    // Images: alt attributes and remove title
    $("img").each((index, img) => {
        const $img = $(img);

        if ($img.attr("alt") === undefined) {
            $img.attr("alt", "");
        }

        $img.removeAttr("title");
    });

    // Iframes need titles
    $("iframe").each((index, iframe) => {
        const $iframe = $(iframe);

        if (!$iframe.attr("title")) {
            $iframe.attr("title", `Embedded content ${index + 1}`);
        }
    });

    // Inputs, selects, and textareas need labels or accessible names
    $("input, select, textarea").each((index, field) => {
        const $field = $(field);
        const type = ($field.attr("type") || "").toLowerCase();

        if (["hidden", "submit", "button", "reset"].includes(type)) {
            return;
        }

        const id = ensureId($, field, "form-field", index);

        const hasLabel = $(`label[for="${id}"]`).length > 0;
        const hasAria = $field.attr("aria-label") || $field.attr("aria-labelledby");

        if (!hasLabel && !hasAria) {
            const text =
                $field.attr("placeholder") ||
                $field.attr("name") ||
                $field.attr("id") ||
                `Form field ${index + 1}`;

            $field.before(`\n<label for="${id}" class="visually-hidden">${text}</label>`);
        }
    });

    // Buttons need accessible names
    $("button").each((index, button) => {
        const $button = $(button);

        if (!hasAccessibleName($, button)) {
            $button.attr("aria-label", `Button ${index + 1}`);
        }
    });

    // Empty links need accessible names
    $("a").each((index, link) => {
        const $link = $(link);
        const href = $link.attr("href") || "";

        if (!hasAccessibleName($, link)) {
            $link.attr("aria-label", href || `Link ${index + 1}`);
        }
    });

    // PDF links
    $('a[href$=".pdf"], a[href*=".pdf?"]').each((index, link) => {
        const $link = $(link);

        if (!$link.attr("aria-label")) {
            const text = $link.text().trim() || "PDF file";
            $link.attr("aria-label", `${text} PDF file`);
        }
    });

    // Word document links
    $('a[href$=".doc"], a[href$=".docx"], a[href*=".doc?"], a[href*=".docx?"]').each(
        (index, link) => {
            const $link = $(link);

            if (!$link.attr("aria-label")) {
                const text = $link.text().trim() || "Word document";
                $link.attr("aria-label", `${text} Word document`);
            }
        }
    );

    // Hide explicitly hidden inline elements from screen readers if no ARIA already exists
    $('[style*="display"], [style*="visibility"]').each((index, el) => {
        const $el = $(el);
        const style = ($el.attr("style") || "").toLowerCase();

        const isHidden =
            style.includes("display: none") ||
            style.includes("display:none") ||
            style.includes("visibility: hidden") ||
            style.includes("visibility:hidden");

        const hasAria = Object.keys(el.attribs || {}).some(attr =>
            attr.toLowerCase().startsWith("aria-")
        );

        if (isHidden && !hasAria) {
            $el.attr("aria-hidden", "true");
        }
    });

    // Google Translate generated elements
    $('[id^="goog-gt-"]').each((index, el) => {
        const $el = $(el);

        $el.attr("aria-hidden", "true");
        $el.attr("tabindex", "-1");

        if (!$el.attr("aria-label")) {
            $el.attr("aria-label", $el.attr("id"));
        }
    });

    const formatted = await prettier.format($.html(), {
        parser: "html",
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, "utf8");

    console.log(`ADA fixes added: ${file}`);
}

async function run() {
    const files = await fg(`${ROOT_DIR}/**/*.html`);

    for (const file of files) {
        await processFile(file);
    }

    console.log(`\nDone. ADA pass completed on ${files.length} HTML files.`);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});