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
| Fun page | `listings/fun.yaml` |
| Apps, Books, Opportunities | the markdown in `Apps.qmd`, `Books.qmd`, `Opportunities.qmd` |
| Lab members | current: `people/*.qmd` (one file per member, `order:` sets position); former: `listings/alumni.yaml` |
| Publications | `publications/Crump/Crump.bib` + `Crump.yml` (published), `publications/Crump_In_progress/` (forthcoming); PDFs go in each `files/` folder, matched to the bib entry's `file` field by file name |
| Blog posts | `blog/<NNN_slug>/index.qmd` |

## Conventions

- **Page banners:** top-level pages set `banner: images/<name>_banner.jpg` (plus `image:` for social cards) in their front matter. `_assets/title-block.html` shows the banner in place of the visible title. Don't add CSS or R chunks to hide titles.
- **Home page:** `index.qmd` is one scrolling page of cards, one per section, each linking to its full page (`page-layout: custom`, `hide-title-block: true`). Recent publications come from the .bib files through `home/helpers.R`. The latest 3 blog posts, 4 courses and the Fun items are Quarto listings using `home/posts.ejs` and `home/cards.ejs`. Books, software, and people are hand-written in `index.qmd`, so update them there when the full pages change. Card colours (`.c-pink`, `.c-violet`, ...) come from the logo's hexagon spectrum.
- **People page:** `People.qmd` uses the home page's card styles plus `people-page/people.css`. Current members come from `people/*.qmd` (`people-page/members.ejs`). Former members are rows in `listings/alumni.yaml` with `level` (postdoc, doctoral, masters, or undergraduate), `name`, `url`, `years`, and either `now` (graduate alumni) or `role`/`projects`/`details`. `people-page/alumni-table.ejs` turns them into the filterable directory, so the counts and filters update on their own. Add new alumni at the top of their level. In these templates `<%= %>` outputs HTML as-is and `<%- %>` escapes it.
- **Publications page:** `Publications.qmd` calls `pubs-page/pubs.R`, which reads both .bib files with `bib2df`, formats each citation (APA-style initials, Crump in bold), and adds link chips: pdf (only when the file exists), doi (or url), plus any links for that key in the matching .yml (`name`, `url`). Papers are grouped by year under a sticky jump bar. Styles are in `pubs-page/pubs.css`, on top of `home/home.css` and `people-page/people.css`.
- **Card listings:** Courses and Fun use `listings/card-list.ejs`. Each YAML item takes `title`, `description`, `image`, and optionally `url` and `keywords`.
- **Apps and Books entries** use a 70/30 `columns` layout: text on the left, image on the right (`![](images/x.png){width="100px"}` for apps, `200px` for books). Copy an existing entry when adding one.
- **Images** for top-level pages go in `images/`. Blog posts keep their images inside their own folder.
- **Blog posts:** new folders take the next number in the existing scheme. Recent posts enable giscus comments with `comments: giscus: repo: CrumpLab/crumplab_comments`.
- The owner edits in RStudio's visual editor (`editor: visual`), which may reformat markdown (e.g. `:::` fence lengths). That's expected.
