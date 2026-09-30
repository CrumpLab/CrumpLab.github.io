# crumplab.com

Quarto website for Matt Crump's Computational Cognition Lab. Served by GitHub
Pages from the `docs/` folder on `master`, with the custom domain in `docs/CNAME`.

## Rendering and publishing

- `quarto render` renders the whole site into `docs/`. `quarto preview` serves it locally.
- `docs/` is generated output. Never edit it by hand. Commit it together with the source change that produced it.
- A change to `_quarto.yml` (navbar, theme, etc.) affects every page, so it needs a full `quarto render`.
- `execute: freeze: auto` is on. R code only re-runs when a page's source changes, and the stored results live in `_freeze/`, which is committed. If a post's R code has to re-run, run `quarto render <path>` for that post.
- Publications.qmd needs the lab's own R package `crumplabr` (`crumplabr::bib_2_pub_list`) to render.

## Where content lives

| To change... | Edit |
|---|---|
| Navbar, site title, theme | `_quarto.yml` |
| Site-wide styles | `_assets/theme.scss` |
| Home page cards (the "Pages" grid) | the `listing` in `index.qmd`; extra cards in `listings/front-page.yaml` |
| Courses | `listings/courses.yaml` |
| Fun page | `listings/fun.yaml` |
| Apps, Books, Opportunities | the markdown in `Apps.qmd`, `Books.qmd`, `Opportunities.qmd` |
| Lab members | `people/*.qmd` (one file per current member, `order:` sets position); past members are listed in `People.qmd` |
| Publications | `publications/Crump/Crump.bib` + `Crump.yml` (published), `publications/Crump_In_progress/` (forthcoming); PDFs go in each `files/` folder |
| Blog posts | `blog/<NNN_slug>/index.qmd` |

## Conventions

- **Page banners:** top-level pages set `banner: images/<name>_banner.jpg` (plus `image:` for the home grid and social cards) in their front matter; `banner-wide: true` lets it span the full page (home page). `_assets/title-block.html` shows the banner in place of the visible title. Don't add CSS or R chunks to hide titles.
- **Card listings:** Courses and Fun use `listings/card-list.ejs`. Each YAML item takes `title`, `description`, `image`, and optionally `url` and `keywords`.
- **Apps and Books entries** use a 70/30 `columns` layout: text on the left, image on the right (`![](images/x.png){width="100px"}` for apps, `200px` for books). Copy an existing entry when adding one.
- **Images** for top-level pages go in `images/`. Blog posts keep their images inside their own folder.
- **Blog posts:** new folders take the next number in the existing scheme. Recent posts enable giscus comments with `comments: giscus: repo: CrumpLab/crumplab_comments`.
- The owner edits in RStudio's visual editor (`editor: visual`), which may reformat markdown (e.g. `:::` fence lengths). That's expected.
