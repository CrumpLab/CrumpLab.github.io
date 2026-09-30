## crumplab.com

This repository contains the source code for rendering the lab website for Matt Crump's Computational Cognition Lab at Brooklyn College. 

<https://crumplab.com>

This website is built using Quarto. Run `quarto render` to build the site into `docs/`, which GitHub Pages serves.

- `_quarto.yml`: site configuration (navbar, theme, freeze)
- `_assets/`: site theme (`theme.scss`) and the banner title block (`title-block.html`)
- `listings/`: YAML data and the card template for the Courses, Fun, and home page listings
- `blog/`, `people/`, `publications/`: blog posts, lab member pages, and publication data
- `_freeze/`: stored R results, so old pages don't re-run their code on every render

See `CLAUDE.md` for more detail on where content lives and how pages are put together.
