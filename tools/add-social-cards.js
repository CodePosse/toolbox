// I tried to make the function names make some sense.
const fs = require('fs/promises');
const fg = require('fast-glob');
const cheerio = require('cheerio');
const prettier = require('prettier');
const config = require('../toolkit.config.js');

function pageUrl(file) {
    let clean = file.replace(/\\/g, '/');
    if (clean.endsWith('/index.html')) clean = clean.replace(/\/index\.html$/, '/');
    clean = clean.replace(/^\.\//, '');
    return `${config.baseUrl.replace(/\/$/, '')}/${clean}`;
}

function ensureHead($) {
    if (!$('html').length) $.root().append('<html></html>');
    if (!$('head').length) $('html').prepend('<head></head>');
    if (!$('body').length) $('html').append('<body></body>');
}

function ensureMeta($, attr, name, content) {
    if ($(`meta[${attr}="${name}"]`).length) return false;
    $('head').append(`\n<meta ${attr}="${name}" content="${content}">`);
    return true;
}

async function processFile(file) {
    const source = await fs.readFile(file, 'utf8');
    const $ = cheerio.load(source, { decodeEntities: false });
    ensureHead($);

    const title = $('title').first().text().trim() || config.defaultTitle || config.siteName;
    const description = $('meta[name="description"]').attr('content') || config.defaultDescription;
    const url = pageUrl(file);
    const imageAlt = `${config.siteName} social preview image`;

    ensureMeta($, 'property', 'og:locale', config.ogLocale || 'en_US');
    ensureMeta($, 'property', 'og:type', 'website');
    ensureMeta($, 'property', 'og:site_name', config.siteName);
    ensureMeta($, 'property', 'og:title', title);
    ensureMeta($, 'property', 'og:description', description);
    ensureMeta($, 'property', 'og:url', url);
    ensureMeta($, 'property', 'og:image', config.images.social);
    ensureMeta($, 'property', 'og:image:secure_url', config.images.social);
    ensureMeta($, 'property', 'og:image:type', config.social.imageType || 'image/png');
    ensureMeta($, 'property', 'og:image:width', config.social.imageWidth || '1200');
    ensureMeta($, 'property', 'og:image:height', config.social.imageHeight || '630');
    ensureMeta($, 'property', 'og:image:alt', imageAlt);
    ensureMeta($, 'property', 'og:logo', config.images.logo);

    ensureMeta($, 'name', 'twitter:card', config.social.twitterCard || 'summary_large_image');
    ensureMeta($, 'name', 'twitter:title', title);
    ensureMeta($, 'name', 'twitter:description', description);
    ensureMeta($, 'name', 'twitter:url', url);
    ensureMeta($, 'name', 'twitter:image', config.images.social);
    ensureMeta($, 'name', 'twitter:image:alt', imageAlt);

    const formatted = await prettier.format($.html(), { parser: 'html', tabWidth: 4, printWidth: 100 });
    await fs.writeFile(file, formatted, 'utf8');
    console.log(`Social cards checked: ${file}`);
}

async function run() {
    const files = await fg(`${config.root}/**/*.html`, { dot: true });
    for (const file of files) await processFile(file);
    console.log(`Social cards complete: ${files.length} file(s)`);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
