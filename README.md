![GitHub package.json dynamic](https://img.shields.io/github/package-json/description/codeposse/toolbox) | [GitHub package.json dynamic](https://img.shields.io/github/package-json/version/codeposse/toolbox) | [GitHub package.json dynamic](https://img.shields.io/github/package-json/author/codeposse/toolbox)
# ReadMe

This doc is to explain the repo. :date: Updated 29 June 2026

I created a series of tools for post-production and pre-compilation of front end assets like HTML, JS and CSS. It took me a LOOOOONNNNGGGGG time to make this and I finally got off my butt to make it happen.

## How to use!

Total n00b:
1) install NodeJS
2) download this repo to your computer
3) get a command prompt aka terminal in the root of this folder
4) type `npm i` and it will install all the stuff you will need in that folder
5) There is a file called `toolkit.config.js` and inside there you should change these to YOUR values
    ```root: "sample",
    baseUrl: "https://domain.com",
    siteName: "site-name",
    authorName: "author-name",
    organizationName: "organization-name",
    ```
    and a little further down:
    ```defaultDescription: "global-site-description",
    images: {
        social: "https://domain.com/assets/social-card.png",
        logo: "https://domain.com/assets/logo.png"
    },
    ```



## Running tasks
- ADA is `npm run ada`
- SEO is `npm run seo`
- Social (OG/Twitter) is `npm run social`
- Minify is `npm run minify`
- Prettify is `npm run pretty`
- Add Schema is `npm run schema` 
- Site Auditor for bad links is `npm run links` 
- Breadcrumb maker is `npm run breadcrumbs` 
- Sitemapper is `npm run sitemap`
- Build (most, not minified or validated link check) is `npm run build`

### Description
    seo        → doctype, lang, charset, viewport, title, description, robots, canonical, theme-color 
    social     → Open Graph + Twitter/X Cards only 
    schema     → JSON-LD only 
    ada        → accessibility attribute fixes 
    breadcrumbs→ visible breadcrumb navigation 
    sitemap    → sitemap.xml + robots.txt 
    links      → audit/report broken internal links, duplicate IDs, missing anchors and makes a `reports/links-report.json`
    pretty     → format files 
    minify     → minify HTML + JS 


    ## License

  

FREEEEEEEEEE

  

###### More of me

  

[Weaponized UX](https://timhunold.medium.com/weaponized-ux-ui-sniping-your-way-to-higher-conversions-def0d62f22df) | [Dev.to](https://dev.to/codeposse) | [Medium](https://medium.com/@timhunold) | [LinkedIn](https://www.linkedin.com/in/itssobig/) | [StackOverflow](https://stackoverflow.com/users/4071647/codeposse) | [Insta](https://www.instagram.com/pup90210/) | [I actually race](https://scca.com/beverlyhills)

  

[repo]: https://github.com/CodePosse/toolbox.git

[tim hunold]: https://www.itssobig.com/

[node.js]: https://nodejs.org