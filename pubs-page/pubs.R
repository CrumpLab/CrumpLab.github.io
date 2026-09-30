# Publications page helpers (Publications.qmd). Reads the .bib and .yml
# files in publications/ and prints styled HTML: one row per paper with a
# formatted citation and [ pdf ] / [ doi ] / extra link chips.

esc <- function(x) {
  x <- gsub("&", "&amp;", x, fixed = TRUE)
  x <- gsub("<", "&lt;", x, fixed = TRUE)
  gsub(">", "&gt;", x, fixed = TRUE)
}

debrace <- function(x) gsub("[{}]", "", x)

# 1--20 -> 1–20
dashes <- function(x) gsub("-{1,2}", "\u2013", x)

col <- function(df, name) if (name %in% names(df)) df[[name]] else rep(NA, nrow(df))

# Entries without a URL but with a JSTOR eprint link to the JSTOR page.
eprint_url <- function(url, eprint, type) {
  if (!is.na(url) || is.na(eprint)) return(url)
  if (!is.na(type) && tolower(type) == "jstor") return(paste0("https://www.jstor.org/stable/", eprint))
  url
}

read_source <- function(bib, yml, pdf_dir, status) {
  df <- suppressWarnings(suppressMessages(bib2df::bib2df(bib)))
  links <- if (file.exists(yml)) yaml::read_yaml(yml) else list()
  pdfs <- list.files(pdf_dir, recursive = TRUE)
  lapply(seq_len(nrow(df)), function(i) {
    row <- df[i, ]
    file <- col(df, "FILE")[i]
    pdf <- NA
    if (!is.na(file)) {
      hit <- pdfs[basename(pdfs) == basename(file)]
      if (length(hit)) pdf <- utils::URLencode(file.path(pdf_dir, hit[1]))
    }
    list(
      key = row$BIBTEXKEY,
      type = trimws(tolower(row$CATEGORY)),
      status = status,
      year = substr(row$DATE, 1, 4),
      date = row$DATE,
      title = debrace(row$TITLE),
      authors = row$AUTHOR[[1]],
      journal = debrace(c(col(df, "JOURNALTITLE")[i], col(df, "JOURNAL")[i])[!is.na(c(col(df, "JOURNALTITLE")[i], col(df, "JOURNAL")[i]))][1]),
      booktitle = debrace(col(df, "BOOKTITLE")[i]),
      publisher = debrace(col(df, "PUBLISHER")[i]),
      volume = col(df, "VOLUME")[i],
      number = col(df, "NUMBER")[i],
      pages = dashes(col(df, "PAGES")[i]),
      # some DOIs are stored as full https://doi.org/... addresses
      doi = sub("^https?://(dx\\.)?doi\\.org/", "", col(df, "DOI")[i]),
      url = eprint_url(col(df, "URL")[i], col(df, "EPRINT")[i], col(df, "EPRINTTYPE")[i]),
      pdf = pdf,
      extra = links[[row$BIBTEXKEY]]
    )
  })
}

read_all_pubs <- function() {
  pubs <- c(
    read_source("publications/Crump_In_progress/Crump_In_progress.bib",
                "publications/Crump_In_progress/Crump_In_progress.yml",
                "publications/Crump_In_progress/files", "forthcoming"),
    read_source("publications/Crump/Crump.bib", "publications/Crump/Crump.yml",
                "publications/Crump/files", "published")
  )
  pubs[order(vapply(pubs, function(p) p$date, ""), decreasing = TRUE)]
}

# "Crump, M. J. C." from "Crump, Matthew J.C." or "Matthew J.C. Crump"
apa_name <- function(a) {
  a <- trimws(a)
  if (grepl(",", a)) {
    last <- trimws(sub(",.*$", "", a)); given <- trimws(sub("^[^,]*,", "", a))
  } else {
    last <- sub("^.*\\s", "", a); given <- trimws(sub("\\s*\\S+$", "", a))
  }
  initials <- regmatches(given, gregexpr("\\p{Lu}", given, perl = TRUE))[[1]]
  name <- if (length(initials)) paste0(last, ", ", paste0(initials, ".", collapse = " ")) else last
  if (last == "Crump") paste0("<strong>", esc(name), "</strong>") else esc(name)
}

apa_authors <- function(authors) {
  n <- vapply(authors, apa_name, "")
  if (length(n) == 1) return(n)
  if (length(n) == 2) return(paste0(n[1], ", &amp; ", n[2]))
  paste0(paste(n[-length(n)], collapse = ", "), ", &amp; ", n[length(n)])
}

type_label <- function(p) {
  switch(p$type,
         article = "article", book = "book", incollection = "chapter",
         inproceedings = "proceedings", p$type)
}

type_group <- function(p) {
  if (p$status == "forthcoming") return("forthcoming")
  switch(p$type, article = "articles", book = "books", incollection = "books",
         inproceedings = "proceedings", "other")
}

