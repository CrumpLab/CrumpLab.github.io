## crumplab.com

This repository contains the source code for rendering the lab website for Matt Crump's Computational Cognition Lab at Brooklyn College. 

<https://crumplab.com>

This website is built using Quarto. Run `quarto render` to build the site into `docs/`, which GitHub Pages serves.

- `_quarto.yml`: site configuration (navbar, theme, freeze)
- `_assets/`: site theme (`theme.scss`) and the banner title block (`title-block.html`)
- `home/`: styles, listing templates, and R helpers for the home page (`index.qmd`)
- `people-page/`: styles and listing templates for the People page
- `blog-page/`: listing template, filter script, and styles for the Blog page
- `fun-page/`: listing template and styles for the Fun page
- `join-page/`: listing template and styles for the Join (Opportunities) page
- `apps-page/`: listing templates and styles for the Apps page
- `courses-page/`: listing templates and styles for the Courses page
- `books-page/`: listing templates and styles for the Books page
- `pubs-page/`: the R helper and styles that build the Publications page from the .bib files
- `listings/`: YAML data for the Apps, Books, Courses, Fun, and former lab member listings
- `blog/`, `people/`, `publications/`: blog posts, lab member pages, and publication data
- `_freeze/`: stored R results, so old pages don't re-run their code on every render

See `CLAUDE.md` for more detail on where content lives and how pages are put together.
