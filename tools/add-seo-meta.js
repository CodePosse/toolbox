// I tried to make the function names make some sense.
const fs = require("fs/promises");
const path = require("path");
const fg = require("fast-glob");
const cheerio = require("cheerio");
const prettier = require("prettier");
const config = require("../toolkit.config.js");

function titleCase(value) {
    return String(value || "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function pageUrl(file) {
    let clean = file.replace(/\\/g, "/");
    const root = String(config.root).replace(/\\/g, "/").replace(/\/$/, "");
    if (clean.endsWith("/index.html")) clean = clean.replace(/\/index\.html$/, "/");
    clean = clean.replace(/^\.\//, "");
    return `${config.baseUrl.replace(/\/$/, "")}/${clean}`;
}

function ensureHead($) {
    if (!$('html').length) $.root().append('<html></html>');
    if (!$('head').length) $('html').prepend('<head></head>');
    if (!$('body').length) $('html').append('<body></body>');
}

function ensureMetaName($, name, content) {
    if ($(`meta[name="${name}"]`).length) return false;
    $('head').append(`\n<meta name="${name}" content="${content}">`);
    return true;
}

function ensureCharset($) {
    if ($('meta[charset]').length) return false;
    $('head').prepend('\n<meta charset="utf-8">');
    return true;
}

function ensureViewport($) {
    if ($('meta[name="viewport"]').length) return false;
    const tag = '\n<meta name="viewport" content="width=device-width, initial-scale=1">';
    const charset = $('meta[charset]').first();
    if (charset.length) charset.after(tag);
    else $('head').prepend(tag);
    return true;
}

function ensureTitle($, file) {
    if ($('title').length) return false;
    let title = $('h1').first().text().trim();
    if (!title) {
        title = titleCase(path.basename(file, '.html'));
        if (!title || title.toLowerCase() === 'index') title = config.defaultTitle || config.siteName;
    }
    const tag = `\n<title>${title}</title>`;
    const viewport = $('meta[name="viewport"]').first();
    if (viewport.length) viewport.after(tag);
    else $('head').prepend(tag);
    return true;
}

function ensureCanonical($, url) {
    if ($('link[rel="canonical"]').length) return false;
    $('head').append(`\n<link rel="canonical" href="${url}">`);
    return true;
}

function ensureDoctype(html) {
    return html.trimStart().toLowerCase().startsWith('<!doctype html>') ? html : `<!DOCTYPE html>\n${html}`;
}

async function processFile(file) {
    const source = await fs.readFile(file, 'utf8');
    const $ = cheerio.load(source, { decodeEntities: false });
    ensureHead($);

    if (!$('html').attr('lang')) $('html').attr('lang', config.language || 'en-US');

    const url = pageUrl(file);
    ensureCharset($);
    ensureViewport($);
    ensureTitle($, file);

    const description = $('meta[name="description"]').attr('content') || config.defaultDescription;
    ensureMetaName($, 'description', description);
    ensureMetaName($, 'author', config.authorName || 'author-name');
    ensureMetaName($, 'robots', 'index, follow');
    ensureMetaName($, 'theme-color', config.themeColor || '#000000');
    ensureCanonical($, url);

    const formatted = await prettier.format(ensureDoctype($.html()), {
        parser: 'html',
        tabWidth: 4,
        printWidth: 100
    });

    await fs.writeFile(file, formatted, 'utf8');
    console.log(`SEO/meta checked: ${file}`);
}

async function run() {
    const files = await fg(`${config.root}/**/*.html`, { dot: true });
    for (const file of files) await processFile(file);
    console.log(`SEO/meta complete: ${files.length} file(s)`);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
