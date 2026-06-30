const fs = require('fs/promises');
const fg = require('fast-glob');
const cheerio = require('cheerio');
const prettier = require('prettier');
const config = require('../toolkit.config.js');

function titleCase(value) {
    return String(value || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function pageUrl(file) {
    let clean = file.replace(/\\/g, '/');
    if (clean.endsWith('/index.html')) clean = clean.replace(/\/index\.html$/, '/');
    clean = clean.replace(/^\.\//, '');
    return `${config.baseUrl.replace(/\/$/, '')}/${clean}`;
}

function breadcrumbSchema(file) {
    let clean = file.replace(/\\/g, '/').replace(/\/index\.html$/, '');
    clean = clean.replace(/^\.\//, '');
    const parts = clean.split('/').filter(Boolean);

    const crumbs = [
        { name: 'Home', item: config.baseUrl.replace(/\/$/, '') },
        ...parts.map((part, index) => ({
            name: titleCase(part),
            item: `${config.baseUrl.replace(/\/$/, '')}/${parts.slice(0, index + 1).join('/')}/`
        }))
    ];

    return {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.item
        }))
    };
}

function ensureHead($) {
    if (!$('html').length) $.root().append('<html></html>');
    if (!$('head').length) $('html').prepend('<head></head>');
    if (!$('body').length) $('html').append('<body></body>');
}

async function processFile(file) {
    const source = await fs.readFile(file, 'utf8');
    const $ = cheerio.load(source, { decodeEntities: false });
    ensureHead($);

    const existing = $('script[type="application/ld+json"]')
        .toArray()
        .some(script => $(script).html().includes(`${config.baseUrl.replace(/\/$/, '')}/#website`));

    if (existing) {
        console.log(`Schema already exists: ${file}`);
        return;
    }

    const url = pageUrl(file);
    const title = $('title').first().text().trim() || config.defaultTitle || config.siteName;
    const description = $('meta[name="description"]').attr('content') || config.defaultDescription;
    const base = config.baseUrl.replace(/\/$/, '');

    const schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': `${base}/#organization`,
                name: config.organizationName || config.siteName,
                url: base,
                logo: config.images.logo
            },
            {
                '@type': 'WebSite',
                '@id': `${base}/#website`,
                name: config.siteName,
                url: base,
                publisher: { '@id': `${base}/#organization` }
            },
            {
                '@type': 'WebPage',
                '@id': `${url}#webpage`,
                url,
                name: title,
                description,
                image: config.images.social,
                isPartOf: { '@id': `${base}/#website` },
                publisher: { '@id': `${base}/#organization` }
            },
            breadcrumbSchema(file)
        ]
    };

    $('head').append(`\n<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`);

    const formatted = await prettier.format($.html(), { parser: 'html', tabWidth: 4, printWidth: 100 });
    await fs.writeFile(file, formatted, 'utf8');
    console.log(`Schema checked: ${file}`);
}

async function run() {
    const files = await fg(`${config.root}/**/*.html`, { dot: true });
    for (const file of files) await processFile(file);
    console.log(`Schema complete: ${files.length} file(s)`);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
