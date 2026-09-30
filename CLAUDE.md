# crumplab.com

Quarto website for Matt Crump's Computational Cognition Lab. Served by GitHub
Pages from the `docs/` folder on `master`, with the custom domain in `docs/CNAME`.

## Rendering and publishing

- `quarto render` renders the whole site into `docs/`. `quarto preview` serves it locally.
- `docs/` is generated output. Never edit it by hand. Commit it together with the source change that produced it.
- A change to `_quarto.yml` (navbar, theme, etc.) affects every page, so it needs a full `quarto render`.
- `execute: freeze: auto` is on. R code only re-runs when a page's source changes, and the stored results live in `_freeze/`, which is committed. If a post's R code has to re-run, run `quarto render <path>` for that post.
- Publications.qmd and the home page need the R packages `bib2df` and `yaml`. Two older blog posts use the lab's own `crumplabr` package, but their results are frozen.

## Where content lives

| To change... | Edit |
|---|---|
| Navbar, site title, theme | `_quarto.yml` |
| Site-wide styles | `_assets/theme.scss` |
| Home page | `index.qmd` (sections as cards), styles in `home/home.css` |
| Courses | `listings/courses.yaml` |
| Fun | `listings/fun.yaml` |
| Books | `listings/books.yaml` (one entry per book, in page order) |
| Apps | `listings/apps.yaml` (one entry per project, in page order) |
| Join / Opportunities | `Opportunities.qmd` (status text, terminal readout); mentored counts come from `listings/alumni.yaml` |
| Lab members | current: `people/*.qmd` (one file per member, `order:` sets position); former: `listings/alumni.yaml` |
| Publications | `publications/Crump/Crump.bib` + `Crump.yml` (published), `publications/Crump_In_progress/` (forthcoming); PDFs go in each `files/` folder, matched to the bib entry's `file` field by file name |
| Blog posts | `blog/<NNN_slug>/index.qmd` (the Blog page lists them automatically) |

## Conventions

- **Page banners:** top-level pages set `banner: images/<name>_banner.jpg` (plus `image:` for social cards) in their front matter. `_assets/title-block.html` shows the banner in place of the visible title. Don't add CSS or R chunks to hide titles.
- **Home page:** `index.qmd` is one scrolling page of cards, one per section, each linking to its full page (`page-layout: custom`, `hide-title-block: true`). Recent publications come from the .bib files through `home/helpers.R`. The latest 3 blog posts, 4 courses and the Fun items are Quarto listings using `home/posts.ejs` and `home/cards.ejs`. Books, software, and people are hand-written in `index.qmd`, so update them there when the full pages change. Card colours (`.c-pink`, `.c-violet`, ...) come from the logo's hexagon spectrum.
- **People page:** `People.qmd` uses the home page's card styles plus `people-page/people.css`. Current members come from `people/*.qmd` (`people-page/members.ejs`). Former members are rows in `listings/alumni.yaml` with `level` (postdoc, doctoral, masters, or undergraduate), `name`, `url`, `years`, and either `now` (graduate alumni) or `role`/`projects`/`details`. `people-page/alumni-table.ejs` turns them into the filterable directory, so the counts and filters update on their own. Add new alumni at the top of their level. In these templates `<%= %>` outputs HTML as-is and `<%- %>` escapes it.
- **Publications page:** `Publications.qmd` calls `pubs-page/pubs.R`, which reads both .bib files with `bib2df`, formats each citation (APA-style initials, Crump in bold), and adds link chips: pdf (only when the file exists), doi (or url), plus any links for that key in the matching .yml (`name`, `url`). Papers are grouped by year under a sticky jump bar. Styles are in `pubs-page/pubs.css`, on top of `home/home.css` and `people-page/people.css`.
- **Courses page:** `Courses.qmd` lists `listings/courses.yaml` with `courses-page/levels.ejs` (one card per level, each a grid of course tiles) and `courses-page/stats.ejs` (the counts line). Each course takes `title` ("Psyc 2530: Name (format)"), `url`, `image`, `description` (markdown links are turned into real links), and `keywords`. The template reads the keywords: `Undergraduate`, `Graduate` (master's), or `Doctoral` sets the level; a term like `Fall 2023` or `2020-2021` sets the term; `OER` adds the OER tag; anything else shows as a plain tag. The course code and format come from the title. A course without an image, or using `images/course_placeholder.png`, gets a course-code tile. Styles are in `courses-page/courses.css`.
- **Join page:** `Opportunities.qmd` (navbar label "Join") shows a terminal readout (raw HTML block: lab, status, until, why, contact), the status paragraph, a mentored-by-level card built from `listings/alumni.yaml` by `join-page/levels.ejs`, and a contact card. When the lab's status changes, update both the terminal lines and the status paragraph. The undergraduate, master's, doctoral, and entry-assignment sections are kept in an HTML comment at the end of the file. They're hidden on screen but still present in the page source. Styles are in `join-page/join.css`.
- **Blog page:** `Blog.qmd` lists the `blog/` folder (newest first, drafts hidden) with `blog-page/latest.ejs`. It shows the three newest posts as cards, then an index of every post with the ten most-used categories as filter buttons, clickable tags, and a grep search. `blog-page/filter.html` runs the filters and reads the `#category=...` links that posts' category tags point to (Quarto sends those to the home page, because its latest-posts listing also includes the posts; `home/category-redirect.html` forwards them to `Blog.html`). Categories are matched case-insensitively. Keep the file named `Blog.qmd` with `feed: true` so the RSS feed stays at `Blog.xml`. Styles are in `blog-page/blog.css`.
- **Fun page:** `Fun.qmd` lists `listings/fun.yaml` with `fun-page/directory.ejs`, a compact directory with one row per item: thumbnail, title, description (markdown links are turned into real links), bracketed keywords, and a visit chip. Each item takes `title`, `description`, `url`, `image`, and `keywords`. Styles are in `fun-page/fun.css`.
- **Apps page:** `Apps.qmd` lists `listings/apps.yaml` with `apps-page/directory.ejs` (section filters, a grep search box, one row per project) and `apps-page/stats.ejs` (the counts line). Each entry takes `category` (the section: Audio Plugins, R Packages, Shiny Apps, or R Markdown templates; a new name adds a new filter), `name`, `url`, optionally `image`, `tagline`, `about` (a list of paragraphs, HTML links allowed), `links` (`label` + `url`; labels: manual, source, app, osf, link), and `notes`. Use `about`, not `description`: Quarto treats `description` as a single string. The main link's chip is labelled source for GitHub, app for shinyapps.io, and site otherwise; a link with the same URL relabels it. Projects without an image get a glyph tile. Styles are in `apps-page/apps.css`.
- **Books page:** `Books.qmd` lists `listings/books.yaml` with `books-page/shelf.ejs` (the covers shelf plus one card per book) and `books-page/stats.ejs` (the counts line). Each entry takes `title`, `url`, `image` (cover in `images/`), and optionally `tagline`, `description`, `credits` (list of `role` + `names`), `notes`, `built`, `source`, `license` + `license_url`, and `citation`. `description`, `notes`, and `citation` may contain HTML links. Styles are in `books-page/books.css`.
- **Images** for top-level pages go in `images/`. Blog posts keep their images inside their own folder.
- **Blog posts:** new folders take the next number in the existing scheme. Recent posts enable giscus comments with `comments: giscus: repo: CrumpLab/crumplab_comments`.
- The owner edits in RStudio's visual editor (`editor: visual`), which may reformat markdown (e.g. `:::` fence lengths). That's expected.