venue <- function(p) {
  bits <- character(0)
  if (p$type %in% c("incollection", "inproceedings") && !is.na(p$booktitle)) {
    v <- paste0("In <em>", esc(p$booktitle), "</em>")
    if (!is.na(p$pages)) v <- paste0(v, " (pp. ", esc(p$pages), ")")
    bits <- c(bits, v)
    if (!is.na(p$publisher)) bits <- c(bits, esc(p$publisher))
  } else if (!is.na(p$journal)) {
    v <- paste0("<em>", esc(p$journal))
    if (!is.na(p$volume)) v <- paste0(v, ", ", esc(p$volume))
    v <- paste0(v, "</em>")
    if (!is.na(p$number)) v <- paste0(v, "(", esc(p$number), ")")
    if (!is.na(p$pages)) v <- paste0(v, ", ", esc(p$pages))
    bits <- c(bits, v)
  } else if (!is.na(p$publisher)) {
    bits <- c(bits, esc(p$publisher))
  }
  paste(bits, collapse = ". ")
}

link_chips <- function(p) {
  chips <- character(0)
  add <- function(label, href) chips <<- c(chips, sprintf('<a class="pchip" href="%s">%s</a>', esc(href), label))
  if (!is.na(p$pdf)) add("pdf", p$pdf)
  if (!is.na(p$doi)) add("doi", paste0("https://doi.org/", p$doi))
  else if (!is.na(p$url)) add("link", p$url)
  for (l in p$extra) add(esc(tolower(gsub("([a-z])([A-Z])", "\\1 \\2", l$name))), l$url)
  paste(chips, collapse = "")
}

pub_row <- function(p) {
  main_link <- if (!is.na(p$doi)) paste0("https://doi.org/", p$doi) else if (!is.na(p$url)) p$url else if (!is.na(p$pdf)) p$pdf else NA
  title <- if (is.na(main_link)) esc(p$title) else sprintf('<a href="%s">%s</a>', esc(main_link), esc(p$title))
  status <- if (p$status == "forthcoming") '<span class="ptag ptag-soon">forthcoming</span>' else ""
  search <- tolower(paste(p$title, paste(p$authors, collapse = " "), p$journal, p$booktitle, p$year))
  sprintf(paste0(
    '<div class="prow" data-group="%s" data-year="%s" data-search="%s">',
    '<div class="pyear">%s</div>',
    '<div class="pmain"><div class="ptitle">%s</div>',
    '<div class="pauthors">%s</div>',
    '<div class="pvenue">%s<span class="ptag%s">%s</span>%s</div></div>',
    '<div class="plinks">%s</div></div>'),
    type_group(p), p$year, esc(gsub('"', "", search)), p$year, title, apa_authors(p$authors),
    venue(p), if (nzchar(venue(p))) "" else " ptag-first", type_label(p), status, link_chips(p))
}

counts <- function(pubs) {
  g <- vapply(pubs, type_group, "")
  list(all = length(pubs), forthcoming = sum(g == "forthcoming"), articles = sum(g == "articles"),
       books = sum(g == "books"), proceedings = sum(g == "proceedings"), other = sum(g == "other"),
       first = min(as.integer(vapply(pubs, function(p) p$year, ""))))
}

stats_line <- function(pubs = read_all_pubs()) {
  k <- counts(pubs)
  cat(sprintf(paste0('<div class="stats-line"><span><b>%d</b> publications</span><span><b>%d</b> articles</span>',
                     '<span><b>%d</b> books &amp; chapters</span><span><b>%d</b> forthcoming</span>',
                     '<span>since <b>%d</b></span></div>'),
              k$all, k$articles, k$books, k$forthcoming, k$first))
}

# ---- the page: a year jump bar, then each year's papers on an ASCII branch ----
pub_timeline <- function(pubs = read_all_pubs()) {
  years <- unique(vapply(pubs, function(p) p$year, ""))
  cat('<nav class="yearbar" aria-label="Jump to year">',
      paste0('<a href="#y', years, '">', years, '</a>', collapse = ""), '</nav>', sep = "")
  cat('<div class="card c-blue pub-timeline">')
  for (y in years) {
    these <- Filter(function(p) p$year == y, pubs)
    cat(sprintf('<section class="tl-year" id="y%s"><div class="tl-label">%s<span>%d %s</span></div><div class="tl-items">', y, y, length(these), if (length(these) == 1) "paper" else "papers"))
    for (i in seq_along(these)) {
      cat(sprintf('<div class="tl-item"><span class="tl-branch">%s</span>%s</div>',
                  if (i == length(these)) "└─" else "├─", pub_row(these[[i]])))
    }
    cat('</div></section>')
  }
  cat('</div>')
}
